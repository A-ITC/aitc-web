import Link from "next/link";
import { eventWorks, withBasePath } from "../data";
import { Layout, Logo } from "../layout";

function Timeline() {
  const events = [
    ...new Map(eventWorks.map((work) => [work.event, work.year])).entries(),
  ].sort((a, b) => b[1] - a[1]);
  return (
    <section className="section timeline">
      <p className="kicker">EVENT HISTORY</p>
      <h2>イベント年表</h2>
      <div>
        {events.map(([event, year]) => (
          <Link
            key={event}
            href={`/event-works?event=${encodeURIComponent(event)}`}
          >
            <b>{year}</b>
            <span>{event}</span>
            <i>→</i>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <Layout>
      <section className="hero">
        <div>
          <p className="kicker">ALUMNI OF INFORMATION AND TECHNOLOGY CLUB</p>
          <h1 className="hero-title">
            <img
              className="hero-icon"
              src={withBasePath("/images/aitc_logo_transparent_no_word_black.png")}
              alt=""
            />
            <Logo />
          </h1>
          <Link className="primary" href="/event-works">
            作品を見る <span>→</span>
          </Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <div className="grid-spark">✦</div>
        </div>
      </section>
      <section className="intro section">
        <p className="kicker">ABOUT AITC</p>
        <h2>AITCについて</h2>
        <p>
          AITCは、東京理科大学葛飾キャンパスで活動するITCの卒業生による創作サークルです。イラスト、プログラミング、映像、音楽。異なる表現を持ち寄って、今も一緒に新しい作品をつくっています。
        </p>
      </section>
      <section className="section activities">
        <p className="kicker">WHAT WE DO</p>
        <h2>活動紹介</h2>
        <div className="activity-grid">
          {[
            ["✦", "イラスト"],
            ["⌘", "プログラミング"],
            ["▷", "動画"],
            ["♫", "作曲"],
            ["◌", "作業通話"],
            ["↗", "イベント参加"],
          ].map(([icon, title]) => (
            <article key={title}>
              <span>{icon}</span>
              <h3>{title}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="section collections">
        <p className="kicker">COLLECTIONS</p>
        <h2>作品集</h2>
        <div className="collection-links">
          <Link href="/event-works" className="collection event">
            <span>01</span>
            <h3>イベント作品集</h3>
            <p>イベントで頒布した、みんなの作品。</p>
            <b>見る →</b>
          </Link>
          <Link href="/personal-works" className="collection personal">
            <span>02</span>
            <h3>個人作品集</h3>
            <p>メンバーそれぞれの、日々の制作。</p>
            <b>見る →</b>
          </Link>
        </div>
      </section>
      <Timeline />
    </Layout>
  );
}
