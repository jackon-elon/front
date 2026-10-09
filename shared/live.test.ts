import { describe, it, expect } from "vitest";
import { createDemo } from "./demo";
import { requestTimeline, usageChanges } from "./live";
describe("live view contracts", () => {
  it("reports only a streaming increment and does not count an unchanged response twice", () => {
    const before = createDemo();
    const next = structuredClone(before);
    next.sessions[0].requests[0].output += 37;
    const changes = usageChanges(before, next);
    expect(changes).toHaveLength(1);
    expect(changes[0].input).toBe(0);
    expect(changes[0].output).toBe(37);
    expect(usageChanges(next, next)).toHaveLength(0);
  });
  it("distinguishes identical response ids in different sessions and ignores removed records", () => {
    const before = createDemo();
    const next = structuredClone(before);
    const newSession = structuredClone(next.sessions[0]);
    newSession.id = "another-session";
    next.sessions = [newSession];
    expect(usageChanges(before, next)).toHaveLength(newSession.requests.length);
    expect(usageChanges(before, { ...before, sessions: [] })).toHaveLength(0);
  });
  it("places boundary records correctly and excludes future and out-of-window records", () => {
    const end = Date.now();
    const s = createDemo().sessions[0];
    s.requests = [-60 * 60_000, -1, 0, 1, -61 * 60_000].map((offset, i) => ({
      ...s.requests[0],
      id: `test-${i}`,
      time: new Date(end + offset).toISOString(),
      input: 100,
      output: 10,
    }));
    const bins = requestTimeline([s], end, 60);
    expect(bins.reduce((n, b) => n + b.count, 0)).toBe(3);
    expect(bins[0].count).toBe(1);
    expect(bins[47].count).toBe(2);
    expect(bins[47].sessionIds).toEqual([s.id]);
  });
});
