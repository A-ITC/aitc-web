require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { groupEventSections, memberEventSections } = require("../components/event-sections.ts");
const { normalizeEventWork, fetchEventWork } = require("../lib/api.ts");
const { normalizeMemberWorkReferences, fetchMembersOnlyEventWork } = require("../lib/members-only-api.ts");
const { WorkModal } = require("../components/work-ui.tsx");
const { MembersOnlyWorksBrowser, MemberEventSections } = require("../components/members-only/members-only-works-browser.tsx");
const { PromiseQueue } = require("../lib/promise-queue.ts");

function credit(sectionId, sectionName, sectionOrder, trackNumber, workTitle, creatorId = "alice") {
  return { id: `${sectionId}:track-${trackNumber}`, sectionId, sectionName, sectionOrder, trackNumber, workTitle,
    type: sectionId === "metadata" ? "WorkInfo" : sectionId === "art" ? "Illustration" : "Music",
    creatorIds: [{ memberName: null, creatorId }] };
}
const credits = [
  credit("music", "音楽", 2, 2, "Song B"),
  credit("art", "イラスト", 3, 1, "Other member's art", "bob"),
  credit("metadata", "メタデータ", 1, 2, "Direction"),
  credit("music", "音楽", 2, 1, "Song A"),
  credit("metadata", "メタデータ", 1, 1, "表紙"),
];
const apiWork = { id: "event-1", title: "AITC Works Vol. 1", type: "MusicAndIllustration", releasedAt: "2026年度", eventName: "M3", credits };
const detail = normalizeEventWork(apiWork, true);
const references = credits.filter((row) => row.creatorIds[0].creatorId === "alice").map((row) => ({
  workKind: "EVENT", eventWorkId: "event-1", creditId: row.id, title: row.workTitle,
  type: row.type, sectionId: row.sectionId, sectionName: row.sectionName, sectionOrder: row.sectionOrder, trackNumber: row.trackNumber,
  eventWorkTitle: apiWork.title, eventName: "M3", releasedAt: "2026年度",
}));
const directory = ["alice", "bob"].map((id) => ({ id, name: id, department: [], generation: 1, roles: [], links: [] }));

test("sections and items follow API order; numbers can repeat across sections", () => {
  const sections = groupEventSections(credits);
  assert.deepEqual(sections.map((section) => section.name), ["メタデータ", "音楽", "イラスト"]);
  assert.deepEqual(sections[0].items.map((item) => item.workTitle), ["表紙", "Direction"]);
  assert.deepEqual(detail.credits.map((item) => item.workTitle), ["表紙", "Direction", "Song A", "Song B", "Other member's art"]);
  assert.equal(normalizeEventWork({ ...apiWork, credits: undefined }).credits, undefined);
});

test("profile builds three levels and multiple own credits before loading detail", () => {
  const html = renderToStaticMarkup(React.createElement(MembersOnlyWorksBrowser, {
    references, memberId: "alice", directory, accessToken: "test", invalidateAuthentication() {},
  }));
  assert.match(html, /<h4[\s>]/);
  assert.match(html, /<h5[^>]*>メタデータ<\/h5>/);
  assert.match(html, /<h6[^>]*>表紙<\/h6>/);
  assert.match(html, /<h6[^>]*>Direction<\/h6>/);
  assert.match(html, /Song A/);
  assert.match(html, /Song B/);
  assert.doesNotMatch(html, /Other member/);
});

test("profile preserves grouping before and after detail and does not duplicate references", () => {
  assert.deepEqual(memberEventSections(references, "alice"), memberEventSections([...references, references[0]], "alice", detail));
  const refreshed = { ...detail, credits: detail.credits.map((row) => ({ ...row,
    sectionName: row.sectionId === "music" ? "楽曲" : row.sectionName,
    sectionOrder: row.sectionId === "music" ? 1 : row.sectionId === "metadata" ? 2 : row.sectionOrder,
    workTitle: `${row.workTitle} updated`,
  })) };
  const sections = memberEventSections(references, "alice", refreshed);
  assert.deepEqual(sections.map((section) => section.name), ["楽曲", "メタデータ"]);
  const html = renderToStaticMarkup(React.createElement(MemberEventSections, { sections }));
  assert.match(html, /Song A updated/);
  assert.doesNotMatch(html, /Other member/);
  assert.deepEqual(memberEventSections(references, "bob", detail), []);
});

