require("./register.cjs");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { normalizeEventWork } = require("../lib/api.ts");
const { groupEventWorksByFiscalYear, sortEventWorks } = require("../components/members-only/event-work-order.ts");

const works = [
  normalizeEventWork({ id: "year-only", title: "Apple", type: "Music", year: 2027 }),
  normalizeEventWork({ id: "march", title: "Delta", type: "Music", releasedAt: "2026-03-31" }),
  normalizeEventWork({ id: "legacy", title: "Echo", type: "Music", releasedAt: "2026年度" }),
  normalizeEventWork({ id: "april", title: "Bravo", type: "Music", releasedAt: "2026-04-01" }),
  normalizeEventWork({ id: "summer", title: "Charlie", type: "Music", releasedAt: "2026-07-20" }),
  normalizeEventWork({ id: "invalid", title: "Foxtrot", type: "Music", releasedAt: "2026-02-30" }),
];

const workIds = (items) => items.map((work) => work.id);

test("the April boundary separates fiscal years and unknown years come last", () => {
  const groups = groupEventWorksByFiscalYear(works);
  assert.deepEqual(groups.map(({ fiscalYear, works }) => [fiscalYear, workIds(works)]), [
    [2026, ["summer", "april", "legacy"]],
    [2025, ["march"]],
    [null, ["year-only", "invalid"]],
  ]);
});

test("explicit sorts order the entire list and date sorts put unknown dates last", () => {
  assert.deepEqual(workIds(sortEventWorks(works, "new")), ["summer", "april", "march", "year-only", "legacy", "invalid"]);
  assert.deepEqual(workIds(sortEventWorks(works, "old")), ["march", "april", "summer", "year-only", "legacy", "invalid"]);
  assert.deepEqual(workIds(sortEventWorks(works, "title")), ["year-only", "april", "summer", "march", "legacy", "invalid"]);
});
