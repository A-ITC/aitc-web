"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { withBasePath } from "../data";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="header">
      <div className="nav-wrap">
        <Link href="/" className="brand" onClick={close}>
          <img
            className="header-icon"
            src={withBasePath("/images/aitc_logo_transparent_no_word_black.png")}
            alt=""
          />
          <Logo />
          <small>
            Alumni of Information
            <br />
            and Technology Club
          </small>
        </Link>
        <button
          className="menu-button"
          aria-label="メニューを開く"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav
          className={open ? "nav open" : "nav"}
          aria-label="メインナビゲーション"
        >
          <Link href="/" onClick={close}>
            トップ
          </Link>
          <Link href="/event-works" onClick={close}>
            イベント作品集
          </Link>
          <Link href="/personal-works" onClick={close}>
            個人作品集
          </Link>
          <Link href="/members" onClick={close}>
            メンバー
          </Link>
          <a
            className="x-placeholder"
            href="https://x.com/AInfTechClub"
            target="_blank"
            rel="noreferrer"
            aria-label="AITC公式Xを開く"
          >
            𝕏
          </a>
        </nav>
      </div>
    </header>
  );
}
