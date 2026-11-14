"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  fetchMembersOnlyEventWork,
  MembersOnlyApiError,
  type MembersOnlyMember,
} from "@/lib/members-only-api";
import type { EventWork, Member } from "../data";
import { typeLabel } from "../data";
import { WorkCard, WorkModal } from "../work-ui";
import { groupEventWorksByFiscalYear, sortEventWorks } from "./event-work-order";
import { useMembersOnlyEventWorks } from "./hooks";
import { MembersOnlyPanel } from "./members-only-panel";
import { MembersOnlySpinner } from "./members-only-spinner";

const filterLabelClassName = "flex items-center gap-2 text-xs font-bold";
const filterSelectClassName =
  "rounded-none border border-slate-200 bg-white py-2 pr-8 pl-3 text-slate-900";
const stateHeadingClassName =
  "mt-5 mb-2.5 text-2xl tracking-tighter md:text-3xl";
const stateDescriptionClassName = "mt-0 mb-6 leading-relaxed text-slate-500";

type FilterKey = "event" | "type" | "sort";
type FilterDefinition = {
  key: FilterKey;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

const valid = (value: string | null, values: string[]) =>
  value && values.includes(value) ? value : "all";

function toMember(member: MembersOnlyMember): Member {
  return {
    id: member.id,
    name: member.name,
    generation: member.generation,
    department: member.department,
    roles: member.roles,
    profile: member.profile,
    links: member.links,
  };
}

function EventWorkGrid({
  works,
  members,
  reduceMotion,
  onSelect,
}: {
  works: EventWork[];
  members: Member[];
  reduceMotion: boolean | null;
  onSelect: (work: EventWork) => void;
}) {
  return (
    <div className="relative grid grid-cols-2 gap-3.5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {works.map((work) => (
          <motion.div
            key={work.id}
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
          >
            <WorkCard
              work={work}
              members={members}
              onClick={() => onSelect(work)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function MembersOnlyEventWorksBrowser({
  accessToken,
  invalidateAuthentication,
}: {
  accessToken: string;
  invalidateAuthentication: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<EventWork | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const { works, directory, loadStatus } = useMembersOnlyEventWorks({
    accessToken,
    invalidateAuthentication,
    reloadKey,
  });

  const loadEventWorkDetail = useCallback(
    async (id: string, signal: AbortSignal) => {
      try {
        return await fetchMembersOnlyEventWork(id, accessToken, signal);
      } catch (error) {
        if (
          error instanceof MembersOnlyApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          invalidateAuthentication();
        }
        throw error;
      }
    },
    [accessToken, invalidateAuthentication],
  );
  const members = useMemo(() => directory.map(toMember), [directory]);
  const events = [...new Set(works.map((work) => work.event).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ja"),
  );
  const types = [...new Set(works.map((work) => work.type))].sort();
  const eventName = valid(searchParams.get("event"), events);
  const type = valid(searchParams.get("type"), types);
  const sortParam = searchParams.get("sort");
  const sort =
    sortParam === "new" || sortParam === "old" || sortParam === "title"
      ? sortParam
      : "grouped";

  const setFilter = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("year");
    if (value === "all" || (key === "sort" && value === "grouped")) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    router.push(`${pathname}${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  };

  const filteredWorks = useMemo(
    () =>
      works.filter(
        (work) =>
          (eventName === "all" || work.event === eventName) &&
          (type === "all" || work.type === type),
      ),
    [eventName, type, works],
  );
  const groups = useMemo(
    () => sort === "grouped" ? groupEventWorksByFiscalYear(filteredWorks) : [],
    [filteredWorks, sort],
  );
  const sortedWorks = useMemo(
    () => sort === "grouped" ? [] : sortEventWorks(filteredWorks, sort),
    [filteredWorks, sort],
  );

  const filters: FilterDefinition[] = [
    {
      key: "event",
      label: "イベント",
      value: eventName,
      options: [
        { value: "all", label: "すべて" },
        ...events.map((value) => ({ value, label: value })),
      ],
    },
    {
      key: "type",
      label: "タイプ",
      value: type,
      options: [
        { value: "all", label: "すべて" },
        ...types.map((value) => ({ value, label: typeLabel[value] })),
      ],
    },
    {
      key: "sort",
      label: "並び順",
      value: sort,
      options: [
        { value: "grouped", label: "年度別" },
        { value: "new", label: "新しい順" },
        { value: "old", label: "古い順" },
        { value: "title", label: "タイトル順" },
      ],
    },
  ];

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <MembersOnlyPanel>
        <MembersOnlySpinner />
        <h2 className={stateHeadingClassName}>作品一覧を読み込んでいます</h2>
      </MembersOnlyPanel>
    );
  }

  if (loadStatus === "error") {
    return (
      <MembersOnlyPanel role="alert">
        <span
          className="flex size-14 items-center justify-center rounded-full bg-red-50 font-['DM_Mono',monospace] text-3xl leading-none font-bold text-red-800"
          aria-hidden="true"
        >
          !
        </span>
        <h2 className={stateHeadingClassName}>作品一覧を読み込めませんでした</h2>
        <p className={stateDescriptionClassName}>
          時間をおいて、もう一度お試しください。
        </p>
        <button
          className="min-w-44 cursor-pointer rounded-sm border-0 bg-[image:var(--accent-gradient)] px-5 py-3 text-center font-bold text-slate-950 enabled:hover:-translate-y-px enabled:hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400"
          onClick={() => setReloadKey((key) => key + 1)}
        >
          再読み込み
        </button>
      </MembersOnlyPanel>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-12 pb-28">
      <div className="flex flex-wrap gap-3.5">
        {filters.map((filter) => (
          <label className={filterLabelClassName} key={filter.key}>
            {filter.label}
            <select
              className={filterSelectClassName}
              value={filter.value}
              onChange={(event) => setFilter(filter.key, event.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p className="mt-10 mb-5 font-['DM_Mono',monospace] text-xs text-slate-500">
        {filteredWorks.length} works
      </p>
      {filteredWorks.length === 0 ? (
        <p className="m-0 border border-slate-200 bg-white px-6 py-9 text-center text-slate-600">
          該当する作品はありません。
        </p>
      ) : sort === "grouped" ? (
        <div className="grid gap-10">
          {groups.map(({ fiscalYear, works }) => (
            <details className="group min-w-0" key={fiscalYear ?? "unknown"} open>
              <summary className="block cursor-pointer border border-slate-200 bg-slate-100 px-4 py-3 text-left text-xl font-bold tracking-tighter text-slate-900 transition-colors duration-200 hover:border-blue-300 hover:bg-slate-200 hover:text-[var(--blue)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 motion-reduce:transition-none md:text-2xl [&::-webkit-details-marker]:hidden">
                <h2 className="m-0 flex items-center justify-between gap-4">
                  <span>
                    {fiscalYear === null ? "年度不明" : `${fiscalYear}年度`} ({works.length})
                  </span>
                  <span
                    className="shrink-0 -rotate-90 text-xl leading-none text-[var(--blue)] transition-transform duration-200 group-open:rotate-0 motion-reduce:transition-none"
                    aria-hidden="true"
                  >
                    ↓
                  </span>
                </h2>
              </summary>
              <div className="pt-5">
                <EventWorkGrid
                  works={works}
                  members={members}
                  reduceMotion={reduceMotion}
                  onSelect={setSelected}
                />
              </div>
            </details>
          ))}
        </div>
      ) : (
        <EventWorkGrid
          works={sortedWorks}
          members={members}
          reduceMotion={reduceMotion}
          onSelect={setSelected}
        />
      )}
      {selected && (
        <WorkModal
          work={selected}
          kind="event"
          works={works}
          members={members}
          loadDetail={loadEventWorkDetail}
          memberHref={(id) =>
            `/members-only/members/profile?id=${encodeURIComponent(id)}`
          }
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
