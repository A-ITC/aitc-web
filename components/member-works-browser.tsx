"use client";

import { useState } from "react";
import { CollectionKind, isEventWork, Member, Work } from "./data";
import { WorkCard, WorkModal } from "./work-ui";

export function MemberWorksBrowser({
  works,
  members,
}: {
  works: Work[];
  members: Member[];
}) {
  const [selected, setSelected] = useState<Work | null>(null);
  const kind: CollectionKind =
    selected && isEventWork(selected) ? "event" : "personal";
  return (
    <>
      <div className="works-grid">
        {works.map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            onClick={() => setSelected(work)}
            members={members}
          />
        ))}
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
    </>
  );
}
