import membersData from "@/data/members.json";
import eventWorksData from "@/data/eventWorks.json";
import personalWorksData from "@/data/personalWorks.json";

export type WorkType =
  | "Illustration"
  | "Programming"
  | "Movie"
  | "Music"
  | "Tool"
  | "Other";
export type Link = { name: string; url: string };
export type Member = {
  id: string;
  name: string;
  generation: number;
  department: string[];
  icon?: string;
  profile?: string;
  links: Link[];
};
export type EventWork = {
  id: string;
  title: string;
  thumbnail: string;
  type: WorkType;
  description: string;
  creatorIds: string[];
  event: string;
  year: number;
  links: Link[];
};
export type PersonalWork = {
  id: string;
  title: string;
  thumbnail: string;
  creatorIds: string[];
  type: WorkType;
  description: string;
  createdAt: string;
  links: Link[];
};
const members = membersData as Member[];
const eventWorks = eventWorksData as EventWork[];
const personalWorks = personalWorksData as PersonalWork[];

export { members, eventWorks, personalWorks };
export type Work = EventWork | PersonalWork;
export type CollectionKind = "event" | "personal";

export const typeLabel: Record<string, string> = {
  Illustration: "イラスト",
  Programming: "プログラミング",
  Movie: "映像",
  Music: "音楽",
  Tool: "ツール",
  Other: "その他",
};

export const memberFor = (id: string) =>
  members.find((member) => member.id === id)!;
export const displayCreators = (ids: string[]) =>
  ids.map((id) => memberFor(id).name).join(" / ");

export const withBasePath = (path: string) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
