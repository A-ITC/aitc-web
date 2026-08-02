import type {
  EventWork,
  Member,
  PersonalWork,
  Work,
  WorkType,
} from "@/components/data";

const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://uvhug6af4a.execute-api.ap-northeast-1.amazonaws.com"
).replace(/\/$/, "");

const workThumbnailBaseUrl = (
  process.env.NEXT_PUBLIC_WORK_THUMBNAIL_BASE_URL ??
  "https://d1tie8g2r03vuj.cloudfront.net/work-thumbnails"
).replace(/\/$/, "");

type ApiList<T> = { items: T[] };
type ApiWork = Partial<EventWork & PersonalWork> & {
  id: string;
  title: string;
  type: WorkType;
  creatorIds?: string[];
  eventName?: string;
  releasedAt?: string;
  publishedAt?: string;
};

type ApiMemberWork = Partial<ApiWork> & {
  workKind?: "EVENT" | "PERSONAL";
  eventWorkId?: string;
  personalWorkId?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.status}`,
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

function workThumbnailUrl(id: string): string {
  return `${workThumbnailBaseUrl}/${encodeURIComponent(id)}.png`;
}

function normalizeMember(
  member: Partial<Member> & Pick<Member, "id" | "name">,
): Member {
  return {
    ...member,
    generation: member.generation ?? 0,
    department: member.department ?? [],
    links: member.links ?? [],
  };
}

function normalizeEventWork(work: ApiWork): EventWork {
  const releasedAt = work.releasedAt ?? "";
  return {
    id: work.id,
    title: work.title,
    thumbnail: workThumbnailUrl(work.id),
    type: work.type,
    description: work.description ?? "",
    creatorIds: work.creatorIds ?? [],
    event: work.event ?? work.eventName ?? "",
    year: work.year ?? (Number(releasedAt.slice(0, 4)) || 0),
    links: work.links ?? [],
    credits: work.credits ?? [],
  };
}

function normalizePersonalWork(work: ApiWork): PersonalWork {
  return {
    id: work.id,
    title: work.title,
    thumbnail: workThumbnailUrl(work.id),
    type: work.type,
    description: work.description ?? "",
    creatorIds: work.creatorIds ?? [],
    createdAt: work.createdAt ?? work.publishedAt ?? "",
    links: work.links ?? [],
  };
}

function normalizeMemberWork(work: ApiMemberWork, memberId: string): Work {
  const creatorIds = work.creatorIds ?? [memberId];

  if (work.workKind === "EVENT" || work.eventWorkId) {
    return normalizeEventWork({
      ...work,
      id: work.eventWorkId ?? work.id ?? "",
      title: work.title ?? "",
      type: work.type ?? "Other",
      creatorIds,
    });
  }

  return normalizePersonalWork({
    ...work,
    id: work.personalWorkId ?? work.id ?? "",
    title: work.title ?? "",
    type: work.type ?? "Other",
    creatorIds,
  });
}

export async function fetchMembers(): Promise<Member[]> {
  const response = await request<ApiList<Member>>("/members");
  return response.items.map(normalizeMember);
}

export async function fetchMember(id: string): Promise<Member> {
  return normalizeMember(
    await request<Member>(`/members/${encodeURIComponent(id)}`),
  );
}

export async function fetchMemberWorks(id: string): Promise<Work[]> {
  const response = await request<ApiList<ApiMemberWork>>(
    `/members/${encodeURIComponent(id)}/works`,
  );
  return response.items.map((work) => normalizeMemberWork(work, id));
}

export async function fetchEventWorks(): Promise<EventWork[]> {
  const response = await request<ApiList<ApiWork>>("/event-works");
  return response.items.map(normalizeEventWork);
}

export async function fetchEventWork(id: string): Promise<EventWork> {
  return normalizeEventWork(
    await request<ApiWork>(`/event-works/${encodeURIComponent(id)}`),
  );
}

export async function fetchPersonalWorks(): Promise<PersonalWork[]> {
  const response = await request<ApiList<ApiWork>>("/personal-works");
  return response.items.map(normalizePersonalWork);
}

export async function fetchPersonalWork(id: string): Promise<PersonalWork> {
  return normalizePersonalWork(
    await request<ApiWork>(`/personal-works/${encodeURIComponent(id)}`),
  );
}

export const fetchWorkDetail = (
  kind: "event" | "personal",
  id: string,
): Promise<Work> =>
  kind === "event" ? fetchEventWork(id) : fetchPersonalWork(id);
