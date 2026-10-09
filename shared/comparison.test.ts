import { describe, expect, it } from "vitest";
import { createDemo } from "./demo";
import {
  contextRows,
  metricDifference,
  recentProjectPair,
  usageProfile,
} from "./comparison";

describe("change analysis", () => {
  const source = createDemo(new Date("2026-10-09T12:00:00Z")).sessions[0];
  it("uses weighted known-input cache rate and reports coverage", () => {
    const session = {
      ...source,
      requests: [
        { ...source.requests[0], input: 100, output: 10, cacheRead: 50 },
        { ...source.requests[0], input: 900, output: 20, cacheRead: 810 },
        { ...source.requests[0], input: 500, output: 30, cacheRead: null },
      ],
    };
    const profile = usageProfile(session);
    expect(profile.cacheRate).toBe(0.86);
    expect(profile.cacheKnown).toBe(2);
    expect(profile.requests).toBe(3);
    expect(profile.total).toBe(1560);
  });
  it("keeps absent requests and unknown cache distinct from zero", () => {
    expect(usageProfile({ ...source, requests: [] }).avgInput).toBeNull();
    expect(
      usageProfile({
        ...source,
        requests: source.requests.map((r) => ({ ...r, cacheRead: null })),
      }).cacheRate,
    ).toBeNull();
  });
  it("does not fabricate relative changes with zero or unknown baselines", () => {
    expect(metricDifference(5, 0)).toEqual({ absolute: 5, relative: null });
    expect(metricDifference(null, 5)).toBeNull();
    expect(metricDifference(15, 10)?.relative).toBe(0.5);
  });
  it("pairs the two latest runs of the same project without mutating input", () => {
    const sessions = [
      { ...source, id: "old", project: "a", updatedAt: "2026-10-01T00:00:00Z" },
      {
        ...source,
        id: "latest",
        project: "a",
        updatedAt: "2026-10-03T00:00:00Z",
      },
      {
        ...source,
        id: "other",
        project: "b",
        updatedAt: "2026-10-04T00:00:00Z",
      },
      {
        ...source,
        id: "baseline",
        project: "a",
        updatedAt: "2026-10-02T00:00:00Z",
      },
    ];
    expect(recentProjectPair(sessions, "a").map((s) => s.id)).toEqual([
      "baseline",
      "latest",
    ]);
    expect(sessions[0].id).toBe("old");
    expect(recentProjectPair(sessions, "missing")).toEqual([]);
  });
  it("aligns short and long sessions by actual progress endpoints", () => {
    const a = { ...source, id: "a", requests: source.requests.slice(0, 2) };
    const b = { ...source, id: "b", requests: source.requests.slice(0, 5) };
    const rows = contextRows([a, b], false, "progress");
    expect(rows).toHaveLength(101);
    expect(rows[0].series0).toBe(a.requests[0].input);
    expect(rows[100].series1).toBe(b.requests.at(-1)?.input);
    expect(contextRows([a, b], false, "step")[2].series0).toBeNull();
  });
  it("leaves unknown context limits empty in proportional charts", () => {
    const a = {
      ...source,
      id: "a",
      requests: [{ ...source.requests[0], contextLimit: null }],
    };
    expect(contextRows([a], true, "progress")[50].series0).toBeNull();
    expect(contextRows([], false, "progress")).toEqual([]);
  });
});
