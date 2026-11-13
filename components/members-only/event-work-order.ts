import type { EventWork } from "../data";

export type EventWorkSort = "new" | "old" | "title";

function getReleaseDate(work: EventWork): string | undefined {
  const { releasedAt } = work;
  if (!releasedAt || !/^\d{4}-\d{2}-\d{2}$/.test(releasedAt) || releasedAt.startsWith("0000")) {
    return undefined;
  }

  const date = new Date(releasedAt);
  if (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === releasedAt) {
    return releasedAt;
  }
  return undefined;
}

export function sortEventWorks(works: EventWork[], sort: EventWorkSort): EventWork[] {
  if (sort === "title") {
    return [...works].sort((a, b) => a.title.localeCompare(b.title, "ja"));
  }

  return works
    .map((work) => ({ work, date: getReleaseDate(work) }))
    .sort((a, b) => {
      if (!a.date) return b.date ? 1 : 0;
      if (!b.date) return -1;
      return sort === "old" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
    })
    .map(({ work }) => work);
}

function getFiscalYear(work: EventWork): number | null {
  const date = getReleaseDate(work);
  if (date) {
    const year = Number(date.slice(0, 4));
    const month = Number(date.slice(5, 7));
    return month < 4 ? year - 1 : year;
  }

  const explicitFiscalYear = /^(\d{4})年度$/.exec(work.releasedAt ?? "");
  return Number(explicitFiscalYear?.[1]) || null;
}

export function groupEventWorksByFiscalYear(works: EventWork[]) {
  const groups = new Map<number | null, EventWork[]>();
  for (const work of sortEventWorks(works, "new")) {
    const fiscalYear = getFiscalYear(work);
    const group = groups.get(fiscalYear) ?? [];
    group.push(work);
    groups.set(fiscalYear, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => (b ?? -1) - (a ?? -1))
    .map(([fiscalYear, works]) => ({ fiscalYear, works }));
}
