"use client";

import type { AuthStatus } from "@/lib/discord-auth";
import styles from "./members-only.module.css";

export function MembersOnlyAuthPanel({
  status,
  onAuthenticate,
}: {
  status: AuthStatus;
  onAuthenticate: () => void;
}) {
  if (status === "checking") {
    return (
      <div className={styles.statePanel} aria-live="polite">
        <span className={styles.indicator} aria-hidden="true" />
        <h2>認証状態を確認しています</h2>
        <p>しばらくお待ちください。</p>
      </div>
    );
  }

  if (status === "authenticating") {
    return (
      <div className={styles.statePanel} aria-live="polite">
        <span className={styles.indicator} aria-hidden="true" />
        <h2>Discordで認証を進めてください</h2>
        <p>開いた画面で認証を完了してください。</p>
        <button className={styles.primaryButton} disabled>
          認証待機中
        </button>
      </div>
    );
  }

  return (
    <div className={styles.statePanel} role={status === "error" ? "alert" : undefined}>
      <span className={status === "error" ? styles.errorMark : styles.authMark} aria-hidden="true">
        {status === "error" ? "!" : "↗"}
      </span>
      <h2>{status === "error" ? "認証に失敗しました" : "Discord認証が必要です"}</h2>
      <p>
        {status === "error"
          ? "認証を完了できませんでした。時間をおいて、もう一度お試しください。"
          : "AITC Discordサーバーの所属認証後に閲覧できます。"}
      </p>
      <button className={styles.primaryButton} onClick={onAuthenticate}>
        {status === "error" ? "もう一度認証する" : "Discordで認証"}
      </button>
    </div>
  );
}
