export type WorkType =
  | "Illustration"
  | "Programming"
  | "Movie"
  | "Music"
  | "MusicAndIllustration"
  | "WorkInfo"
  | "Tool"
  | "Other";

export type Link = {
  name: string;
  url: string;
  embedUrl?: string;
};

export type Member = {
  id: string;
  name: string;
  generation: number;
  department: string[];
  roles?: string[];
  icon?: string;
  profile?: string;
  links: Link[];
};

export type EventCreator = {
  memberName: string | null;
  creatorId: string | null;
};

export type EventCredit = {
  id: string;
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  trackNumber: number;
  creatorIds: EventCreator[];
  workTitle: string;
  type: WorkType;
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
  credits?: EventCredit[];
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

export type Work = EventWork | PersonalWork;
export type CollectionKind = "event" | "personal";

export const typeLabel: Record<WorkType, string> = {
  Illustration: "イラスト",
  Programming: "プログラミング",
  Movie: "動画",
  Music: "音楽",
  MusicAndIllustration: "音楽+イラスト",
  WorkInfo: "作品情報",
  Tool: "ツール",
  Other: "その他",
};

export const isEventWork = (work: Work): work is EventWork => "event" in work;

export const withBasePath = (path: string) => {
  if (/^(https?:)?\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
};
