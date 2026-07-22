import { Suspense } from "react";
import { Layout } from "../layout";
import { MemberDirectoryBrowser } from "../member-directory-browser";

export function MembersPage() {
  return (
    <Layout>
      <section className="page-head">
        <p className="kicker">MEMBERS</p>
        <h1>メンバー一覧</h1>
        <p>AITCで創作活動を続けるメンバーを紹介します。</p>
      </section>
      <Suspense
        fallback={<section className="collection-main">読み込み中…</section>}
      >
        <MemberDirectoryBrowser />
      </Suspense>
    </Layout>
  );
}
