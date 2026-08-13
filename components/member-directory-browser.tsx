"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMembers } from "@/lib/api";
import { Member } from "./data";
import { MemberIcon } from "./member-icon";
import styles from "./members.module.css";

export function MemberDirectoryBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
  const [members, setMembers] = useState<Member[]>([]);
  const [collapsedGenerations, setCollapsedGenerations] = useState<Set<number>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    fetchMembers()
      .then((items) => {
        if (!cancelled) setMembers(items);
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
  }, []);
  const generations = [
    ...new Set(members.map((member) => member.generation)),
  ].sort((a, b) => a - b);
  const departments = [
    ...new Set(members.flatMap((member) => member.department)),
  ].sort();
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
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setCollapsedGenerations(new Set());
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  const visible = members.filter(
    (member) =>
      (generation === "all" || member.generation === Number(generation)) &&
      (department === "all" || member.department.includes(department)),
  );
  const memberGroups = generations
    .map((value) => ({
      generation: value,
      members: visible.filter((member) => member.generation === value),
    }))
    .filter((group) => group.members.length > 0)
    .sort((a, b) => b.generation - a.generation);
  const toggleGeneration = (value: number) => {
    setCollapsedGenerations((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  if (loading) return <section className={styles.main}>読み込み中…</section>;
  if (error)
    return (
      <section className={styles.main}>データを取得できませんでした。</section>
    );

  return (
    <section className={styles.main}>
      <div className="filters">
        <label>
          加入期
          <select
            value={generation}
            onChange={(event) => setFilter("generation", event.target.value)}
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
            onChange={(event) => setFilter("department", event.target.value)}
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
      <p className="count">{visible.length} members</p>
      {memberGroups.length === 0 ? (
        <p className={styles.empty}>該当するメンバーはいません。</p>
      ) : (
        <div className={styles.groups}>
          {memberGroups.map((group) => {
            const isExpanded = !collapsedGenerations.has(group.generation);
            const contentId = `generation-${group.generation}-members`;

            return (
              <section className={styles.group} key={group.generation}>
                <h2 className={styles.groupHeading}>
                  <button
                    type="button"
                    className={styles.groupToggle}
                    aria-expanded={isExpanded}
                    aria-controls={contentId}
                    onClick={() => toggleGeneration(group.generation)}
                  >
                    <span>
                      {group.generation}期生 ({group.members.length})
                    </span>
                    <span className={styles.chevron} aria-hidden="true">
                      ↓
                    </span>
                  </button>
                </h2>
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      id={contentId}
                      className={styles.groupContent}
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
                        className={styles.grid}
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
                              <Link
                                href={`/member?id=${encodeURIComponent(member.id)}`}
                                className={styles.card}
                              >
                                <MemberIcon id={member.id} name={member.name} />
                                <div>
                                  <p className="eyebrow">
                                    {member.department.join(" / ")}
                                  </p>
                                  <h3>{member.name}</h3>
                                  <span className={styles.cta}>
                                    プロフィールを見る →
                                  </span>
                                </div>
                              </Link>
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
    </section>
  );
}
