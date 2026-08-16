import Link from "next/link";
import { Header } from "./header";
import { Logo } from "./logo";

export { Logo } from "./logo";

function Footer() {
  return (
    <footer className="mx-auto grid max-w-6xl grid-cols-1 gap-7 border-t border-slate-200 px-6 pt-10 pb-8 text-xs md:grid-cols-2">
      <div>
        <Logo />
      </div>
      <nav className="flex flex-wrap items-start gap-5 md:justify-self-end [&_a:hover]:text-[var(--blue)]">
        <Link href="/">トップ</Link>
        <Link href="/event-works">イベント作品集</Link>
        <Link href="/personal-works">個人作品集</Link>
        <Link href="/members-only">部員向け</Link>
        <a href="https://x.com/AInfTechClub" target="_blank" rel="noreferrer">
          𝕏
        </a>
      </nav>
      <small className="col-span-full font-['DM_Mono',monospace] text-xs text-slate-400">
        © 2026 AITC All Rights Reserved.
      </small>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
