"use client";

import type { AuthStatus } from "@/lib/discord-auth";
import { MembersOnlyPanel } from "./members-only-panel";
import { MembersOnlySpinner } from "./members-only-spinner";

const headingClassName =
  "mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl";
const descriptionClassName = "mt-0 mb-6 leading-relaxed text-slate-500";

export function MembersOnlyAuthPanel({
  status,
  onAuthenticate,
}: {
  status: AuthStatus;
  onAuthenticate: () => void;
}) {
  if (status === "checking") {
    return (
      <MembersOnlyPanel aria-live="polite">
        <MembersOnlySpinner />
        <h2 className={headingClassName}>認証状態を確認しています</h2>
        <p className={descriptionClassName}>しばらくお待ちください。</p>
      </MembersOnlyPanel>
    );
  }

  if (status === "authenticating") {
    return (
      <MembersOnlyPanel aria-live="polite">
        <MembersOnlySpinner />
        <h2 className={headingClassName}>Discordで認証を進めてください</h2>
        <p className={descriptionClassName}>開いた画面で認証を完了してください。</p>
        <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-60" disabled>
          認証待機中
        </button>
      </MembersOnlyPanel>
    );
  }

  return (
    <MembersOnlyPanel role={status === "error" ? "alert" : undefined}>
      <span className={`flex size-14 items-center justify-center rounded-full font-['DM_Mono',monospace] text-3xl leading-none font-bold ${status === "error" ? "bg-red-50 text-red-800" : "bg-slate-900 text-white"}`} aria-hidden="true">
        {status === "error" ? "!" : "↗"}
      </span>
      <h2 className={headingClassName}>{status === "error" ? "認証に失敗しました" : "Discord認証が必要です"}</h2>
      <p className={descriptionClassName}>
        {status === "error"
          ? "認証を完了できませんでした。時間をおいて、もう一度お試しください。"
          : "AITC Discordサーバーの所属認証後に閲覧できます。"}
      </p>
      <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-60" onClick={onAuthenticate}>
        {status === "error" ? "もう一度認証する" : "Discordで認証"}
      </button>
    </MembersOnlyPanel>
  );
}
