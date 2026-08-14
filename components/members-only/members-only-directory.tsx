"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDiscordAuth } from "@/lib/discord-auth";
import {
  fetchMembersOnlyMembers,
  MembersOnlyApiError,
  type MembersOnlyMember,
} from "@/lib/members-only-api";
import { MemberIcon } from "../member-icon";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";
import memberStyles from "../members.module.css";
import styles from "./members-only.module.css";

type LoadStatus = "idle" | "loading" | "ready" | "error";
type FilterKey = "generation" | "department";
type MemberGroup = {
  generation: number;
  members: MembersOnlyMember[];
};

function MembersOnlyFilters({
  generations,
  departments,
  generation,
  department,
  onFilterChange,
  onLogout,
}: {
  generations: number[];
  departments: string[];
  generation: string;
  department: string;
  onFilterChange: (key: FilterKey, value: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className={styles.toolbar}>
      <div className="filters">
        <label>
          加入期
          <select
            value={generation}
            onChange={(event) =>
              onFilterChange("generation", event.target.value)
            }
          >
            <option value="all">すべて</option>
            {generations.map((value) => (
              <option key={value} value={value}>
                {value}期生
              </option>
            ))}
          </select>
        </label>
        <label>
          所属部門
          <select
            value={department}
            onChange={(event) =>
              onFilterChange("department", event.target.value)
            }
          >
            <option value="all">すべて</option>
            {departments.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className={styles.logoutButton} onClick={onLogout}>
        ログアウト
      </button>
    </div>
  );
}

function MembersOnlyMemberLink({ member }: { member: MembersOnlyMember }) {
  return (
    <Link
      href={`/members-only/members?id=${encodeURIComponent(member.id)}`}
      className={memberStyles.card}
    >
      <MemberIcon id={member.id} name={member.name} />
      <div>
        <p className="eyebrow">{member.department.join(" / ")}</p>
        <h3>{member.name}</h3>
        <span className={memberStyles.cta}>プロフィールを見る →</span>
      </div>
    </Link>
  );
}

function MembersOnlyList({
  memberGroups,
  memberCount,
  collapsedGenerations,
  reduceMotion,
  onToggleGeneration,
}: {
  memberGroups: MemberGroup[];
  memberCount: number;
  collapsedGenerations: Set<number>;
  reduceMotion: boolean | null;
  onToggleGeneration: (generation: number) => void;
}) {
  return (
    <>
      <p className="count">{memberCount} members</p>
      {memberGroups.length === 0 ? (
        <p className={memberStyles.empty}>該当するメンバーはいません。</p>
      ) : (
        <div className={memberStyles.groups}>
          {memberGroups.map((group) => {
            const isExpanded = !collapsedGenerations.has(group.generation);
            const contentId = `members-only-generation-${group.generation}`;

            return (
              <section className={memberStyles.group} key={group.generation}>
                <h2 className={memberStyles.groupHeading}>
                  <button
                    type="button"
                    className={memberStyles.groupToggle}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => onToggleGeneration(group.generation)}
                  >
                    <span>
                      {group.generation}期生 ({group.members.length})
                    </span>
                    <span className={memberStyles.chevron} aria-hidden="true">
                      ↓
                    </span>
                  </button>
                </h2>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={contentId}
                      className={memberStyles.groupContent}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.2, ease: "easeOut" }
                      }
                    >
                      <div
                        className={memberStyles.grid}
                        style={{ position: "relative" }}
                      >
                        <AnimatePresence mode="popLayout">
                          {group.members.map((member) => (
                            <motion.div
                              key={member.id}
                              layout
                              initial={
                                reduceMotion
                                  ? false
                                  : { opacity: 0, scale: 0.96 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.96 }}
                              transition={
                                reduceMotion
                                  ? { duration: 0 }
                                  : {
                                      duration: 0.16,
                                      layout: {
                                        duration: 0.25,
                                        ease: "easeOut",
                                      },
                                    }
                              }
                            >
                              <MembersOnlyMemberLink member={member} />
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

export function MembersOnlyDirectory() {
  const router = useRouter();
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
  const {
    accessToken,
    status: authStatus,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();
  const [members, setMembers] = useState<MembersOnlyMember[]>([]);
  const [collapsedGenerations, setCollapsedGenerations] = useState<Set<number>>(
    new Set(),
  );
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated" || !accessToken) return;

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
  }, [accessToken, authStatus, invalidateAuthentication, reloadKey]);

  const generations = useMemo(
    () => [...new Set(members.map((member) => member.generation))].sort((a, b) => a - b),
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
    rawDepartment && departments.includes(rawDepartment) ? rawDepartment : "all";
  const visibleMembers = members.filter(
    (member) =>
      (generation === "all" || member.generation === Number(generation)) &&
      (department === "all" || member.department.includes(department)),
  );
  const memberGroups = generations
    .map((value) => ({
      generation: value,
      members: visibleMembers.filter((member) => member.generation === value),
    }))
    .filter((group) => group.members.length > 0)
    .sort((a, b) => b.generation - a.generation);

  const setFilter = (key: FilterKey, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setCollapsedGenerations(new Set());
    router.push(`/members-only${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
    });
  };
  const toggleGeneration = (value: number) => {
    setCollapsedGenerations((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  if (authStatus !== "authenticated") {
    return (
      <MembersOnlyAuthPanel
        status={authStatus}
        onAuthenticate={startAuthentication}
      />
    );
  }

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <div className={styles.statePanel} aria-live="polite">
        <span className={styles.indicator} aria-hidden="true" />
        <h2>メンバー一覧を読み込んでいます</h2>
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className={styles.statePanel} role="alert">
        <span className={styles.errorMark} aria-hidden="true">!</span>
        <h2>メンバー一覧を読み込めませんでした</h2>
        <p>時間をおいて、もう一度お試しください。</p>
        <button className={styles.primaryButton} onClick={() => setReloadKey((key) => key + 1)}>
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <section className={memberStyles.main}>
      <MembersOnlyFilters
        generations={generations}
        departments={departments}
        generation={generation}
        department={department}
        onFilterChange={setFilter}
        onLogout={logout}
      />
      <MembersOnlyList
        memberGroups={memberGroups}
        memberCount={visibleMembers.length}
        collapsedGenerations={collapsedGenerations}
        reduceMotion={reduceMotion}
        onToggleGeneration={toggleGeneration}
      />
    </section>
  );
}
