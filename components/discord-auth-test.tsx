"use client";

import { useDiscordAuth } from "@/lib/discord-auth";
import styles from "./discord-auth-test.module.css";

const ERROR_MESSAGE =
  "認証を完了できませんでした。時間をおいて、もう一度お試しください。";

export function DiscordAuthTest() {
  const { status, startAuthentication, logout } = useDiscordAuth({
    validateStoredToken: true,
  });

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
            <button className={styles.secondaryButton} onClick={logout}>
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
