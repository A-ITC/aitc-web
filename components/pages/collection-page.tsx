import { Suspense } from "react";
import { CollectionKind } from "../data";
import { Layout } from "../common/layout";
import { CollectionBrowser } from "../work-collection-browser";

export function CollectionPage({ kind }: { kind: CollectionKind }) {
  const title = kind === "event" ? "イベント作品集" : "個人作品集";
  return (
    <Layout>
      <section className="page-head">
        <p className="kicker">
          {kind === "event" ? "EVENT WORKS" : "PERSONAL WORKS"}
        </p>
        <h1>{title}</h1>
      </section>
      <Suspense
        fallback={<section className="collection-main">読み込み中…</section>}
      >
        <CollectionBrowser kind={kind} />
      </Suspense>
    </Layout>
  );
}
