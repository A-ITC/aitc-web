"use client";

import type { AuthStatus } from "@/lib/discord-auth";

export function MembersOnlyAuthPanel({
  status,
  onAuthenticate,
}: {
  status: AuthStatus;
  onAuthenticate: () => void;
}) {
  if (status === "checking") {
    return (
      <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12 [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-2xl [&_h2]:tracking-tighter md:[&_h2]:text-3xl [&_p]:mt-0 [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-slate-500" aria-live="polite">
        <span className="grid size-14 animate-spin place-items-center rounded-full border-4 border-slate-200 border-t-orange-400 font-['DM_Mono',monospace] text-3xl leading-none font-bold motion-reduce:animate-none" aria-hidden="true" />
        <h2>認証状態を確認しています</h2>
        <p>しばらくお待ちください。</p>
      </div>
    );
  }

  if (status === "authenticating") {
    return (
      <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12 [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-2xl [&_h2]:tracking-tighter md:[&_h2]:text-3xl [&_p]:mt-0 [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-slate-500" aria-live="polite">
        <span className="grid size-14 animate-spin place-items-center rounded-full border-4 border-slate-200 border-t-orange-400 font-['DM_Mono',monospace] text-3xl leading-none font-bold motion-reduce:animate-none" aria-hidden="true" />
        <h2>Discordで認証を進めてください</h2>
        <p>開いた画面で認証を完了してください。</p>
        <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-60" disabled>
          認証待機中
        </button>
      </div>
    );
  }

  return (
    <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12 [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-2xl [&_h2]:tracking-tighter md:[&_h2]:text-3xl [&_p]:mt-0 [&_p]:mb-6 [&_p]:leading-relaxed [&_p]:text-slate-500" role={status === "error" ? "alert" : undefined}>
      <span className={`grid size-14 place-items-center rounded-full font-['DM_Mono',monospace] text-3xl leading-none font-bold ${status === "error" ? "bg-red-50 text-red-800" : "bg-slate-900 text-white"}`} aria-hidden="true">
        {status === "error" ? "!" : "↗"}
      </span>
      <h2>{status === "error" ? "認証に失敗しました" : "Discord認証が必要です"}</h2>
      <p>
        {status === "error"
          ? "認証を完了できませんでした。時間をおいて、もう一度お試しください。"
          : "AITC Discordサーバーの所属認証後に閲覧できます。"}
      </p>
      <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 disabled:cursor-wait disabled:opacity-60" onClick={onAuthenticate}>
        {status === "error" ? "もう一度認証する" : "Discordで認証"}
      </button>
    </div>
  );
}
