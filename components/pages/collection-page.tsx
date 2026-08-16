import { Suspense } from "react";
import { CollectionKind } from "../data";
import { Layout } from "../common/layout";
import { CollectionBrowser } from "../work-collection-browser";

export function CollectionPage({ kind }: { kind: CollectionKind }) {
  const title = kind === "event" ? "イベント作品集" : "個人作品集";
  return (
    <Layout>
      <section className="mx-auto max-w-6xl bg-radial from-orange-200 to-transparent px-6 pt-16 pb-11 md:pt-24 md:pb-16">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">
          {kind === "event" ? "EVENT WORKS" : "PERSONAL WORKS"}
        </p>
        <h1 className="my-3 text-4xl tracking-tighter md:text-7xl">{title}</h1>
      </section>
      <Suspense
        fallback={<section className="mx-auto max-w-6xl px-6 pt-10 pb-28">読み込み中…</section>}
      >
        <CollectionBrowser kind={kind} />
      </Suspense>
    </Layout>
  );
}
