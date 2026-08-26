"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchMembersOnlyMember,
  fetchMembersOnlyMembers,
  fetchMembersOnlyMemberWorks,
  MembersOnlyApiError,
  type MembersOnlyMember,
  type MemberRole,
  type MemberWorkReference,
} from "@/lib/members-only-api";
import { MemberIcon } from "../member-icon";
import { MembersOnlyPanel } from "./members-only-panel";
import { MembersOnlySpinner } from "./members-only-spinner";

const stateHeadingClassName =
  "mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl";
const stateDescriptionClassName = "mt-0 mb-6 leading-relaxed text-slate-500";
import { MembersOnlyWorksBrowser } from "./members-only-works-browser";

type LoadStatus = "idle" | "loading" | "ready" | "not-found" | "error";

const roleLabels: Record<MemberRole, string> = {
  REPRESENTATIVE: "代表",
  CG_LEAD: "CG部門長",
  DTM_LEAD: "DTM部門長",
  PROG_LEAD: "プログラミング部門長",
  MV_LEAD: "映像部門長",
};

function validMemberId(values: string[]): string | null {
  if (values.length !== 1) return null;
  const id = values[0];
  if (!id || id.length > 128 || /[\/\\?#\x00-\x1f]/.test(id)) return null;
  return id;
}

function useMembersOnlyDetail({
  memberId,
  accessToken,
  invalidateAuthentication,
  reloadKey,
}: {
  memberId: string | null;
  accessToken: string;
  invalidateAuthentication: () => void;
  reloadKey: number;
}) {
  const [member, setMember] = useState<MembersOnlyMember | null>(null);
  const [works, setWorks] = useState<MemberWorkReference[]>([]);
  const [directory, setDirectory] = useState<MembersOnlyMember[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");

  useEffect(() => {
    if (!memberId) return;

    const controller = new AbortController();
    setLoadStatus("loading");

    void Promise.all([
      fetchMembersOnlyMember(memberId, accessToken, controller.signal),
      fetchMembersOnlyMembers(accessToken, controller.signal),
      fetchMembersOnlyMemberWorks(memberId, accessToken, controller.signal),
    ])
      .then(([memberResponse, directoryResponse, worksResponse]) => {
        setMember(memberResponse);
        setDirectory(directoryResponse);
        setWorks(worksResponse);
        setLoadStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof MembersOnlyApiError) {
          if (error.status === 401 || error.status === 403) {
            invalidateAuthentication();
            setLoadStatus("idle");
            return;
          }
          if (error.status === 404) {
            setLoadStatus("not-found");
            return;
          }
        }
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [accessToken, invalidateAuthentication, memberId, reloadKey]);

  return { loadStatus, member, works, directory };
}

export function MembersOnlyDetail({
  accessToken,
  invalidateAuthentication,
}: {
  accessToken: string;
  invalidateAuthentication: () => void;
}) {
  const params = useSearchParams();
  const memberId = validMemberId(params.getAll("id"));
  const [reloadKey, setReloadKey] = useState(0);
  const { loadStatus, member, works, directory } = useMembersOnlyDetail({
    memberId,
    accessToken,
    invalidateAuthentication,
    reloadKey,
  });

  if (!memberId) {
    return (
      <MembersOnlyPanel role="alert">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 font-['DM_Mono',monospace] text-3xl leading-none font-bold text-red-800" aria-hidden="true">!</span>
        <h2 className={stateHeadingClassName}>メンバーが指定されていません</h2>
        <Link className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400" href="/members-only">一覧へ戻る</Link>
      </MembersOnlyPanel>
    );
  }

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <MembersOnlyPanel aria-live="polite">
        <MembersOnlySpinner />
        <h2 className={stateHeadingClassName}>メンバー情報を読み込んでいます</h2>
      </MembersOnlyPanel>
    );
  }

  if (loadStatus === "not-found") {
    return (
      <MembersOnlyPanel role="alert">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 font-['DM_Mono',monospace] text-3xl leading-none font-bold text-red-800" aria-hidden="true">!</span>
        <h2 className={stateHeadingClassName}>メンバーが見つかりません</h2>
        <Link className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400" href="/members-only">一覧へ戻る</Link>
      </MembersOnlyPanel>
    );
  }

  if (loadStatus === "error" || !member) {
    return (
      <MembersOnlyPanel role="alert">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 font-['DM_Mono',monospace] text-3xl leading-none font-bold text-red-800" aria-hidden="true">!</span>
        <h2 className={stateHeadingClassName}>メンバー情報を読み込めませんでした</h2>
        <p className={stateDescriptionClassName}>時間をおいて、もう一度お試しください。</p>
        <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400" onClick={() => setReloadKey((key) => key + 1)}>
          再読み込み
        </button>
      </MembersOnlyPanel>
    );
  }

  return (
    <>
      <div className="mx-auto mt-6 max-w-4xl px-6 text-sm font-bold md:mt-9">
        <Link href="/members-only">← メンバー一覧</Link>
      </div>

      <section className="mx-auto grid max-w-4xl grid-cols-3 items-center gap-6 px-6 pt-16 pb-11 md:gap-14 md:pt-28 md:pb-20">
        <MemberIcon className="w-full rounded-full bg-slate-200" id={member.id} name={member.name} />
        <div className="col-span-2">
          <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">MEMBER PROFILE</p>
          <h1 className="my-3 text-4xl tracking-tighter md:text-7xl">{member.name}</h1>
          <p className="my-4 font-['DM_Mono',monospace] text-xs text-[var(--blue)]">
            第{member.generation}期 · {member.department.join(" / ")}
          </p>
          {member.roles.length > 0 && (
            <p className="mb-2.5 inline-block bg-slate-100 px-2 py-1 text-xs leading-snug text-slate-900">
              {member.roles.map((role) => roleLabels[role] ?? role).join(" / ")}
            </p>
          )}
          {member.profile && <p className="my-4 max-w-lg text-base leading-loose">{member.profile}</p>}
          <div className="flex flex-wrap gap-3.5">
            {member.links.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                className="inline-block border-b text-sm font-bold text-[var(--blue)]"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl border-t border-slate-200 px-6 pt-10 pb-28">
        <p className="my-4 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">WORKS BY {member.name.toUpperCase()}</p>
        <h2 className="mt-3 mb-8 text-3xl leading-snug tracking-tighter md:text-5xl">制作作品</h2>
        {works.length === 0 ? (
          <p className="my-4 py-9 text-slate-500">登録されている作品はありません。</p>
        ) : (
          <MembersOnlyWorksBrowser
            references={works}
            memberId={member.id}
            directory={directory}
          />
        )}
      </section>
    </>
  );
}