test("modal renders one labelled scrollable table per section on both entry points", () => {
  for (const memberHref of [undefined, (id) => `/members-only/members/profile?id=${id}`]) {
    const html = renderToStaticMarkup(React.createElement(WorkModal, {
      work: detail, kind: "event", works: [], members: directory, memberHref, onClose() {},
    }));
    assert.equal((html.match(/<table /g) ?? []).length, 3);
    assert.equal((html.match(/<table aria-labelledby=/g) ?? []).length, 3);
    assert.equal((html.match(/overflow-x-auto/g) ?? []).length, 3);
    for (const title of ["メタデータ", "音楽", "イラスト", "表紙", "Direction"]) assert.ok(html.includes(title));
    assert.doesNotMatch(html, /収録作品|制作協力|トラック/);
    if (memberHref) assert.ok(html.includes("/members-only/members/profile?id=alice"));
  }
});

test("old or inconsistent section data fails normalization", () => {
  assert.throws(() => normalizeEventWork({ ...apiWork, credits: [{ id: "meta1", workTitle: "表紙", creatorIds: [], trackNumber: 0 }] }, true));
  assert.throws(() => normalizeEventWork({ ...apiWork, credits: undefined }, true), /missing credits/);
  for (const changes of [{ sectionId: " " }, { sectionName: "" }, { sectionOrder: 0 }, { trackNumber: 0 }, { trackNumber: "1" }]) {
    assert.throws(() => groupEventSections([{ ...credits[0], ...changes }]));
  }
  assert.throws(() => groupEventSections([credits[0], { ...credits[3], sectionName: "Different" }]));
  assert.throws(() => groupEventSections([credits[0], credits[0]]));
  assert.throws(() => normalizeMemberWorkReferences([{ workKind: "EVENT", eventWorkId: "event-1", creditId: "track-1" }]));
  assert.deepEqual(normalizeMemberWorkReferences(references), references);
});

test("3DCG and Game keep their types and labels in event details and member references", () => {
  for (const [type, label] of [["3DCG", "3DCG"], ["Game", "ゲーム"]]) {
    const item = { ...credits[0], type };
    const work = normalizeEventWork({ ...apiWork, type, credits: [item] }, true);
    assert.equal(work.type, type);
    assert.equal(work.credits[0].type, type);
    const ownReferences = normalizeMemberWorkReferences([{ ...references[0], type }]);
    assert.equal(ownReferences[0].type, type);
    const html = renderToStaticMarkup(React.createElement(WorkModal, {
      work, kind: "event", works: [], members: directory, onClose() {},
    }));
    assert.ok(html.includes(label));
  }
});

test("individual works stay separate from event sections", () => {
  const personal = { workKind: "PERSONAL", personalWorkId: "art-1", title: "My personal illustration", type: "Illustration", createdAt: "2026-01-01" };
  const html = renderToStaticMarkup(React.createElement(MembersOnlyWorksBrowser, {
    references: [...references, personal], memberId: "alice", directory, accessToken: "test", invalidateAuthentication() {},
  }));
  assert.match(html, /個人作品/);
  assert.match(html, /My personal illustration/);
  assert.deepEqual(memberEventSections([personal], "alice"), []);
});

test("public and protected detail fetch use the same section normalization", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => apiWork }; });
  const controller = new AbortController();
  assert.deepEqual(await fetchEventWork("event-1", controller.signal), await fetchMembersOnlyEventWork("event-1", "test", controller.signal));
  assert.ok(calls[1].url.includes("/members-only/event-works/"));
  assert.equal(calls[1].options.headers.Authorization, "Bearer test");
});

test("detail queue shares pending requests, caches successes, and retries a failed work independently", async () => {
  const queue = new PromiseQueue(2);
  let succeed;
  let count = 0;
  const execute = () => { count++; return new Promise((resolve) => { succeed = resolve; }); };
  const first = queue.request("event-1", execute);
  assert.equal(first, queue.request("event-1", execute, true));
  await Promise.resolve();
  succeed(detail);
  assert.equal(await first, detail);
  assert.equal(await queue.request("event-1", execute), detail);
  assert.equal(count, 1);
  await assert.rejects(queue.request("broken", async () => { throw new Error("offline"); }), /offline/);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(await queue.request("broken", async () => detail), detail);
  assert.equal(await queue.request("event-1", execute), detail);
  queue.dispose();
});
