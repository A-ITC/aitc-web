"use client";

import { useEffect, useState } from "react";
import { fetchEventWorks, fetchMembers, fetchPersonalWorks } from "@/lib/api";
import { CollectionKind, Member, Work } from "./data";

const AITC_WORK_ID_PREFIX = "aitc_";

export function useCollectionData(kind: CollectionKind) {
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

  return { works, members, loading, error };
}
