import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { Header } from "./header";
import { Logo } from "./logo";
import { withBasePath } from "../data";

export { Logo } from "./logo";

function Footer() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-slate-200">
      <img
        className="pointer-events-none absolute top-1/2 -right-16 -z-10 w-80 -translate-y-1/2 -rotate-[15deg] opacity-20 md:-right-8 md:w-96"
        src={withBasePath("/images/itc_hakasekun.svg")}
        alt=""
        aria-hidden="true"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-7 px-6 pt-10 pb-8 text-xs md:grid-cols-2">
        <div>
          <Logo />
        </div>
        <nav className="flex flex-wrap items-start gap-5 md:justify-self-end [&_a:hover]:text-[var(--blue)]">
          <Link href="/">トップ</Link>
          <Link href="/event-works">イベント作品集</Link>
          <Link href="/personal-works">個人作品集</Link>
          <Link href="/members-only">部員向け</Link>
          <a
            className="inline-flex items-center gap-1.5"
            href="https://x.com/AInfTechClub"
            target="_blank"
            rel="noreferrer"
            aria-label="AITC公式Xを開く"
          >
            <span>𝕏</span>
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              className="h-2.5 w-2.5"
              aria-hidden="true"
            />
          </a>
        </nav>
        <small className="col-span-full font-['DM_Mono',monospace] text-xs text-slate-400">
          © 2026 AITC All Rights Reserved.
        </small>
      </div>
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
