"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDiscordAuth } from "@/lib/discord-auth";
import {
  fetchMembersOnlyMember,
  fetchMembersOnlyMemberWorks,
  MembersOnlyApiError,
  type MembersOnlyMember,
  type MemberRole,
  type MemberWorkReference,
} from "@/lib/members-only-api";
import { MemberIcon } from "./member-icon";
import { MembersOnlyAuthPanel } from "./members-only-auth-panel";
import styles from "./members-only.module.css";

type LoadStatus = "idle" | "loading" | "ready" | "not-found" | "error";

const roleLabels: Record<MemberRole, string> = {
  REPRESENTATIVE: "代表",
  CG_LEAD: "CG部門長",
  DTM_LEAD: "DTM部門長",
  PROG_LEAD: "プログラミング部門長",
  MV_LEAD: "映像部門長",
};

function validMemberId(values: string[]): string | null {
  if (values.length !== 1) return null;
  const id = values[0];
  if (!id || id.length > 128 || /[\/\\?#\x00-\x1f]/.test(id)) return null;
  return id;
}

function workDate(work: MemberWorkReference): string {
  return work.workKind === "EVENT"
    ? work.releasedAt ?? "日付未設定"
    : work.createdAt ?? "日付未設定";
}

export function MembersOnlyDetail() {
  const params = useSearchParams();
  const memberId = validMemberId(params.getAll("id"));
  const {
    accessToken,
    status: authStatus,
    startAuthentication,
    logout,
    invalidateAuthentication,
  } = useDiscordAuth();
  const [member, setMember] = useState<MembersOnlyMember | null>(null);
  const [works, setWorks] = useState<MemberWorkReference[]>([]);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!memberId || authStatus !== "authenticated" || !accessToken) return;

    const controller = new AbortController();
    setLoadStatus("loading");

    void Promise.all([
      fetchMembersOnlyMember(memberId, accessToken, controller.signal),
      fetchMembersOnlyMemberWorks(memberId, accessToken, controller.signal),
    ])
      .then(([memberResponse, worksResponse]) => {
        setMember(memberResponse);
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
  }, [
    accessToken,
    authStatus,
    invalidateAuthentication,
    memberId,
    reloadKey,
  ]);

  if (!memberId) {
    return (
      <div className={styles.statePanel} role="alert">
        <span className={styles.errorMark} aria-hidden="true">!</span>
        <h2>メンバーが指定されていません</h2>
        <Link className={styles.primaryLink} href="/members-only">一覧へ戻る</Link>
      </div>
    );
  }

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
        <h2>メンバー情報を読み込んでいます</h2>
      </div>
    );
  }

  if (loadStatus === "not-found") {
    return (
      <div className={styles.statePanel} role="alert">
        <span className={styles.errorMark} aria-hidden="true">!</span>
        <h2>メンバーが見つかりません</h2>
        <Link className={styles.primaryLink} href="/members-only">一覧へ戻る</Link>
      </div>
    );
  }

  if (loadStatus === "error" || !member) {
    return (
      <div className={styles.statePanel} role="alert">
        <span className={styles.errorMark} aria-hidden="true">!</span>
        <h2>メンバー情報を読み込めませんでした</h2>
        <p>時間をおいて、もう一度お試しください。</p>
        <button className={styles.primaryButton} onClick={() => setReloadKey((key) => key + 1)}>
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.memberToolbar}>
        <Link href="/members-only">← メンバー一覧</Link>
        <button className={styles.logoutButton} onClick={logout}>ログアウト</button>
      </div>

      <section className="member-hero">
        <MemberIcon id={member.id} name={member.name} />
        <div>
          <p className="kicker">MEMBER PROFILE</p>
          <h1>{member.name}</h1>
          <p className="meta">
            第{member.generation}期 · {member.department.join(" / ")}
          </p>
          {member.roles.length > 0 && (
            <p className={styles.roles}>
              {member.roles.map((role) => roleLabels[role] ?? role).join(" / ")}
            </p>
          )}
          {member.profile && <p>{member.profile}</p>}
          <div className={styles.externalLinks}>
            {member.links.map((link) => (
              <a
                key={`${link.name}-${link.url}`}
                className="external"
                href={link.url}
                target="_blank"
                rel="noreferrer"
              >
                {link.name} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="collection-main member-works">
        <p className="kicker">WORKS BY {member.name.toUpperCase()}</p>
        <h2>制作作品</h2>
        {works.length === 0 ? (
          <p className={styles.empty}>登録されている作品はありません。</p>
        ) : (
          <div className={styles.workList}>
            {works.map((work, index) => (
              <article
                key={`${work.workKind}-${work.eventWorkId ?? work.personalWorkId ?? index}`}
                className={styles.workItem}
              >
                <div>
                  <span>
                    {work.workKind === "EVENT" ? "イベント作品" : "個人作品"}
                  </span>
                  {work.isMeta && <span>共通クレジット</span>}
                </div>
                <h3>{work.title}</h3>
                <time>{workDate(work)}</time>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
