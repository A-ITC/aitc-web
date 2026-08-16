import Link from "next/link";
import { withBasePath } from "../data";
import { EventTimeline } from "../event-timeline";
import { Layout, Logo } from "../common/layout";

export function HomePage() {
  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 max-md:py-20">
        <div>
          <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">ALUMNI OF INFORMATION AND TECHNOLOGY CLUB</p>
          <h1 className="mt-3.5 mb-6 flex items-center gap-5 [&>span]:text-7xl [&>span]:tracking-tighter md:[&>span]:text-8xl">
            <img
              className="h-16 w-16 object-contain md:h-24 md:w-24"
              src={withBasePath(
                "/images/aitc_logo_transparent_no_word_black.png",
              )}
              alt=""
            />
            <Logo />
          </h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 border-t border-slate-200 px-6 py-16 md:grid-cols-2 md:gap-10 md:py-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)] md:col-span-2">ABOUT AITC</p>
        <h2 className="m-0 text-3xl leading-snug tracking-tighter md:text-5xl">AITCについて</h2>
        <p className="m-0 max-w-lg text-base leading-loose">
          AITCは、東京理科大学葛飾キャンパスで活動するITCの卒業生による創作サークルです。イラスト、プログラミング、映像、音楽。異なる表現を持ち寄って、今も一緒に新しい作品をつくっています。
        </p>
      </section>
      <section className="max-w-none bg-orange-50 px-6 py-16 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">WHAT WE DO</p>
          <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">活動紹介</h2>
          <div className="grid grid-cols-2 border border-orange-300 md:grid-cols-3 xl:grid-cols-6 [&>article:last-child]:border-0 [&>article:nth-child(2n)]:max-md:border-r-0 [&>article:nth-child(3n)]:md:max-xl:border-r-0">
            {[
              ["✦", "イラスト"],
              ["⌘", "プログラミング"],
              ["▷", "動画"],
              ["♫", "作曲"],
              ["◌", "作業通話"],
              ["↗", "イベント参加"],
            ].map(([icon, title]) => (
              <article key={title} className="min-h-40 border-r border-orange-300 px-4 py-6 max-md:border-b max-md:border-b-teal-200">
                <span className="text-2xl text-[var(--blue)]">{icon}</span>
                <h3 className="mt-10 mb-4 text-sm">{title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">COLLECTIONS</p>
        <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">作品集</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link href="/event-works" className="flex min-h-64 flex-col items-start border-0 bg-slate-900 p-8 text-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-14 mb-1.5 text-3xl tracking-tighter">イベント作品集</h3>
            <p className="m-0 text-sm">イベントで頒布した、みんなの作品。</p>
            <b className="mt-auto inline-block rounded-sm bg-[var(--accent-gradient)] px-5 py-3 text-xs text-black">見る →</b>
          </Link>
          <Link href="/personal-works" className="flex min-h-64 flex-col items-start border-0 bg-slate-900 p-8 text-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-14 mb-1.5 text-3xl tracking-tighter">個人作品集</h3>
            <p className="m-0 text-sm">メンバーそれぞれの、日々の制作。</p>
            <b className="mt-auto inline-block rounded-sm bg-[var(--accent-gradient)] px-5 py-3 text-xs text-black">見る →</b>
          </Link>
        </div>
      </section>
      <EventTimeline />
    </Layout>
  );
}
