"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { fetchEventWorks, fetchMembers, fetchPersonalWorks } from "@/lib/api";
import {
  CollectionKind,
  EventWork,
  Member,
  PersonalWork,
  typeLabel,
  Work,
} from "./data";
import { WorkCard, WorkModal } from "./work-ui";

const AITC_WORK_ID_PREFIX = "aitc_";
const filterLabelClassName = "flex items-center gap-2 text-xs font-bold";
const filterSelectClassName =
  "rounded-none border border-slate-200 bg-white py-2 pr-8 pl-3 text-slate-900";

type FilterKey = "year" | "author" | "event" | "type" | "sort";
type FilterDefinition = {
  key: FilterKey;
  label: string;
  value: string;
  options: { value: string; label: string }[];
};

const valid = (value: string | null, values: string[]) =>
  value && values.includes(value) ? value : "all";

export function CollectionBrowser({ kind }: { kind: CollectionKind }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState<Work | null>(null);
  const [works, setWorks] = useState<Work[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      kind === "event" ? fetchEventWorks() : fetchPersonalWorks(),
      fetchMembers(),
    ])
      .then(([nextWorks, nextMembers]) => {
        if (cancelled) return;
        setWorks(
          kind === "event"
            ? nextWorks.filter((work) =>
                work.id.startsWith(AITC_WORK_ID_PREFIX),
              )
            : nextWorks,
        );
        setMembers(nextMembers);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const eventWorks = works as EventWork[];
  const personalWorks = works as PersonalWork[];
  const years = [
    ...new Set(
      works.map((work) =>
        kind === "event"
          ? String((work as EventWork).year)
          : (work as PersonalWork).createdAt.slice(0, 4),
      ),
    ),
  ].sort((a, b) => Number(b) - Number(a));
  const events =
    kind === "event" ? [...new Set(eventWorks.map((work) => work.event))] : [];
  const types = [...new Set(works.map((work) => work.type))].sort();

  const year = valid(searchParams.get("year"), years);
  const author = valid(
    searchParams.get("author"),
    members.map((member) => member.id),
  );
  const eventName = valid(searchParams.get("event"), events);
  const type = valid(searchParams.get("type"), types);
  const sort = valid(searchParams.get("sort"), ["new", "old", "title"]);

  const setFilter = (
    key: FilterKey,
    value: string,
  ) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value === "all" || (key === "sort" && value === "new"))
      next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const visibleWorks = useMemo(
    () =>
      [...works]
        .filter((work) => {
          const workYear =
            kind === "event"
              ? String((work as EventWork).year)
              : (work as PersonalWork).createdAt.slice(0, 4);
          return (
            (year === "all" || workYear === year) &&
            (author === "all" || work.creatorIds.includes(author)) &&
            (type === "all" || work.type === type) &&
            (eventName === "all" ||
              (kind === "event" && (work as EventWork).event === eventName))
          );
        })
        .sort((a, b) => {
          if (sort === "title") return a.title.localeCompare(b.title, "ja");
          const date = (work: Work) =>
            kind === "event"
              ? (work as EventWork).year
              : Date.parse((work as PersonalWork).createdAt);
          return sort === "old" ? date(a) - date(b) : date(b) - date(a);
        }),
    [author, eventName, kind, sort, type, works, year],
  );

  const filters: FilterDefinition[] = [
    {
      key: "year",
      label: "年",
      value: year,
      options: [
        { value: "all", label: "すべて" },
        ...years.map((value) => ({ value, label: value })),
      ],
    },
    ...(kind === "event"
      ? [
          {
            key: "event" as const,
            label: "イベント",
            value: eventName,
            options: [
              { value: "all", label: "すべて" },
              ...events.map((value) => ({ value, label: value })),
            ],
          },
        ]
      : [
          {
            key: "author" as const,
            label: "作者",
            value: author,
            options: [
              { value: "all", label: "すべて" },
              ...members.map((member) => ({
                value: member.id,
                label: member.name,
              })),
            ],
          },
        ]),
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
        { value: "new", label: "新しい順" },
        { value: "old", label: "古い順" },
        { value: "title", label: "タイトル順" },
      ],
    },
  ];

  if (loading)
    return <section className="mx-auto max-w-6xl px-6 pt-10 pb-28">読み込み中…</section>;
  if (error)
    return (
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-28">
        データを取得できませんでした。
      </section>
    );

  return (
    <section className="mx-auto max-w-6xl px-6 pt-10 pb-28">
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
      <p className="mt-10 mb-5 font-['DM_Mono',monospace] text-xs text-slate-500">{visibleWorks.length} works</p>
      <div className="relative grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visibleWorks.map((work) => (
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
                onClick={() => setSelected(work)}
                showCreator={kind === "personal"}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {selected && (
        <WorkModal
          work={selected}
          kind={kind}
          works={works}
          members={members}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
