import Link from "next/link";
import { withBasePath } from "../data";
import { EventTimeline } from "../event-timeline";
import { Layout } from "../layout";
import { Logo } from "../common/logo";

export function HomePage() {
  return (
    <Layout>
      <section className="hero">
        <div>
          <p className="kicker">ALUMNI OF INFORMATION AND TECHNOLOGY CLUB</p>
          <h1 className="hero-title">
            <img
              className="hero-icon"
              src={withBasePath(
                "/images/aitc_logo_transparent_no_word_black.png",
              )}
              alt=""
            />
            <Logo />
          </h1>
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
            <h3>イベント作品集</h3>
            <p>イベントで頒布した、みんなの作品。</p>
            <b>見る →</b>
          </Link>
          <Link href="/personal-works" className="collection personal">
            <h3>個人作品集</h3>
            <p>メンバーそれぞれの、日々の制作。</p>
            <b>見る →</b>
          </Link>
        </div>
      </section>
      <EventTimeline />
    </Layout>
  );
}
