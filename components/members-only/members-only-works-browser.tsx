"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { workThumbnailUrl } from "@/lib/api";
import type {
  MembersOnlyMember,
  MemberWorkReference,
} from "@/lib/members-only-api";
import {
  isEventWork,
  type EventWork,
  type Member,
  type PersonalWork,
  type Work,
  withBasePath,
} from "../data";
import { WorkCard, WorkModal } from "../work-ui";
import {
  type EventWorkDetailState,
  useEventWorkDetails,
} from "./event-work-details";

type SelectedWork = {
  work: Work;
  kind: "event" | "personal";
};

type EventWorkGroup = {
  work: EventWork;
  references: MemberWorkReference[];
  detailState?: EventWorkDetailState;
};

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

function toPersonalWork(
  reference: MemberWorkReference,
  memberId: string,
): PersonalWork {
  const id = reference.personalWorkId ?? "";
  return {
    id,
    title: reference.title,
    thumbnail: workThumbnailUrl(id),
    type: reference.type ?? "Other",
    creatorIds:
      reference.creatorIds && reference.creatorIds.length > 0
        ? reference.creatorIds
        : [memberId],
    description: reference.description ?? "",
    links: reference.links ?? [],
    createdAt: reference.createdAt ?? "",
  };
}

function toEventWorkSummary(
  id: string,
  references: MemberWorkReference[],
): EventWork {
  const reference =
    references.find(
      (item) => item.eventWorkTitle || item.eventName || item.releasedAt,
    ) ?? references[0];
  const releasedAt = reference?.releasedAt ?? "";
  const event = reference?.eventName ?? "";

  return {
    id,
    title: reference?.eventWorkTitle ?? event,
    thumbnail: workThumbnailUrl(id),
    type: reference?.type ?? "Other",
    description: "",
    creatorIds: [],
    event,
    year: Number(releasedAt.slice(0, 4)) || 0,
    links: [],
  };
}

function trackNumber(
  reference: MemberWorkReference,
  work: EventWork,
): number | string | undefined {
  if (reference.isMeta) return undefined;
  return work.credits?.find((credit) => credit.id === reference.creditId)
    ?.trackNumber;
}

function compareReferences(
  work: EventWork,
  hasDetail: boolean,
  a: MemberWorkReference,
  b: MemberWorkReference,
) {
  if (Boolean(a.isMeta) !== Boolean(b.isMeta)) return a.isMeta ? -1 : 1;
  if (!hasDetail) return 0;

  const aNumber = trackNumber(a, work);
  const bNumber = trackNumber(b, work);
  if ((aNumber === undefined) !== (bNumber === undefined)) {
    return aNumber === undefined ? -1 : 1;
  }
  const numericDifference = Number(aNumber) - Number(bNumber);
  if (Number.isFinite(numericDifference) && numericDifference !== 0) {
    return numericDifference;
  }
  return String(aNumber ?? "").localeCompare(String(bNumber ?? ""), "ja", {
    numeric: true,
  });
}

