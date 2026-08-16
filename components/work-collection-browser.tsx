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
    key: "year" | "author" | "event" | "type" | "sort",
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
      <div className="flex flex-wrap gap-3.5 [&_label]:flex [&_label]:items-center [&_label]:gap-2 [&_label]:text-xs [&_label]:font-bold [&_select]:rounded-none [&_select]:border [&_select]:border-slate-200 [&_select]:bg-white [&_select]:py-2 [&_select]:pr-8 [&_select]:pl-3 [&_select]:text-slate-900">
        <label>
          年
          <select
            value={year}
            onChange={(e) => setFilter("year", e.target.value)}
          >
            <option value="all">すべて</option>
            {years.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {kind === "event" && (
          <label>
            イベント
            <select
              value={eventName}
              onChange={(e) => setFilter("event", e.target.value)}
            >
              <option value="all">すべて</option>
              {events.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        )}
        {kind === "personal" && (
          <label>
            作者
            <select
              value={author}
              onChange={(e) => setFilter("author", e.target.value)}
            >
              <option value="all">すべて</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          タイプ
          <select
            value={type}
            onChange={(e) => setFilter("type", e.target.value)}
          >
            <option value="all">すべて</option>
            {types.map((value) => (
              <option key={value} value={value}>
                {typeLabel[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          並び順
          <select
            value={sort}
            onChange={(e) => setFilter("sort", e.target.value)}
          >
            <option value="new">新しい順</option>
            <option value="old">古い順</option>
            <option value="title">タイトル順</option>
          </select>
        </label>
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
