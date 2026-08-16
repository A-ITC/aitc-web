"use client";

import { Suspense } from "react";
import { Layout } from "../common/layout";
import { MembersOnlyDirectory } from "./members-only-directory";
import { MembersOnlyDetail } from "./members-only-detail";

function PageHead({ detail = false }: { detail?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl bg-radial from-orange-200 to-transparent px-6 pt-16 pb-11 md:pt-24 md:pb-16">
      <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">MEMBERS ONLY</p>
      <h1 className="my-3 text-4xl tracking-tighter md:text-7xl">{detail ? "部員プロフィール" : "部員向けページ"}</h1>
      <p className="my-4 text-base text-slate-600">
        {detail
          ? "認証済みのAITC部員にメンバー情報と制作作品を表示します。"
          : "認証済みのAITC部員向けメンバー一覧です。"}
      </p>
    </section>
  );
}

function LoadingFallback() {
  return (
    <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12 [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h2]:text-2xl [&_h2]:tracking-tighter md:[&_h2]:text-3xl">
      <span className="grid size-14 animate-spin place-items-center rounded-full border-4 border-slate-200 border-t-orange-400 font-['DM_Mono',monospace] text-3xl leading-none font-bold motion-reduce:animate-none" aria-hidden="true" />
      <h2>ページを読み込んでいます</h2>
    </div>
  );
}

export function MembersOnlyPage() {
  return (
    <Layout>
      <PageHead />
      <Suspense fallback={<LoadingFallback />}>
        <MembersOnlyDirectory />
      </Suspense>
    </Layout>
  );
}

export function MembersOnlyMemberPage() {
  return (
    <Layout>
      <PageHead detail />
      <Suspense fallback={<LoadingFallback />}>
        <MembersOnlyDetail />
      </Suspense>
    </Layout>
  );
}
