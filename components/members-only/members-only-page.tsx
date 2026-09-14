"use client";

import { Suspense, type ReactNode } from "react";
import { useDiscordAuth } from "@/lib/discord-auth";
import { Layout } from "../common/layout";
import { PageHead } from "../common/page-head";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";
import { MembersOnlyDirectory } from "./members-only-directory";
import { MembersOnlyEventWorksBrowser } from "./members-only-event-works-browser";
import { MembersOnlyDetail } from "./members-only-detail";
import { MembersOnlyNavigation } from "./members-only-navigation";
import { MembersOnlyPanel } from "./members-only-panel";
import { MembersOnlySpinner } from "./members-only-spinner";

type AuthenticatedContentProps = {
  accessToken: string;
  invalidateAuthentication: () => void;
};

function LoadingFallback() {
  return (
    <MembersOnlyPanel>
      <MembersOnlySpinner />
      <h2 className="mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl">
        ページを読み込んでいます
      </h2>
    </MembersOnlyPanel>
  );
}

function MembersOnlyAuthenticatedPage({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description: ReactNode;
  children: (props: AuthenticatedContentProps) => ReactNode;
}) {
  const {
    accessToken,
    status,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();

  return (
    <Layout>
      {status === "authenticated" && accessToken ? (
        <div className="mx-auto max-w-7xl md:grid md:grid-cols-[13rem_minmax(0,1fr)] md:gap-4 md:px-6">
          <MembersOnlyNavigation onLogout={logout} />
          <div className="min-w-0">
            <PageHead>
              <PageHead.Kicker>MEMBERS ONLY</PageHead.Kicker>
              <PageHead.Title>{title}</PageHead.Title>
              <PageHead.Description>{description}</PageHead.Description>
            </PageHead>
            {children({ accessToken, invalidateAuthentication })}
          </div>
        </div>
      ) : (
        <>
          <PageHead>
            <PageHead.Kicker>MEMBERS ONLY</PageHead.Kicker>
            <PageHead.Title>{title}</PageHead.Title>
            <PageHead.Description>{description}</PageHead.Description>
          </PageHead>
          <MembersOnlyAuthPanel
            status={status}
            onAuthenticate={startAuthentication}
          />
        </>
      )}
    </Layout>
  );
}

export function MembersOnlyMembersPage() {
  return (
    <MembersOnlyAuthenticatedPage
      title="メンバー一覧"
      description="認証済みのAITC部員向けメンバー一覧です。"
    >
      {({ accessToken, invalidateAuthentication }) => (
        <Suspense fallback={<LoadingFallback />}>
          <MembersOnlyDirectory
            accessToken={accessToken}
            invalidateAuthentication={invalidateAuthentication}
          />
        </Suspense>
      )}
    </MembersOnlyAuthenticatedPage>
  );
}

export function MembersOnlyMemberProfilePage() {
  return (
    <MembersOnlyAuthenticatedPage
      title="部員プロフィール"
      description="認証済みのAITC部員にメンバー情報と制作作品を表示します。"
    >
      {({ accessToken, invalidateAuthentication }) => (
        <Suspense fallback={<LoadingFallback />}>
          <MembersOnlyDetail
            accessToken={accessToken}
            invalidateAuthentication={invalidateAuthentication}
          />
        </Suspense>
      )}
    </MembersOnlyAuthenticatedPage>
  );
}

export function MembersOnlyEventWorksPage() {
  return (
    <MembersOnlyAuthenticatedPage
      title="作品一覧"
      description="現役メンバーが在籍中に制作したイベント作品の一覧です。"
    >
      {({ accessToken, invalidateAuthentication }) => (
        <Suspense fallback={<LoadingFallback />}>
          <MembersOnlyEventWorksBrowser
            accessToken={accessToken}
            invalidateAuthentication={invalidateAuthentication}
          />
        </Suspense>
      )}
    </MembersOnlyAuthenticatedPage>
  );
}
