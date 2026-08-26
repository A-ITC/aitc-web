"use client";

import { Suspense } from "react"
import { useDiscordAuth } from "@/lib/discord-auth";
import { Layout } from "../common/layout";
import { PageHead } from "../common/page-head";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";
import { MembersOnlyDirectory } from "./members-only-directory";
import { MembersOnlyDetail } from "./members-only-detail";
import { MembersOnlyPanel } from "./members-only-panel";
import { MembersOnlySpinner } from "./members-only-spinner";

function LoadingFallback() {
  return (
    <MembersOnlyPanel>
      <MembersOnlySpinner />
      <h2 className="mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl">ページを読み込んでいます</h2>
    </MembersOnlyPanel>
  );
}

export function MembersOnlyPage() {
  const {
    accessToken,
    status,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();

  return (
    <Layout>
      <PageHead>
        <PageHead.Kicker>MEMBERS ONLY</PageHead.Kicker>
        <PageHead.Title>部員向けページ</PageHead.Title>
        <PageHead.Description>
          認証済みのAITC部員向けメンバー一覧です。
        </PageHead.Description>
      </PageHead>
      {status === "authenticated" && accessToken ? (
        <>
          <div className="mx-auto mt-6 flex max-w-6xl justify-end px-6 md:mt-9">
            <button
              className="cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 font-bold text-slate-900 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400"
              onClick={logout}
            >
              ログアウト
            </button>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <MembersOnlyDirectory
              accessToken={accessToken}
              invalidateAuthentication={invalidateAuthentication}
            />
          </Suspense>
        </>
      ) : (
        <MembersOnlyAuthPanel
          status={status}
          onAuthenticate={startAuthentication}
        />
      )}
    </Layout>
  );
}

export function MembersOnlyMemberPage() {
  const {
    accessToken,
    status,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();

  return (
    <Layout>
      <PageHead>
        <PageHead.Kicker>MEMBERS ONLY</PageHead.Kicker>
        <PageHead.Title>部員プロフィール</PageHead.Title>
        <PageHead.Description>
          認証済みのAITC部員にメンバー情報と制作作品を表示します。
        </PageHead.Description>
      </PageHead>
      {status === "authenticated" && accessToken ? (
        <>
          <div className="mx-auto mt-6 flex max-w-4xl justify-end px-6 md:mt-9">
            <button
              className="cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 font-bold text-slate-900 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400"
              onClick={logout}
            >
              ログアウト
            </button>
          </div>
          <Suspense fallback={<LoadingFallback />}>
            <MembersOnlyDetail
              accessToken={accessToken}
              invalidateAuthentication={invalidateAuthentication}
            />
          </Suspense>
        </>
      ) : (
        <MembersOnlyAuthPanel
          status={status}
          onAuthenticate={startAuthentication}
        />
      )}
    </Layout >
  );
}
