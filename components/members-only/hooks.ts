"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchMembersOnlyMember,
  fetchMembersOnlyMembers,
  fetchMembersOnlyMemberWorks,
  MembersOnlyApiError,
  type MembersOnlyMember,
  type MemberWorkReference,
} from "@/lib/members-only-api";

type DirectoryLoadStatus = "idle" | "loading" | "ready" | "error";
type DetailLoadStatus =
  | "idle"
  | "loading"
  | "ready"
  | "not-found"
  | "error";
type FilterKey = "generation" | "department";

export function useCollapsedGenerations() {
  const [collapsedGenerations, setCollapsedGenerations] = useState<Set<number>>(
    new Set(),
  );
  const resetCollapsedGenerations = useCallback(() => {
    setCollapsedGenerations(new Set());
  }, []);
  const toggleGeneration = useCallback((value: number) => {
    setCollapsedGenerations((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }, []);

  return {
    collapsedGenerations,
    resetCollapsedGenerations,
    toggleGeneration,
  };
}

export function useMembersOnlyFilters(
  members: MembersOnlyMember[],
  resetCollapsedGenerations: () => void,
  router: ReturnType<typeof useRouter>,
  params: ReturnType<typeof useSearchParams>,
) {
  const queryString = params.toString();

  const generations = useMemo(
    () =>
      [...new Set(members.map((member) => member.generation))].sort(
        (a, b) => a - b,
      ),
    [members],
  );
  const departments = useMemo(
    () => [...new Set(members.flatMap((member) => member.department))].sort(),
    [members],
  );

  const rawGeneration = params.get("generation");
  const generation =
    rawGeneration && generations.includes(Number(rawGeneration))
      ? rawGeneration
      : "all";
  const rawDepartment = params.get("department");
  const department =
    rawDepartment && departments.includes(rawDepartment)
      ? rawDepartment
      : "all";

  const setFilter = useCallback(
    (key: FilterKey, value: string) => {
      const next = new URLSearchParams(queryString);
      if (value === "all") next.delete(key);
      else next.set(key, value);
      resetCollapsedGenerations();
      router.push(
        `/members-only${next.size ? `?${next.toString()}` : ""}`,
        { scroll: false },
      );
    },
    [queryString, resetCollapsedGenerations, router],
  );

  return {
    generations,
    departments,
    generation,
    department,
    setFilter,
  };
}

export function useMembersOnlyDirectory({
  accessToken,
  invalidateAuthentication,
  reloadKey,
}: {
  accessToken: string;
  invalidateAuthentication: () => void;
  reloadKey: number;
}) {
  const [members, setMembers] = useState<MembersOnlyMember[]>([]);
  const [loadStatus, setLoadStatus] =
    useState<DirectoryLoadStatus>("idle");

  useEffect(() => {
    const controller = new AbortController();
    setLoadStatus("loading");

    void fetchMembersOnlyMembers(accessToken, controller.signal)
      .then((items) => {
        setMembers(items);
        setLoadStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (
          error instanceof MembersOnlyApiError &&
          (error.status === 401 || error.status === 403)
        ) {
          invalidateAuthentication();
          setLoadStatus("idle");
          return;
        }
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [accessToken, invalidateAuthentication, reloadKey]);

  return { members, loadStatus };
}

export function useMembersOnlyDetail({
  memberId,
  accessToken,
  invalidateAuthentication,
  reloadKey,
}: {
  memberId: string | null;
  accessToken: string;
  invalidateAuthentication: () => void;
  reloadKey: number;
}) {
  const [member, setMember] = useState<MembersOnlyMember | null>(null);
  const [works, setWorks] = useState<MemberWorkReference[]>([]);
  const [directory, setDirectory] = useState<MembersOnlyMember[]>([]);
  const [loadStatus, setLoadStatus] = useState<DetailLoadStatus>("idle");

  useEffect(() => {
    if (!memberId) return;

    const controller = new AbortController();
    setLoadStatus("loading");

    void Promise.all([
      fetchMembersOnlyMember(memberId, accessToken, controller.signal),
      fetchMembersOnlyMembers(accessToken, controller.signal),
      fetchMembersOnlyMemberWorks(memberId, accessToken, controller.signal),
    ])
      .then(([memberResponse, directoryResponse, worksResponse]) => {
        setMember(memberResponse);
        setDirectory(directoryResponse);
        setWorks(worksResponse);
        setLoadStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof MembersOnlyApiError) {
          if (error.status === 401 || error.status === 403) {
            invalidateAuthentication();
            setLoadStatus("idle");
            return;
          }
          if (error.status === 404) {
            setLoadStatus("not-found");
            return;
          }
        }
        setLoadStatus("error");
      });

    return () => controller.abort();
  }, [accessToken, invalidateAuthentication, memberId, reloadKey]);

  return { loadStatus, member, works, directory };
}
