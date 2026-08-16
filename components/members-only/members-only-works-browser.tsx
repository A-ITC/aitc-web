"use client";

import { useState } from "react";
import { workThumbnailUrl } from "@/lib/api";
import type {
  MembersOnlyMember,
  MemberWorkReference,
} from "@/lib/members-only-api";
import type { Member, Work } from "../data";
import { WorkCard, WorkModal } from "../work-ui";

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

function toWork(reference: MemberWorkReference, memberId: string): Work {
  const id =
    reference.workKind === "EVENT"
      ? reference.eventWorkId ?? ""
      : reference.personalWorkId ?? "";
  const common = {
    id,
    thumbnail: workThumbnailUrl(id),
    type: reference.type ?? "Other",
    creatorIds:
      reference.creatorIds && reference.creatorIds.length > 0
        ? reference.creatorIds
        : [memberId],
    description: reference.description ?? "",
    links: reference.links ?? [],
  };

  if (reference.workKind === "EVENT") {
    return {
      ...common,
      title: reference.eventWorkTitle ?? reference.title,
      event: reference.eventName ?? "",
      year: Number(reference.releasedAt?.slice(0, 4)) || 0,
      credits: [],
    };
  }

  return {
    ...common,
    title: reference.title,
    createdAt: reference.createdAt ?? "",
  };
}

export function MembersOnlyWorksBrowser({
  references,
  memberId,
  directory,
}: {
  references: MemberWorkReference[];
  memberId: string;
  directory: MembersOnlyMember[];
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const works = references.map((reference) => toWork(reference, memberId));
  const members = directory.map(toMember);
  const selected = selectedIndex === null ? null : works[selectedIndex];
  const selectedReference =
    selectedIndex === null ? null : references[selectedIndex];

  return (
    <>
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
        {references.map((reference, index) => (
          <WorkCard
            key={`${reference.workKind}-${reference.eventWorkId ?? reference.personalWorkId}-${index}`}
            work={works[index]}
            displayTitle={reference.title}
            onClick={() => setSelectedIndex(index)}
            members={members}
          />
        ))}
      </div>
      {selected && selectedReference && (
        <WorkModal
          work={selected}
          kind={selectedReference.workKind === "EVENT" ? "event" : "personal"}
          works={works}
          members={members}
          memberHref={(id) =>
            `/members-only/members?id=${encodeURIComponent(id)}`
          }
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  );
}
