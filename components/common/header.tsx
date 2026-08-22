"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./logo";
import { withBasePath } from "../data";

export function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="sticky top-0 z-20 border-b-0 bg-slate-50/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:h-20">
        <Link href="/" className="flex items-center gap-3" onClick={close}>
          <img
            className="size-8 object-contain"
            src={withBasePath("/images/aitc_logo_transparent_no_word_black.png")}
            alt=""
          />
          <Logo />
          <small className="hidden font-['DM_Mono',monospace] text-xs leading-snug tracking-wide md:block">
            Alumni of Information
            <br />
            and Technology Club
          </small>
        </Link>
        <button
          className="border-0 bg-transparent text-xl md:hidden"
          aria-label="メニューを開く"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
        <nav
          className={`${open ? "flex" : "hidden"} absolute top-16 right-0 left-0 flex-col items-start gap-5 bg-white px-6 py-5 text-base font-bold shadow-lg md:static md:flex md:flex-row md:items-center md:gap-8 md:bg-transparent md:p-0 md:shadow-none`}
          aria-label="メインナビゲーション"
        >
          {[
            { href: "/", label: "トップ" },
            { href: "/event-works", label: "イベント作品集" },
            { href: "/personal-works", label: "個人作品集" },
            { href: "/members-only", label: "部員向け" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:bg-[image:var(--accent-gradient)] hover:bg-clip-text hover:text-transparent focus-visible:bg-[image:var(--accent-gradient)] focus-visible:bg-clip-text focus-visible:text-transparent"
              onClick={close}
            >
              {item.label}
            </Link>
          ))}
          <a
            className="text-base hover:bg-[image:var(--accent-gradient)] hover:bg-clip-text hover:text-transparent focus-visible:bg-[image:var(--accent-gradient)] focus-visible:bg-clip-text focus-visible:text-transparent"
            href="https://x.com/AInfTechClub"
            target="_blank"
            rel="noreferrer"
            aria-label="AITC公式Xを開く"
          >
            𝕏
          </a>
        </nav>
      </div>
      <span
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 bg-[image:var(--header-gradient)]"
        aria-hidden="true"
      />
    </header>
  );
}
