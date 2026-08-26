import { Suspense } from "react";
import { CollectionKind } from "../data";
import { Layout } from "../common/layout";
import { PageHead } from "../common/page-head";
import { CollectionBrowser } from "../work-collection-browser";

export function CollectionPage({ kind }: { kind: CollectionKind }) {
  const title = kind === "event" ? "イベント作品集" : "個人作品集";
  return (
    <Layout>
      <PageHead>
        <PageHead.Kicker>
          {kind === "event" ? "EVENT WORKS" : "PERSONAL WORKS"}
        </PageHead.Kicker>
        <PageHead.Title>{title}</PageHead.Title>
      </PageHead>
      <Suspense
        fallback={<section className="mx-auto max-w-6xl px-6 pt-10 pb-28">読み込み中…</section>}
      >
        <CollectionBrowser kind={kind} />
      </Suspense>
    </Layout>
  );
}
