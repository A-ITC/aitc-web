"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiBaseUrl, authOrigin } from "./api-config";

const STORAGE_KEY = "aitcAccessToken";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_TOKEN_LENGTH = 8192;

export type DiscordProfile = {
  username: string | null;
  avatarUrl: string | null;
};

export type DiscordProfileStatus = "idle" | "loading" | "ready";

export type AuthStatus =
  | "checking"
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "error";

type AuthMessage = {
  type?: unknown;
  attempt?: unknown;
  accessToken?: unknown;
};

function removeStoredToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function parseDiscordProfile(body: unknown): DiscordProfile {
  if (typeof body !== "object" || body === null) {
    return { username: null, avatarUrl: null };
  }

  const candidate = body as Record<string, unknown>;
  const username =
    typeof candidate.username === "string" &&
    candidate.username.length >= 2 &&
    candidate.username.length <= 32
      ? candidate.username
      : null;

  let avatarUrl: string | null = null;
  if (typeof candidate.avatar_url === "string") {
    try {
      const url = new URL(candidate.avatar_url);
      if (url.protocol === "https:" && url.hostname === "cdn.discordapp.com") {
        avatarUrl = url.toString();
      }
    } catch {
      // An invalid or unsupported URL is rendered with the fallback avatar.
    }
  }

  return { username, avatarUrl };
}

type ProfileRequestResult =
  | { kind: "ready"; profile: DiscordProfile }
  | { kind: "unavailable" }
  | { kind: "unauthorized" };

async function requestDiscordProfile(
  accessToken: string,
  signal: AbortSignal,
): Promise<ProfileRequestResult> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (response.status === 401 || response.status === 403) {
    return { kind: "unauthorized" };
  }
  if (!response.ok) return { kind: "unavailable" };

  try {
    const body: unknown = await response.json();
    return { kind: "ready", profile: parseDiscordProfile(body) };
  } catch {
    return { kind: "unavailable" };
  }
}

export function useDiscordAuth() {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [profileStatus, setProfileStatus] =
    useState<DiscordProfileStatus>("idle");
  const popupCleanupRef = useRef<(() => void) | null>(null);
  const profileRequestRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const stopPopupFlow = useCallback(() => {
    popupCleanupRef.current?.();
    popupCleanupRef.current = null;
  }, []);

  const showError = useCallback(() => {
    if (mountedRef.current) setStatus("error");
  }, []);

  const invalidateAuthentication = useCallback(() => {
    stopPopupFlow();
    profileRequestRef.current?.abort();
    try {
      removeStoredToken();
    } catch {
      // State still changes so the page never treats an unreadable token as valid.
    }
    if (mountedRef.current) {
      setAccessToken(null);
      setProfile(null);
      setProfileStatus("idle");
      setStatus("unauthenticated");
    }
  }, [stopPopupFlow]);

  const loadProfile = useCallback(
    async (token: string) => {
      profileRequestRef.current?.abort();
      const controller = new AbortController();
      profileRequestRef.current = controller;

      if (mountedRef.current) {
        setProfile(null);
        setProfileStatus("loading");
      }

      try {
        const result = await requestDiscordProfile(token, controller.signal);
        if (!mountedRef.current || controller.signal.aborted) return;

        if (result.kind === "unauthorized") {
          invalidateAuthentication();
          return;
        }

        setProfile(
          result.kind === "ready"
            ? result.profile
            : { username: null, avatarUrl: null },
        );
        setProfileStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!mountedRef.current) return;

        setProfile({ username: null, avatarUrl: null });
        setProfileStatus("ready");
      } finally {
        if (profileRequestRef.current === controller) {
          profileRequestRef.current = null;
        }
      }
    },
    [invalidateAuthentication],
  );

  const authenticateWithToken = useCallback(
    (token: string) => {
      setAccessToken(token);
      setStatus("authenticated");
      void loadProfile(token);
    },
    [loadProfile],
  );

  useEffect(() => {
    mountedRef.current = true;

    try {
      const storedToken = sessionStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        setStatus("unauthenticated");
      } else {
        authenticateWithToken(storedToken);
      }
    } catch {
      showError();
    }

    return () => {
      mountedRef.current = false;
      stopPopupFlow();
      profileRequestRef.current?.abort();
    };
  }, [authenticateWithToken, showError, stopPopupFlow]);

  const startAuthentication = useCallback(() => {
    stopPopupFlow();
    profileRequestRef.current?.abort();

    if (typeof crypto.randomUUID !== "function") {
      showError();
      return;
    }

    const attempt = crypto.randomUUID();
    const loginUrl = new URL("/auth/login", authOrigin);
    loginUrl.searchParams.set("return_origin", window.location.origin);
    loginUrl.searchParams.set("attempt", attempt);

    const popup = window.open(
      loginUrl,
      "aitcDiscordOAuth",
      "popup=yes,width=520,height=720",
    );

    if (!popup) {
      showError();
      return;
    }

    setStatus("authenticating");

    let finished = false;
    let closeTimer = 0;
    let timeoutTimer = 0;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      window.removeEventListener("message", receiveAuthResult);
      window.clearInterval(closeTimer);
      window.clearTimeout(timeoutTimer);
      if (!popup.closed) popup.close();
    };

    const fail = () => {
      cleanup();
      popupCleanupRef.current = null;
      showError();
    };

    const receiveAuthResult = (event: MessageEvent<unknown>) => {
      if (event.origin !== authOrigin) return;
      if (event.source !== popup) return;
      if (typeof event.data !== "object" || event.data === null) return;

      const message = event.data as AuthMessage;
      if (message.attempt !== attempt) return;

      if (message.type === "AITC_AUTH_ERROR") {
        fail();
        return;
      }

      if (message.type !== "AITC_AUTH_SUCCESS") return;
      if (
        typeof message.accessToken !== "string" ||
        message.accessToken.length === 0 ||
        message.accessToken.length > MAX_TOKEN_LENGTH
      ) {
        fail();
        return;
      }

      cleanup();
      popupCleanupRef.current = null;

      try {
        sessionStorage.setItem(STORAGE_KEY, message.accessToken);
      } catch {
        showError();
        return;
      }

      authenticateWithToken(message.accessToken);
    };

    window.addEventListener("message", receiveAuthResult);
    closeTimer = window.setInterval(() => {
      if (popup.closed) fail();
    }, 500);
    timeoutTimer = window.setTimeout(fail, AUTH_TIMEOUT_MS);
    popupCleanupRef.current = cleanup;
  }, [authenticateWithToken, showError, stopPopupFlow]);

  const logout = useCallback(() => {
    invalidateAuthentication();
  }, [invalidateAuthentication]);

  return {
    accessToken,
    profile,
    profileStatus,
    status,
    startAuthentication,
    logout,
    invalidateAuthentication,
  };
}
