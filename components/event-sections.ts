import type { EventCredit, EventWork } from "./data";
import type { MemberWorkReference } from "@/lib/members-only-api";

export type EventSectionInfo = {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  trackNumber: number;
};

export type EventSection<T> = {
  id: string;
  name: string;
  order: number;
  items: T[];
};

export function validateSectionInfo(value: EventSectionInfo): void {
  if (
    typeof value.sectionId !== "string" || !value.sectionId.trim() ||
    typeof value.sectionName !== "string" || !value.sectionName.trim() ||
    !Number.isSafeInteger(value.sectionOrder) || value.sectionOrder < 1 ||
    !Number.isSafeInteger(value.trackNumber) || value.trackNumber < 1 || value.trackNumber > 9999
  ) {
    throw new Error("Invalid event section data. Reimport event works in the section format.");
  }
}

export function groupEventSections<T extends EventSectionInfo>(items: T[]): EventSection<T>[] {
  const sections = new Map<string, EventSection<T>>();
  const orders = new Map<number, string>();
  for (const item of items) {
    validateSectionInfo(item);
    let section = sections.get(item.sectionId);
    if (!section) {
      if (orders.has(item.sectionOrder)) throw new Error("Duplicate event section order.");
      section = { id: item.sectionId, name: item.sectionName, order: item.sectionOrder, items: [] };
      sections.set(item.sectionId, section);
      orders.set(item.sectionOrder, item.sectionId);
    }
    if (section.name !== item.sectionName || section.order !== item.sectionOrder) {
      throw new Error("Inconsistent event section name or order.");
    }
    if (section.items.some((row) => row.trackNumber === item.trackNumber)) {
      throw new Error("Duplicate work order within an event section.");
    }
    section.items.push(item);
  }
  return [...sections.values()]
    .sort((a, b) => a.order - b.order)
    .map((section) => ({ ...section, items: [...section.items].sort((a, b) => a.trackNumber - b.trackNumber) }));
}

export type MemberEventCredit = EventSectionInfo & {
  creditId: string;
  title: string;
};

export function memberEventSections(
  references: MemberWorkReference[],
  memberId: string,
  detail?: EventWork,
): EventSection<MemberEventCredit>[] {
  const rows = new Map<string, MemberEventCredit>();
  for (const reference of references) {
    if (reference.workKind !== "EVENT") continue;
    const credit: EventCredit | undefined = detail?.credits?.find(
      (item) => item.id === reference.creditId && item.sectionId === reference.sectionId,
    );
    // A refreshed detail may remove a member from a credit. Never include someone else's work.
    if (detail?.credits && (!credit || !credit.creatorIds.some((creator) => creator.creatorId === memberId))) continue;
    const row = {
      creditId: reference.creditId,
      title: credit?.workTitle ?? reference.title,
      sectionId: reference.sectionId,
      sectionName: credit?.sectionName ?? reference.sectionName,
      sectionOrder: credit?.sectionOrder ?? reference.sectionOrder,
      trackNumber: credit?.trackNumber ?? reference.trackNumber,
    };
    rows.set(JSON.stringify([row.sectionId, row.creditId]), row);
  }
  return groupEventSections([...rows.values()]);
}
