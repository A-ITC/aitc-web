"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiBaseUrl, authOrigin } from "./api-config";

const STORAGE_KEY = "aitcAccessToken";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_TOKEN_LENGTH = 8192;

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

type UseDiscordAuthOptions = {
  validateStoredToken?: boolean;
};

function removeStoredToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

async function verifyAccessToken(
  accessToken: string,
  signal: AbortSignal,
): Promise<boolean> {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) return false;

  const body: unknown = await response.json();
  return (
    typeof body === "object" &&
    body !== null &&
    "authenticated" in body &&
    body.authenticated === true
  );
}

export function useDiscordAuth({
  validateStoredToken = false,
}: UseDiscordAuthOptions = {}) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const popupCleanupRef = useRef<(() => void) | null>(null);
  const validationRef = useRef<AbortController | null>(null);
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
    validationRef.current?.abort();
    try {
      removeStoredToken();
    } catch {
      // State still changes so the page never treats an unreadable token as valid.
    }
    if (mountedRef.current) {
      setAccessToken(null);
      setStatus("unauthenticated");
    }
  }, [stopPopupFlow]);

  const validateAndAuthenticate = useCallback(
    async (token: string) => {
      validationRef.current?.abort();
      const controller = new AbortController();
      validationRef.current = controller;

      if (mountedRef.current) setStatus("checking");

      try {
        const authenticated = await verifyAccessToken(token, controller.signal);
        if (!mountedRef.current || controller.signal.aborted) return;

        if (authenticated) {
          setAccessToken(token);
          setStatus("authenticated");
          return;
        }

        removeStoredToken();
        setAccessToken(null);
        showError();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!mountedRef.current) return;

        try {
          removeStoredToken();
        } catch {
          // The same generic error is shown when browser storage is unavailable.
        }
        setAccessToken(null);
        showError();
      } finally {
        if (validationRef.current === controller) {
          validationRef.current = null;
        }
      }
    },
    [showError],
  );

  useEffect(() => {
    mountedRef.current = true;

    try {
      const storedToken = sessionStorage.getItem(STORAGE_KEY);
      if (!storedToken) {
        setStatus("unauthenticated");
      } else if (validateStoredToken) {
        void validateAndAuthenticate(storedToken);
      } else {
        setAccessToken(storedToken);
        setStatus("authenticated");
      }
    } catch {
      showError();
    }

    return () => {
      mountedRef.current = false;
      stopPopupFlow();
      validationRef.current?.abort();
    };
  }, [
    showError,
    stopPopupFlow,
    validateAndAuthenticate,
    validateStoredToken,
  ]);

  const startAuthentication = useCallback(() => {
    stopPopupFlow();
    validationRef.current?.abort();

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

      void validateAndAuthenticate(message.accessToken);
    };

    window.addEventListener("message", receiveAuthResult);
    closeTimer = window.setInterval(() => {
      if (popup.closed) fail();
    }, 500);
    timeoutTimer = window.setTimeout(fail, AUTH_TIMEOUT_MS);
    popupCleanupRef.current = cleanup;
  }, [showError, stopPopupFlow, validateAndAuthenticate]);

  const logout = useCallback(() => {
    invalidateAuthentication();
  }, [invalidateAuthentication]);

  return {
    accessToken,
    status,
    startAuthentication,
    logout,
    invalidateAuthentication,
  };
}
