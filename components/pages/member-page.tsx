import { eventWorks, members, personalWorks } from "../data";
import { Layout } from "../layout";
import { MemberIcon } from "../member-icon";
import { MemberWorksBrowser } from "../member-works-browser";

export function MemberPage({ id }: { id: string }) {
  const member = members.find((item) => item.id === id);
  if (!member)
    return (
      <Layout>
        <section className="page-head">
          <h1>Member not found</h1>
        </section>
      </Layout>
    );
  const works = [...personalWorks, ...eventWorks].filter((work) =>
    work.creatorIds.includes(id),
  );
  return (
    <Layout>
      <section className="member-hero">
        <MemberIcon id={member.id} name={member.name} />
        <div>
          <p className="kicker">MEMBER PROFILE</p>
          <h1>{member.name}</h1>
          <p className="meta">
            第{member.generation}期 · {member.department.join(" / ")}
          </p>
          <p>{member.profile}</p>
          {member.links.map((link) => (
            <a key={link.name} className="external" href={link.url}>
              {link.name} ↗
            </a>
          ))}
        </div>
      </section>
      <section className="collection-main member-works">
        <p className="kicker">WORKS BY {member.name.toUpperCase()}</p>
        <h2>制作作品</h2>
        <MemberWorksBrowser works={works} />
      </section>
    </Layout>
  );
}
