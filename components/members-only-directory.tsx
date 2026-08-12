"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDiscordAuth } from "@/lib/discord-auth";
import {
  fetchMembersOnlyMembers,
  MembersOnlyApiError,
  type MembersOnlyMember,
} from "@/lib/members-only-api";
import { MemberIcon } from "./member-icon";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";
import memberStyles from "./members.module.css";
import styles from "./members-only.module.css";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export function MembersOnlyDirectory() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    accessToken,
    status: authStatus,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();
  const [members, setMembers] = useState<MembersOnlyMember[]>([]);
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

  const setFilter = (key: "generation" | "department", value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete(key);
    else next.set(key, value);
    router.push(`/members-only${next.size ? `?${next.toString()}` : ""}`, {
      scroll: false,
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
      <div className={styles.toolbar}>
        <div className="filters">
          <label>
            加入期
            <select
              value={generation}
              onChange={(event) => setFilter("generation", event.target.value)}
            >
              <option value="all">すべて</option>
              {generations.map((value) => (
                <option key={value} value={value}>{value}期生</option>
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
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <button className={styles.logoutButton} onClick={logout}>ログアウト</button>
      </div>

      <p className="count">{visibleMembers.length} members</p>
      <div className={memberStyles.grid}>
        {visibleMembers.map((member) => (
          <Link
            key={member.id}
            href={`/members-only/members?id=${encodeURIComponent(member.id)}`}
            className={memberStyles.card}
          >
            <MemberIcon id={member.id} name={member.name} />
            <div>
              <p className="eyebrow">
                {member.department.join(" / ")} · 第{member.generation}期
              </p>
              <h2>{member.name}</h2>
              <p className={memberStyles.description}>{member.profile}</p>
              <span className={memberStyles.cta}>プロフィールを見る →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
