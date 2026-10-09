import { describe, expect, it } from "vitest";
import {
  CodexParser,
  ClaudeParser,
  importLogs,
  mergeSessions,
  parseWorkBuddy,
} from "./parsers";
import { analyze } from "./analytics";
import { snapshotSchema, sessionTotals } from "./schema";
import { createDemo } from "./demo";
const stamp = "2026-10-09T08:00:00.000Z";
const meta = {
  type: "session_meta",
  payload: { id: "owned", timestamp: stamp, cwd: "/home/work/example" },
};
const usage = {
  input_tokens: 100,
  output_tokens: 20,
  cached_input_tokens: 80,
  cache_write_input_tokens: 0,
  reasoning_output_tokens: 5,
};
const explicit = (id = "response", owner = "owned") => ({
  type: "token_usage_record",
  timestamp: stamp,
  payload: { thread_id: owner, response_id: id, usage },
});
const snapshot = (input: number, output: number) => ({
  type: "event_msg",
  timestamp: stamp,
  payload: {
    type: "token_count",
    info: {
      total_token_usage: {
        input_tokens: input,
        output_tokens: output,
        cached_input_tokens: Math.floor(input * 0.8),
      },
      model_context_window: 1000,
    },
  },
});
describe("Codex accounting", () => {
  it("prefers request IDs, deduplicates repeated records, excludes foreign thread records", () => {
    const p = new CodexParser();
    [
      meta,
      explicit(),
      explicit(),
      explicit("other", "parent"),
      snapshot(100, 20),
    ].forEach((r) => p.feed(r));
    const s = p.finish()!;
    expect(s.requests).toHaveLength(1);
    expect(sessionTotals(s).total).toBe(120);
    expect(s.requests[0].contextLimit).toBe(1000);
  });
  it("deduplicates cumulative snapshots instead of repeatedly summing last usage", () => {
    const p = new CodexParser();
    [meta, snapshot(100, 20), snapshot(100, 20), snapshot(250, 50)].forEach(
      (r) => p.feed(r),
    );
    const s = p.finish()!;
    expect(s.requests).toHaveLength(2);
    expect(sessionTotals(s).total).toBe(300);
  });
  it("includes compaction exactly once even when embedded and separately recorded", () => {
    const p = new CodexParser();
    const r = explicit();
    [
      meta,
      r,
      {
        type: "compacted",
        timestamp: stamp,
        payload: {
          compaction_response_id: "response",
          latest_token_usage_record: r.payload,
        },
      },
      snapshot(100, 20),
    ].forEach((x) => p.feed(x));
    expect(p.finish()!.requests).toHaveLength(1);
    expect(p.finish()!.requests[0].kind).toBe("compaction");
  });
  it("does not count ambiguous legacy child snapshots as new spending", () => {
    const p = new CodexParser();
    p.feed({
      ...meta,
      payload: { ...meta.payload, parent_thread_id: "parent" },
    });
    p.feed(snapshot(1000, 100));
    expect(p.finish()!.requests).toHaveLength(0);
  });
  it("does not include message text or absolute directory paths in output", () => {
    const p = new CodexParser();
    [
      meta,
      {
        type: "response_item",
        payload: { type: "message", role: "user", content: "SECRET_PROMPT" },
      },
      explicit(),
    ].forEach((x) => p.feed(x));
    const output = JSON.stringify(p.finish());
    expect(output).not.toContain("SECRET_PROMPT");
    expect(output).not.toContain("/home/work");
    expect(p.finish()!.project).toBe("example");
  });
  it("rejects invalid usage fields rather than accepting negative token counts", () => {
    const p = new CodexParser();
    p.feed(meta);
    p.feed({
      ...explicit(),
      payload: { ...explicit().payload, usage: { ...usage, input_tokens: -1 } },
    });
    expect(p.finish()!.requests).toHaveLength(0);
  });
});
describe("Other source adapters", () => {
  it("reconciles cache-exclusive WorkBuddy totals without inventing a cache ratio", () => {
    const trace = {
      sessionId: "w",
      startedAt: stamp,
      totalTokens: 120,
      modelInfo: {
        totalInputTokens: 10,
        totalOutputTokens: 20,
        totalCachedTokens: 90,
      },
    };
    expect(parseWorkBuddy(trace)!.requests[0].input).toBe(100);
    expect(
      parseWorkBuddy({ ...trace, totalTokens: undefined })!.requests[0]
        .cacheRead,
    ).toBeNull();
  });
  it("updates Claude streaming fragments without counting the request twice", () => {
    const p = new ClaudeParser();
    const r = {
      type: "assistant",
      timestamp: stamp,
      sessionId: "c",
      message: { id: "m", usage: { input_tokens: 100, output_tokens: 2 } },
    };
    p.feed(r);
    p.feed({
      ...r,
      message: {
        ...r.message,
        usage: { ...r.message.usage, output_tokens: 20 },
      },
    });
    expect(p.finish()!.requests).toHaveLength(1);
    expect(p.finish()!.requests[0].output).toBe(20);
  });
  it("normalizes Claude cache-exclusive inputs and deduplicates message IDs", () => {
    const p = new ClaudeParser();
    const r = {
      type: "assistant",
      timestamp: stamp,
      sessionId: "claude-test",
      message: {
        id: "m",
        model: "claude",
        usage: {
          input_tokens: 10,
          output_tokens: 20,
          cache_read_input_tokens: 80,
          cache_creation_input_tokens: 10,
        },
      },
    };
    p.feed(r);
    p.feed(r);
    expect(p.finish()!.requests).toHaveLength(1);
    expect(sessionTotals(p.finish()!).input).toBe(100);
  });
  it("keeps absent fields unknown for WorkBuddy and joins trace records by session", () => {
    const a = parseWorkBuddy({
      sessionId: "w",
      id: "r1",
      startedAt: stamp,
      modelInfo: {
        totalInputTokens: 100,
        totalOutputTokens: 20,
        models: ["hunyuan"],
      },
    })!;
    const b = parseWorkBuddy({
      sessionId: "w",
      id: "r2",
      startedAt: stamp,
      modelInfo: { totalInputTokens: 50, totalOutputTokens: 10 },
    })!;
    expect(a.requests[0].contextLimit).toBeNull();
    expect(a.requests[0].cacheRead).toBeNull();
    expect(mergeSessions([a, b])[0].requests).toHaveLength(2);
  });
  it("rejects malformed imports with an actionable failure", () => {
    expect(() => importLogs("{invalid", "codex")).toThrow();
    expect(parseWorkBuddy({ modelInfo: {} })).toBeNull();
  });
});
describe("Analytics and public demo boundary", () => {
  it("demo generation is deterministic, schema valid, and has all three sources", () => {
    const a = createDemo(new Date(stamp));
    expect(snapshotSchema.safeParse(a).success).toBe(true);
    expect(a).toEqual(createDemo(new Date(stamp)));
    expect(new Set(a.sessions.map((s) => s.provider)).size).toBe(3);
  });
  it("filters requests by time, rather than counting a whole multi-day session", () => {
    const d = createDemo(new Date(stamp));
    const s = d.sessions[0];
    s.requests = [
      { ...s.requests[0], time: stamp, input: 100, output: 20, cacheRead: 80 },
      {
        ...s.requests[0],
        id: "old",
        time: "2025-01-01T00:00:00.000Z",
        input: 500,
        output: 20,
      },
    ];
    const result = analyze(
      [s],
      { provider: "all", days: 7, project: "" },
      Date.parse(stamp),
    );
    expect(result.total).toBe(120);
    expect(result.requests).toBe(1);
    expect(result.cacheRate).toBe(0.8);
  });
  it("cache percentage excludes unknown cache inputs from the denominator", () => {
    const s = createDemo(new Date(stamp)).sessions[0];
    s.requests = [
      { ...s.requests[0], time: stamp, input: 100, output: 10, cacheRead: 50 },
      {
        ...s.requests[0],
        id: "unknown",
        time: stamp,
        input: 100,
        output: 10,
        cacheRead: null,
      },
    ];
    expect(
      analyze([s], { provider: "all", days: 7, project: "" }, Date.parse(stamp))
        .cacheRate,
    ).toBe(0.5);
  });
  it("source and project filters combine correctly", () => {
    const d = createDemo(new Date(stamp));
    const s = d.sessions.find((s) => s.provider === "claude")!;
    const a = analyze(
      d.sessions,
      { provider: "claude", days: 28, project: s.project },
      Date.parse(stamp),
    );
    expect(a.breakdown.find((b) => b.provider === "codex")!.total).toBe(0);
    expect(
      a.activeSessions.every(
        (id) => d.sessions.find((s) => s.id === id)!.project === s.project,
      ),
    ).toBe(true);
  });
});
