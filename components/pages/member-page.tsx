"use client";

import { useEffect, useState } from "react";
import {
  fetchEventWorks,
  fetchMember,
  fetchMembers,
  fetchPersonalWorks,
} from "@/lib/api";
import { Member, Work } from "../data";
import { Layout } from "../layout";
import { MemberIcon } from "../member-icon";
import { MemberWorksBrowser } from "../member-works-browser";

export function MemberPage({ id }: { id: string }) {
  const [member, setMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMember(null);
    setError(false);
    Promise.all([
      fetchMember(id),
      fetchMembers(),
      fetchEventWorks(),
      fetchPersonalWorks(),
    ])
      .then(([profile, directory, eventWorks, personalWorks]) => {
        if (cancelled) return;
        setMember(profile);
        setMembers(directory);
        setWorks(
          [...personalWorks, ...eventWorks].filter((work) =>
            work.creatorIds.includes(id),
          ),
        );
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error || !id) {
    return (
      <Layout>
        <section className="page-head">
          <h1>Member not found</h1>
        </section>
      </Layout>
    );
  }
  if (!member) {
    return (
      <Layout>
        <section className="page-head">読み込み中…</section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="member-hero">
        <MemberIcon id={member.id} name={member.name} />
        <div>
          <p className="kicker">MEMBER PROFILE</p>
          <h1>{member.name}</h1>
          <p className="meta">
            第{member.generation}期 / {member.department.join(" / ")}
          </p>
          <p>{member.profile}</p>
          {member.links.map((link) => (
            <a key={link.name} className="external" href={link.url}>
              {link.name} →
            </a>
          ))}
        </div>
      </section>
      <section className="collection-main member-works">
        <p className="kicker">WORKS BY {member.name.toUpperCase()}</p>
        <h2>制作作品</h2>
        <MemberWorksBrowser works={works} members={members} />
      </section>
    </Layout>
  );
}
