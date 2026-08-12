"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./discord-auth-test.module.css";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://uvhug6af4a.execute-api.ap-northeast-1.amazonaws.com"
).replace(/\/$/, "");

const AUTH_ORIGIN = new URL(API_BASE_URL).origin;
const STORAGE_KEY = "aitcAccessToken";
const AUTH_TIMEOUT_MS = 5 * 60 * 1000;
const MAX_TOKEN_LENGTH = 8192;
const ERROR_MESSAGE =
  "認証を完了できませんでした。時間をおいて、もう一度お試しください。";

type AuthStatus =
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

async function isAuthenticated(
  accessToken: string,
  signal: AbortSignal,
): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
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

export function DiscordAuthTest() {
  const [status, setStatus] = useState<AuthStatus>("checking");
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

  const validateAndShowAuthenticated = useCallback(
    async (accessToken: string) => {
      validationRef.current?.abort();
      const controller = new AbortController();
      validationRef.current = controller;

      if (mountedRef.current) setStatus("checking");

      try {
        const authenticated = await isAuthenticated(
          accessToken,
          controller.signal,
        );
        if (!mountedRef.current || controller.signal.aborted) return;

        if (authenticated) {
          setStatus("authenticated");
          return;
        }

        removeStoredToken();
        showError();
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!mountedRef.current) return;

        try {
          removeStoredToken();
        } catch {
          // The same generic error is shown when browser storage is unavailable.
        }
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
      if (storedToken) {
        void validateAndShowAuthenticated(storedToken);
      } else {
        setStatus("unauthenticated");
      }
    } catch {
      showError();
    }

    return () => {
      mountedRef.current = false;
      stopPopupFlow();
      validationRef.current?.abort();
    };
  }, [showError, stopPopupFlow, validateAndShowAuthenticated]);

  const startAuthentication = useCallback(() => {
    stopPopupFlow();
    validationRef.current?.abort();

    if (typeof crypto.randomUUID !== "function") {
      showError();
      return;
    }

    const attempt = crypto.randomUUID();
    const loginUrl = new URL("/auth/login", AUTH_ORIGIN);
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
      if (event.origin !== AUTH_ORIGIN) return;
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

      void validateAndShowAuthenticated(message.accessToken);
    };

    window.addEventListener("message", receiveAuthResult);
    closeTimer = window.setInterval(() => {
      if (popup.closed) fail();
    }, 500);
    timeoutTimer = window.setTimeout(fail, AUTH_TIMEOUT_MS);
    popupCleanupRef.current = cleanup;
  }, [showError, stopPopupFlow, validateAndShowAuthenticated]);

  const clearAuthentication = useCallback(() => {
    stopPopupFlow();
    validationRef.current?.abort();
    try {
      removeStoredToken();
      setStatus("unauthenticated");
    } catch {
      showError();
    }
  }, [showError, stopPopupFlow]);

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <p className="eyebrow">AUTHENTICATION TEST</p>
        <h1>Discord OAuth認証テスト</h1>
        <p>AITC Discordサーバーの所属認証を確認します。</p>
      </div>

      <div className={styles.card} aria-live="polite">
        {status === "checking" && (
          <>
            <span className={styles.indicator} aria-hidden="true" />
            <h2>認証状態を確認しています</h2>
            <p>しばらくお待ちください。</p>
          </>
        )}

        {status === "unauthenticated" && (
          <>
            <span className={styles.symbol} aria-hidden="true">
              ↗
            </span>
            <h2>Discord認証が必要です</h2>
            <p>ボタンを押すとDiscordの認証画面が開きます。</p>
            <button className={styles.primaryButton} onClick={startAuthentication}>
              Discordで認証
            </button>
          </>
        )}

        {status === "authenticating" && (
          <>
            <span className={styles.indicator} aria-hidden="true" />
            <h2>Discordで認証を進めてください</h2>
            <p>開いた画面で認証を完了してください。</p>
            <button className={styles.primaryButton} disabled>
              認証待機中
            </button>
          </>
        )}

        {status === "authenticated" && (
          <>
            <span className={styles.success} aria-hidden="true">
              ✓
            </span>
            <h2>Discord認証済みです</h2>
            <button className={styles.secondaryButton} onClick={clearAuthentication}>
              認証情報を削除
            </button>
          </>
        )}

        {status === "error" && (
          <div role="alert">
            <span className={styles.error} aria-hidden="true">
              !
            </span>
            <h2>認証に失敗しました</h2>
            <p>{ERROR_MESSAGE}</p>
            <button className={styles.primaryButton} onClick={startAuthentication}>
              もう一度認証する
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
