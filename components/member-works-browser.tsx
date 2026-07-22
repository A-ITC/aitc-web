"use client";

import { useState } from "react";
import { CollectionKind, Work } from "./data";
import { WorkCard, WorkModal } from "./work-ui";

export function MemberWorksBrowser({ works }: { works: Work[] }) {
  const [selected, setSelected] = useState<Work | null>(null);
  const kind: CollectionKind =
    selected && "event" in selected ? "event" : "personal";
  return (
    <>
      <div className="works-grid">
        {works.map((work) => (
          <WorkCard
            key={work.id}
            work={work}
            onClick={() => setSelected(work)}
          />
        ))}
      </div>
      {selected && (
        <WorkModal
          work={selected}
          kind={kind}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
