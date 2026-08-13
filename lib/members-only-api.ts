import { apiBaseUrl } from "./api-config";
import type { Link, WorkType } from "@/components/data";

export type MemberRole =
  | "REPRESENTATIVE"
  | "CG_LEAD"
  | "DTM_LEAD"
  | "PROG_LEAD"
  | "MV_LEAD";

export type MembersOnlyMember = {
  id: string;
  name: string;
  department: string[];
  generation: number;
  roles: MemberRole[];
  profile?: string;
  links: Array<{
    name: string;
    url: string;
    embedUrl?: string;
  }>;
};

export type MemberWorkReference = {
  workKind: "EVENT" | "PERSONAL";
  title: string;
  type?: WorkType;
  eventWorkId?: string;
  eventName?: string;
  eventWorkTitle?: string;
  personalWorkId?: string;
  creatorIds?: string[];
  description?: string;
  links?: Link[];
  releasedAt?: string;
  createdAt?: string;
  isMeta?: boolean;
};

type ItemList<T> = { items: T[] };

export class MembersOnlyApiError extends Error {
  constructor(public readonly status: number) {
    super(`Members-only API request failed: ${status}`);
  }
}

async function protectedRequest<T>(
  path: string,
  accessToken: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  if (!response.ok) throw new MembersOnlyApiError(response.status);
  return response.json() as Promise<T>;
}

function normalizeMember(member: MembersOnlyMember): MembersOnlyMember {
  return {
    ...member,
    department: member.department ?? [],
    roles: member.roles ?? [],
    links: member.links ?? [],
    profile: member.profile ?? undefined,
  };
}

export async function fetchMembersOnlyMembers(
  accessToken: string,
  signal: AbortSignal,
): Promise<MembersOnlyMember[]> {
  const response = await protectedRequest<ItemList<MembersOnlyMember>>(
    "/members-only/members",
    accessToken,
    signal,
  );
  return response.items.map(normalizeMember);
}

export async function fetchMembersOnlyMember(
  id: string,
  accessToken: string,
  signal: AbortSignal,
): Promise<MembersOnlyMember> {
  return normalizeMember(
    await protectedRequest<MembersOnlyMember>(
      `/members-only/members/${encodeURIComponent(id)}`,
      accessToken,
      signal,
    ),
  );
}

export async function fetchMembersOnlyMemberWorks(
  id: string,
  accessToken: string,
  signal: AbortSignal,
): Promise<MemberWorkReference[]> {
  const response = await protectedRequest<ItemList<MemberWorkReference>>(
    `/members-only/members/${encodeURIComponent(id)}/works`,
    accessToken,
    signal,
  );
  return response.items;
}
