"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { members } from "./data";
import { MemberIcon } from "./member-icon";
import styles from "./members.module.css";

export function MemberDirectoryBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduceMotion = useReducedMotion();
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
    router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };
  const visible = members.filter(
    (member) =>
      (generation === "all" || member.generation === Number(generation)) &&
      (department === "all" || member.department.includes(department)),
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
      <div className={styles.grid} style={{ position: "relative" }}>
        <AnimatePresence mode="popLayout">
          {visible.map((member) => (
            <motion.div
              key={member.id}
              layout
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.16,
                      layout: { duration: 0.25, ease: "easeOut" },
                    }
              }
            >
              <Link href={`/members/${member.id}`} className={styles.card}>
                <MemberIcon id={member.id} name={member.name} />
                <div>
                  <p className="eyebrow">
                    {member.department.join(" / ")} · 第{member.generation}期
                  </p>
                  <h2>{member.name}</h2>
                  <p className={styles.description}>{member.profile}</p>
                  <span className={styles.cta}>プロフィールを見る →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
