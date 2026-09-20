"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type {
  DiscordProfile,
  DiscordProfileStatus,
} from "@/lib/discord-auth";

const navigationItems = [
  { href: "/members-only/members", label: "メンバー一覧" },
  { href: "/members-only/works", label: "作品一覧" },
];

const fallbackUsername = "Discordユーザー";

function UserAvatar({ avatarUrl }: { avatarUrl: string | null }) {
  const [hasError, setHasError] = useState(false);

  if (!avatarUrl || hasError) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-200 text-lg text-slate-500">
        <FontAwesomeIcon aria-hidden="true" icon={faUser} />
      </span>
    );
  }

  return (
    // The URL comes from Discord at runtime, so a native image can handle CDN failures.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      className="size-11 shrink-0 rounded-full bg-slate-200 object-cover"
      height={44}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      src={avatarUrl}
      width={44}
    />
  );
}

function UserProfile({
  profile,
  profileStatus,
}: {
  profile: DiscordProfile | null;
  profileStatus: DiscordProfileStatus;
}) {
  if (profileStatus === "loading" || profileStatus === "idle") {
    return (
      <div
        aria-label="ログインユーザーを読み込んでいます"
        className="mb-4 flex items-center gap-3 border-b border-slate-200 pb-4"
      >
        <span className="size-11 shrink-0 animate-pulse rounded-full bg-slate-200 motion-reduce:animate-none" />
        <span className="h-4 min-w-0 flex-1 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      </div>
    );
  }

  const username = profile?.username ?? fallbackUsername;

  return (
    <div
      aria-label="ログイン中のユーザー"
      className="mb-4 flex min-w-0 items-center gap-3 border-b border-slate-200 pb-4"
    >
      <UserAvatar
        key={profile?.avatarUrl ?? "fallback"}
        avatarUrl={profile?.avatarUrl ?? null}
      />
      <p
        className="min-w-0 truncate text-sm font-bold text-slate-900"
        title={username}
      >
        {username}
      </p>
    </div>
  );
}

export function MembersOnlyNavigation({
  onLogout,
  profile,
  profileStatus,
}: {
  onLogout: () => void;
  profile: DiscordProfile | null;
  profileStatus: DiscordProfileStatus;
}) {
  const pathname = usePathname();

  return (
    <aside className="mx-6 mt-8 border border-slate-200 bg-white p-4 md:sticky md:top-28 md:mx-0 md:mt-24 md:self-start md:p-5">
      <UserProfile profile={profile} profileStatus={profileStatus} />
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
