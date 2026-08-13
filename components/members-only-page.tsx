"use client";

import { Suspense } from "react";
import { Layout } from "./layout";
import { MembersOnlyDirectory } from "./members-only-directory";
import { MembersOnlyDetail } from "./members-only-detail";
import styles from "./members-only.module.css";

function PageHead({ detail = false }: { detail?: boolean }) {
  return (
    <section className="page-head">
      <p className="kicker">MEMBERS ONLY</p>
      <h1>{detail ? "部員プロフィール" : "部員向けページ"}</h1>
      <p>
        {detail
          ? "認証済みのAITC部員にメンバー情報と制作作品を表示します。"
          : "認証済みのAITC部員向けメンバー一覧です。"}
      </p>
    </section>
  );
}

function LoadingFallback() {
  return (
    <div className={styles.statePanel} aria-live="polite">
      <span className={styles.indicator} aria-hidden="true" />
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
