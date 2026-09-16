"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { href: "/members-only/members", label: "メンバー一覧" },
  { href: "/members-only/works", label: "作品一覧" },
];

export function MembersOnlyNavigation({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="mx-6 mt-8 border border-slate-200 bg-white p-4 md:sticky md:top-28 md:mx-0 md:mt-24 md:self-start md:p-5">
      <nav aria-label="部員向けページ">
        <ul className="m-0 flex list-none gap-2 p-0 md:flex-col">
          {navigationItems.map((item) => {
            const isCurrent =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li className="min-w-0 flex-1" key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`block px-3 py-2.5 text-center text-sm font-bold transition-colors md:text-left ${
                    isCurrent
                      ? "bg-[image:var(--accent-gradient)] text-slate-950"
                      : "text-slate-700 hover:bg-slate-100 hover:text-[var(--blue)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        className="mt-4 w-full cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-900 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400"
        onClick={onLogout}
      >
        ログアウト
      </button>
    </aside>
  );
}
