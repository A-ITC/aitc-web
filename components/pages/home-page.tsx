import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faPeopleGroup,
  faShareNodes,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { withBasePath } from "../data";
import { EventTimeline } from "../event-timeline";
import { Layout, Logo } from "../common/layout";

const activities = [
  {
    icon: faStore,
    title: "イベント参加",
    description: "不定期でM3やコミティアなどに出品します",
  },
  {
    icon: faHeadset,
    title: "作業通話",
    description:
      "Discord上で作業通話やゲーム通話などをして交流しています",
  },
  {
    icon: faShareNodes,
    title: "個人作品共有",
    description:
      "イラスト、プログラミング、曲、動画など、個人制作の作品をDiscord上で共有しています",
  },
  {
    icon: faPeopleGroup,
    title: "同窓会",
    description:
      "毎年11月、東京理科大学の学園祭の日に同窓会を行っています",
  },
];

export function HomePage() {
  return (
    <Layout>
      <section className="relative isolate flex min-h-[20rem] items-center overflow-hidden border-b border-slate-200 px-6 py-8 md:min-h-[40rem] md:py-24">
        <img
          className="pointer-events-none absolute top-1/2 -right-28 -z-10 w-[min(52rem,115vw)] -translate-y-1/2 -rotate-[15deg] opacity-20 md:-right-20 md:opacity-30"
          src={withBasePath("/images/itc_hakasekun.svg")}
          alt=""
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-slate-50 via-slate-50/85 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto w-full max-w-6xl">
          <p className="my-4 font-['DM_Mono',monospace] text-sm font-medium tracking-widest text-[var(--blue)] md:text-lg">
            ALUMNI OF INFORMATION AND TECHNOLOGY CLUB
          </p>
          <h1 className="my-3 leading-none tracking-tighter">
            <Logo size="display" />
          </h1>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-5 border-t border-slate-200 px-6 py-16 md:grid-cols-2 md:gap-10 md:py-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)] md:col-span-2">ABOUT AITC</p>
        <h2 className="m-0 text-3xl leading-snug tracking-tighter md:text-5xl">AITCについて</h2>
        <p className="m-0 max-w-lg text-base leading-loose">
          AITCは、東京理科大学葛飾キャンパスで活動するITCの卒業生による創作サークルです。イラスト、プログラミング、映像、音楽。様々なスキルで今も各々新しい作品をつくっています。
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">WHAT WE DO</p>
        <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">活動紹介</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {activities.map(({ icon, title, description }) => (
            <article key={title} className="flex min-h-56 flex-col border border-slate-200 p-7 md:p-8">
              <FontAwesomeIcon
                icon={icon}
                className="h-8 w-8 text-[var(--blue)]"
                aria-hidden="true"
              />
              <h3 className="mt-8 mb-3 text-xl font-bold tracking-tight">{title}</h3>
              <p className="m-0 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">COLLECTIONS</p>
        <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">作品集</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Link href="/event-works" className="relative flex min-h-64 overflow-hidden border-0 bg-slate-900 p-8 text-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <img
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35"
              src={withBasePath("/images/event_work_thumbnail.png")}
              alt=""
              aria-hidden="true"
            />
            <span className="relative z-10 flex w-full flex-col items-start">
              <h3 className="mt-0 mb-1.5 text-3xl tracking-tighter">イベント作品集</h3>
              <p className="m-0 text-sm">これまでイベントに出品した作品のデータベース</p>
              <b className="mt-auto inline-block rounded-sm bg-[image:var(--accent-gradient)] px-5 py-3 text-base text-black underline underline-offset-2">見る →</b>
            </span>
          </Link>
          {/*
            <Link href="/personal-works" className="flex min-h-64 flex-col items-start border-0 bg-slate-900 p-8 text-white transition duration-200 hover:-translate-y-1 hover:shadow-xl">
            <h3 className="mt-14 mb-1.5 text-3xl tracking-tighter">個人作品集</h3>
            <p className="m-0 text-sm">メンバーそれぞれの、日々の制作。</p>
            <b className="mt-auto inline-block rounded-sm bg-[image:var(--accent-gradient)] px-5 py-3 text-xs text-black">見る →</b>
            </Link>
            */}
        </div>
      </section>
      <EventTimeline />
    </Layout>
  );
}
