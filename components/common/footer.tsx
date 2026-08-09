"use client";

import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
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
        <a href="https://x.com/AInfTechClub" target="_blank" rel="noreferrer">
          𝕏
        </a>
      </nav>
      <small>© 2026 AITC All Rights Reserved.</small>
    </footer>
  );
}