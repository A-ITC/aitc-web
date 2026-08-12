import Link from "next/link";
import { Header } from "./header";
import { Logo } from "./logo";

export { Logo } from "./logo";

function Footer() {
  return (
    <footer>
      <div>
        <Logo />
      </div>
      <nav>
        <Link href="/">トップ</Link>
        <Link href="/event-works">イベント作品集</Link>
        <Link href="/personal-works">個人作品集</Link>
        <Link href="/members">メンバー</Link>
        <Link href="/members-only">部員向け</Link>
        <a href="https://x.com/AInfTechClub" target="_blank" rel="noreferrer">
          𝕏
        </a>
      </nav>
      <small>© 2026 AITC All Rights Reserved.</small>
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
