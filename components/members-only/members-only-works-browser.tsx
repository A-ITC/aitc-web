"use client";

import { useCallback, useMemo, useState } from "react";
import { workThumbnailUrl } from "@/lib/api";
import {
  fetchMembersOnlyEventWork,
  MembersOnlyApiError,
  type MembersOnlyMember,
  type MemberWorkReference,
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

type SelectedWork = {
  work: Work;
  kind: "event" | "personal";
};

type EventWorkGroup = {
  work: EventWork;
  references: MemberWorkReference[];
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
  a: MemberWorkReference,
  b: MemberWorkReference,
) {
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

export function MembersOnlyWorksBrowser({
  references,
  eventWorks,
  memberId,
  directory,
  accessToken,
  invalidateAuthentication,
}: {
  references: MemberWorkReference[];
  eventWorks: EventWork[];
  memberId: string;
  directory: MembersOnlyMember[];
  accessToken: string;
  invalidateAuthentication: () => void;
}) {
  const [selected, setSelected] = useState<SelectedWork | null>(null);
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

    return eventWorks
      .filter((work) => referencesByEventWork.has(work.id))
      .map((work) => ({
        work,
        references: [...(referencesByEventWork.get(work.id) ?? [])].sort(
          (a, b) => compareReferences(work, a, b),
        ),
      }))
      .sort(
        (a, b) =>
          b.work.year - a.work.year ||
          a.work.event.localeCompare(b.work.event, "ja") ||
          a.work.title.localeCompare(b.work.title, "ja"),
      );
  }, [eventWorks, references]);
  const modalWorks = useMemo<Work[]>(
    () => [...eventGroups.map((group) => group.work), ...personalWorks],
    [eventGroups, personalWorks],
  );
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
            {eventGroups.map(({ work, references: groupReferences }) => (
              <article key={work.id}>
                <button
                  className="group grid w-full cursor-pointer grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5 border-0 bg-transparent p-0 text-left text-inherit transition-colors duration-200 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-400 motion-reduce:transition-none md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8"
                  onClick={() => setSelected({ work, kind: "event" })}
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
                  {groupReferences.map((reference, index) => {
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
              </article>
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