function EventWorkGroupCard({
  group,
  loadDetail,
  openModal,
}: {
  group: EventWorkGroup;
  loadDetail: (id: string, priority?: boolean) => Promise<EventWork>;
  openModal: (work: EventWork) => void;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const { work, references, detailState } = group;
  const isLoading =
    detailState?.status === "queued" || detailState?.status === "loading";

  useEffect(() => {
    const element = articleRef.current;
    if (!element || detailState) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        void loadDetail(work.id).catch(() => undefined);
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [detailState, loadDetail, work.id]);

  return (
    <article ref={articleRef} aria-busy={isLoading || undefined}>
      <button
        className="group grid w-full cursor-pointer grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 border-0 bg-transparent p-0 text-left text-inherit transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 motion-reduce:transition-none md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8"
        onClick={() => openModal(work)}
      >
        <span className="block aspect-square overflow-hidden bg-slate-200">
          <img
            className="block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 group-focus-visible:scale-105"
            src={withBasePath(work.thumbnail)}
            alt={`${work.title}のサムネイル`}
            loading="lazy"
          />
        </span>
        <span className="min-w-0">
          <span className="block font-['DM_Mono',monospace] text-sm font-medium tracking-widest text-[var(--blue)] md:text-base">
            {work.year || "—"}
          </span>
          <strong className="mt-2 block text-xl leading-snug tracking-tight md:text-3xl">
            {work.title || work.event}
          </strong>
          {work.event && work.event !== work.title && (
            <span className="mt-1.5 block text-sm text-slate-500">
              {work.event}
            </span>
          )}
        </span>
      </button>
      <ul className="mt-4 ml-7 divide-y divide-slate-200 border-l-2 border-slate-200 pl-5 md:ml-20 md:pl-8">
        {references.map((reference, index) => {
          const number = trackNumber(reference, work);
          return (
            <li
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3 py-3 text-sm leading-relaxed md:grid-cols-[5rem_minmax(0,1fr)] md:text-base"
              key={`${reference.creditId ?? reference.title}-${index}`}
            >
              <span className="font-['DM_Mono',monospace] tabular-nums text-slate-500">
                {number === undefined ? "" : number}
              </span>
              <span>{reference.title}</span>
            </li>
          );
        })}
      </ul>
      {detailState?.status === "error" && (
        <div className="mt-3 ml-7 flex flex-wrap items-center gap-3 text-sm md:ml-20">
          <span className="text-slate-500">詳細を取得できませんでした。</span>
          <button
            type="button"
            className="cursor-pointer border-0 bg-transparent p-0 font-bold text-[var(--blue)] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-orange-400"
            onClick={() => {
              void loadDetail(work.id, true).catch(() => undefined);
            }}
          >
            詳細を再読み込み
          </button>
        </div>
      )}
    </article>
  );
}

export function MembersOnlyWorksBrowser({
  references,
  memberId,
  directory,
  accessToken,
  invalidateAuthentication,
}: {
  references: MemberWorkReference[];
  memberId: string;
  directory: MembersOnlyMember[];
  accessToken: string;
  invalidateAuthentication: () => void;
}) {
  const [selected, setSelected] = useState<SelectedWork | null>(null);
  const { states, load } = useEventWorkDetails({
    accessToken,
    invalidateAuthentication,
  });
  const members = useMemo(() => directory.map(toMember), [directory]);
  const personalReferences = useMemo(
    () => references.filter((reference) => reference.workKind === "PERSONAL"),
    [references],
  );
  const personalWorks = useMemo(
    () =>
      personalReferences.map((reference) =>
        toPersonalWork(reference, memberId),
      ),
    [memberId, personalReferences],
  );
  const eventGroups = useMemo<EventWorkGroup[]>(() => {
    const referencesByEventWork = new Map<string, MemberWorkReference[]>();
    references
      .filter(
        (reference) =>
          reference.workKind === "EVENT" && Boolean(reference.eventWorkId),
      )
      .forEach((reference) => {
        const id = reference.eventWorkId as string;
        const group = referencesByEventWork.get(id) ?? [];
        group.push(reference);
        referencesByEventWork.set(id, group);
      });

    return [...referencesByEventWork.entries()]
      .map(([id, groupReferences]) => {
        const detailState = states[id];
        const work =
          detailState?.work ?? toEventWorkSummary(id, groupReferences);
        return {
          work,
          detailState,
          references: [...groupReferences].sort((a, b) =>
            compareReferences(
              work,
              detailState?.status === "ready",
              a,
              b,
            ),
          ),
        };
      })
      .sort(
        (a, b) =>
          b.work.year - a.work.year ||
          a.work.event.localeCompare(b.work.event, "ja") ||
          a.work.title.localeCompare(b.work.title, "ja"),
      );
  }, [references, states]);
  const modalWorks = useMemo<Work[]>(
    () => [...eventGroups.map((group) => group.work), ...personalWorks],
    [eventGroups, personalWorks],
  );
  const loadEventWorkDetail = useCallback(
    (id: string, _signal: AbortSignal) => load(id, true),
    [load],
  );
  const openEventWorkModal = useCallback(
    (work: EventWork) => {
      void load(work.id, true).catch(() => undefined);
      setSelected({ work, kind: "event" });
    },
    [load],
  );

  return (
    <>
      {eventGroups.length > 0 && (
        <section aria-labelledby="event-works-title">
          <h3
            id="event-works-title"
            className="mt-0 mb-6 text-xl tracking-tighter md:text-2xl"
          >
            イベント作品
          </h3>
          <div className="space-y-9 md:space-y-12">
            {eventGroups.map((group) => (
              <EventWorkGroupCard
                key={group.work.id}
                group={group}
                loadDetail={load}
                openModal={openEventWorkModal}
              />
            ))}
          </div>
        </section>
      )}

      {personalWorks.length > 0 && (
        <section
          className={
            eventGroups.length > 0
              ? "mt-16 border-t border-slate-200 pt-10"
              : ""
          }
          aria-labelledby="personal-works-title"
        >
          <h3
            id="personal-works-title"
            className="mt-0 mb-6 text-xl tracking-tighter md:text-2xl"
          >
            個人作品
          </h3>
          <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {personalWorks.map((work, index) => (
              <WorkCard
                key={`${work.id}-${index}`}
                work={work}
                onClick={() => setSelected({ work, kind: "personal" })}
                members={members}
              />
            ))}
          </div>
        </section>
      )}

      {selected && (
        <WorkModal
          work={selected.work}
          kind={selected.kind}
          works={modalWorks}
          members={members}
          loadDetail={
            isEventWork(selected.work) ? loadEventWorkDetail : undefined
          }
          memberHref={(id) =>
            `/members-only/members/profile?id=${encodeURIComponent(id)}`
          }
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
