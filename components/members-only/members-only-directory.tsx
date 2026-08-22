"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDiscordAuth } from "@/lib/discord-auth";
import {
  fetchMembersOnlyMembers,
  MembersOnlyApiError,
  type MembersOnlyMember,
} from "@/lib/members-only-api";
import { MemberIcon } from "../member-icon";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type FilterKey = "generation" | "department";
type MemberGroup = {
  generation: number;
  members: MembersOnlyMember[];
};

const filterLabelClassName = "flex items-center gap-2 text-xs font-bold";
const filterSelectClassName =
  "rounded-none border border-slate-200 bg-white py-2 pr-8 pl-3 text-slate-900";
const stateHeadingClassName =
  "mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl";
const stateDescriptionClassName = "mt-0 mb-6 leading-relaxed text-slate-500";

function MembersOnlyFilters({
  generations,
  departments,
  generation,
  department,
  onFilterChange,
}: {
  generations: number[];
  departments: string[];
  generation: string;
  department: string;
  onFilterChange: (key: FilterKey, value: string) => void;
}) {
  const filters = [
    {
      key: "generation" as const,
      label: "加入期",
      value: generation,
      options: generations.map((value) => ({
        value: String(value),
        label: `${value}期生`,
      })),
    },
    {
      key: "department" as const,
      label: "所属部門",
      value: department,
      options: departments.map((value) => ({ value, label: value })),
    },
  ];

  return (
    <div className="flex flex-wrap gap-3.5">
      {filters.map((filter) => (
        <label className={filterLabelClassName} key={filter.key}>
          {filter.label}
          <select
            className={filterSelectClassName}
            value={filter.value}
            onChange={(event) =>
              onFilterChange(filter.key, event.target.value)
            }
          >
            <option value="all">すべて</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function MembersOnlyLogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <button className="cursor-pointer rounded-sm border border-slate-200 bg-white px-3.5 py-2 font-bold text-slate-900 hover:-translate-y-px hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400" onClick={onLogout}>
      ログアウト
    </button>
  );
}

function MembersOnlyMemberLink({ member }: { member: MembersOnlyMember }) {
  return (
    <Link
      href={`/members-only/members?id=${encodeURIComponent(member.id)}`}
      className="grid gap-6 border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl focus-visible:-translate-y-1 focus-visible:border-blue-300 focus-visible:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400 max-md:grid-cols-3 max-md:items-start md:p-6"
    >
      <MemberIcon className="w-24 rounded-full bg-slate-200" id={member.id} name={member.name} />
      <div className="max-md:col-span-2">
        <p className="mt-0.5 mb-1 font-['DM_Mono',monospace] text-base font-medium tracking-widest text-[var(--blue)]">{member.department.join(" / ")}</p>
        <h3 className="mt-1 mb-2.5 text-2xl tracking-tighter">{member.name}</h3>
        <span className="mt-2.5 block text-xs font-bold text-[var(--blue)] md:mt-5">プロフィールを見る →</span>
      </div>
    </Link>
  );
}

function MembersOnlyMemberGroupRoot({ children }: { children: ReactNode }) {
  return <section className="min-w-0">{children}</section>;
}

function MembersOnlyMemberGroupHeader({
  isExpanded,
  contentId,
  onToggle,
  children,
}: {
  isExpanded: boolean;
  contentId: string;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <h2 className="mt-0 mb-5">
      <button
        type="button"
        className="flex w-full cursor-pointer items-center justify-between gap-4 border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xl font-bold tracking-tighter text-slate-900 transition-colors duration-200 hover:border-blue-300 hover:bg-slate-200 hover:text-[var(--blue)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 motion-reduce:transition-none md:text-2xl"
        aria-expanded={isExpanded}
        aria-controls={contentId}
        onClick={onToggle}
      >
        {children}
      </button>
    </h2>
  );
}

function MembersOnlyMemberGroupSection({
  isExpanded,
  contentId,
  reduceMotion,
  children,
}: {
  isExpanded: boolean;
  contentId: string;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  const items = Children.toArray(children);

  return (
    <AnimatePresence initial={false}>
      {isExpanded && (
        <motion.div
          id={contentId}
          className="overflow-hidden"
          initial={reduceMotion ? false : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
        >
          <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={isValidElement(item) && item.key !== null ? item.key : index}
                  layout={!reduceMotion}
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                >
                  {item}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const MembersOnlyMemberGroup = Object.assign(MembersOnlyMemberGroupRoot, {
  Header: MembersOnlyMemberGroupHeader,
  Section: MembersOnlyMemberGroupSection,
});

function MembersOnlyList({
  memberGroups,
  memberCount,
  collapsedGenerations,
  reduceMotion,
  onToggleGeneration,
}: {
  memberGroups: MemberGroup[];
  memberCount: number;
  collapsedGenerations: Set<number>;
  reduceMotion: boolean | null;
  onToggleGeneration: (generation: number) => void;
}) {
  return (
    <>
      <p className="mt-10 mb-5 font-['DM_Mono',monospace] text-xs text-slate-500">{memberCount} members</p>
      {memberGroups.length === 0 ? (
        <p className="m-0 border border-slate-200 bg-white px-6 py-9 text-center text-slate-600">該当するメンバーはいません。</p>
      ) : (
        <div className="grid gap-10">
          {memberGroups.map((group) => {
            const isExpanded = !collapsedGenerations.has(group.generation);
            const contentId = `members-only-generation-${group.generation}`;

            return (
              <MembersOnlyMemberGroup key={group.generation}>
                <MembersOnlyMemberGroup.Header
                  isExpanded={isExpanded}
                  contentId={contentId}
                  onToggle={() => onToggleGeneration(group.generation)}
                >
                  <span>
                    {group.generation}期生 ({group.members.length})
                  </span>
                  <span className={`shrink-0 text-xl leading-none text-[var(--blue)] transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? "" : "-rotate-90"}`} aria-hidden="true">
                    ↓
                  </span>
                </MembersOnlyMemberGroup.Header>
                <MembersOnlyMemberGroup.Section
                  isExpanded={isExpanded}
                  contentId={contentId}
                  reduceMotion={reduceMotion}
                >
                  {group.members.map((member) => (
                    <MembersOnlyMemberLink key={member.id} member={member} />
                  ))}
                </MembersOnlyMemberGroup.Section>
              </MembersOnlyMemberGroup>
            );
          })}
        </div>
      )}
    </>
  );
}

export function MembersOnlyDirectory() {
  const router = useRouter();
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
  const {
    accessToken,
    status: authStatus,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();
  const [members, setMembers] = useState<MembersOnlyMember[]>([]);
  const [collapsedGenerations, setCollapsedGenerations] = useState<Set<number>>(
    new Set(),
  );
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated" || !accessToken) return;

    const controller = new AbortController();
    setLoadStatus("loading");

    void fetchMembersOnlyMembers(accessToken, controller.signal)
      .then((items) => {
        setMembers(items);
        setLoadStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (
          error instanceof MembersOnlyApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          invalidateAuthentication();
          setLoadStatus("idle");
          return;
        }
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [accessToken, authStatus, invalidateAuthentication, reloadKey]);

  const generations = useMemo(
    () => [...new Set(members.map((member) => member.generation))].sort((a, b) => a - b),
    [members],
  );
  const departments = useMemo(
    () => [...new Set(members.flatMap((member) => member.department))].sort(),
    [members],
  );
  const rawGeneration = params.get("generation");
  const generation =
    rawGeneration && generations.includes(Number(rawGeneration))
      ? rawGeneration
      : "all";
  const rawDepartment = params.get("department");
  const department =
    rawDepartment && departments.includes(rawDepartment) ? rawDepartment : "all";
  const visibleMembers = members.filter(
    (member) =>
      (generation === "all" || member.generation === Number(generation)) &&
      (department === "all" || member.department.includes(department)),
  );
  const memberGroups = generations
    .map((value) => ({
      generation: value,
      members: visibleMembers.filter((member) => member.generation === value),
    }))
    .filter((group) => group.members.length > 0)
    .sort((a, b) => b.generation - a.generation);

  const setFilter = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setCollapsedGenerations(new Set());
    router.push(`/members-only${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  };
  const toggleGeneration = (value: number) => {
    setCollapsedGenerations((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  if (authStatus !== "authenticated") {
    return (
      <MembersOnlyAuthPanel
        status={authStatus}
        onAuthenticate={startAuthentication}
      />
    );
  }

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12">
        <span className="size-14 animate-spin rounded-full border-4 border-slate-200 border-t-orange-400 font-['DM_Mono',monospace] text-3xl leading-none font-bold motion-reduce:animate-none" aria-hidden="true" />
        <h2 className={stateHeadingClassName}>メンバー一覧を読み込んでいます</h2>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="mx-5 mt-11 mb-20 flex min-h-72 w-auto flex-col items-center justify-center border border-slate-200 bg-white px-6 py-10 text-center shadow-xl md:mx-auto md:mb-28 md:w-full md:max-w-3xl md:px-9 md:py-12" role="alert">
        <span className="flex size-14 items-center justify-center rounded-full bg-red-50 font-['DM_Mono',monospace] text-3xl leading-none font-bold text-red-800" aria-hidden="true">!</span>
        <h2 className={stateHeadingClassName}>メンバー一覧を読み込めませんでした</h2>
        <p className={stateDescriptionClassName}>時間をおいて、もう一度お試しください。</p>
        <button className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400" onClick={() => setReloadKey((key) => key + 1)}>
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-28">
      <div className="flex flex-col-reverse items-start justify-between gap-6 md:flex-row">
        <MembersOnlyFilters
          generations={generations}
          departments={departments}
          generation={generation}
          department={department}
          onFilterChange={setFilter}
        />
        <MembersOnlyLogoutButton onLogout={logout} />
      </div>
      <MembersOnlyList
        memberGroups={memberGroups}
        memberCount={visibleMembers.length}
        collapsedGenerations={collapsedGenerations}
        reduceMotion={reduceMotion}
        onToggleGeneration={toggleGeneration}
      />
    </section>
  );
}
