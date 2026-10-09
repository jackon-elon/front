import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import {
  appendFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { snapshotSchema } from "../shared/schema";
let fixture = "";
let child: ChildProcess;
const origin = "http://127.0.0.1:5184";
beforeAll(async () => {
  fixture = await mkdtemp(join(tmpdir(), "agentlens-api-test-"));
  await mkdir(join(fixture, "codex", "sessions"), { recursive: true });
  const timestamp = new Date().toISOString();
  const records = [
    {
      type: "session_meta",
      payload: { id: "fixture", cwd: "/private/fixture-project", timestamp },
    },
    {
      type: "response_item",
      payload: {
        type: "message",
        role: "user",
        content: "PRIVATE_CONVERSATION_BODY",
      },
    },
    {
      type: "token_usage_record",
      timestamp,
      payload: {
        thread_id: "fixture",
        response_id: "r1",
        usage: {
          input_tokens: 100,
          output_tokens: 20,
          cached_input_tokens: 80,
        },
      },
    },
  ];
  await writeFile(
    join(fixture, "codex", "sessions", "test.jsonl"),
    records.map((r) => JSON.stringify(r)).join("\n") + "\n{unfinished",
  );
  child = spawn(
    process.execPath,
    ["--import", "tsx", resolve("server/index.ts")],
    {
      env: {
        ...process.env,
        AGENTLENS_PORT: "5184",
        AGENTLENS_SCAN_MS: "500",
        AGENTLENS_STORE: join(fixture, "annotations.json"),
        CODEX_HOME: join(fixture, "codex"),
        CLAUDE_CONFIG_DIR: join(fixture, "missing-claude"),
        WORKBUDDY_HOME: join(fixture, "missing-workbuddy"),
      },
      stdio: "ignore",
    },
  );
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(origin + "/api/health")).ok) return;
    } catch {
      /* start-up */
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error("Fixture API did not start");
}, 15000);
afterAll(async () => {
  if (child && child.exitCode === null) {
    const stopped = new Promise((r) => child.once("exit", r));
    child.kill();
    await stopped;
  }
  if (fixture.startsWith(join(tmpdir(), "agentlens-api-test-")))
    await rm(fixture, { recursive: true, force: true });
});
describe("local API boundary", () => {
  it("streams a valid metadata-only snapshot and tolerates an unfinished last line", async () => {
    const response = await fetch(origin + "/api/snapshot");
    const text = await response.text();
    const result = snapshotSchema.parse(JSON.parse(text));
    expect(result.sessions).toHaveLength(1);
    expect(text).not.toContain("PRIVATE_CONVERSATION_BODY");
    expect(text).not.toContain("/private/");
    expect(result.sources.find((s) => s.provider === "claude")!.status).toBe(
      "missing",
    );
  });
  it("rejects cross-origin reads", async () => {
    const result = await fetch(origin + "/api/snapshot", {
      headers: { Origin: "https://untrusted.example" },
    });
    expect(result.status).toBe(403);
  });
  it("persists validated annotation atomically and exposes the acknowledged change", async () => {
    const annotation = {
      pinned: true,
      tags: ["reviewed"],
      note: "fixture only",
    };
    const result = await fetch(origin + "/api/annotations/codex%3Afixture", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(annotation),
    });
    expect(result.status).toBe(200);
    expect(
      JSON.parse(await readFile(join(fixture, "annotations.json"), "utf8"))[
        "codex:fixture"
      ],
    ).toEqual(annotation);
    const snapshot = snapshotSchema.parse(
      await (await fetch(origin + "/api/snapshot")).json(),
    );
    expect(snapshot.sessions[0].annotation).toEqual(annotation);
  });
  it("rejects invalid metadata and unknown session writes", async () => {
    const invalid = await fetch(origin + "/api/annotations/codex%3Afixture", {
      method: "PUT",
      body: JSON.stringify({ pinned: true, tags: ["x".repeat(50)], note: "" }),
    });
    expect(invalid.status).toBe(400);
    const absent = await fetch(origin + "/api/annotations/missing", {
      method: "PUT",
      body: "{}",
    });
    expect(absent.status).toBe(404);
  });
  it("establishes an SSE stream with a revision event", async () => {
    const controller = new AbortController();
    const response = await fetch(origin + "/api/events", {
      signal: controller.signal,
    });
    const reader = response.body!.getReader();
    const first = await reader.read();
    expect(new TextDecoder().decode(first.value)).toContain("event: connected");
    controller.abort();
  });
  it("detects an appended usage record and pushes an update without a refresh request", async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(origin + "/api/events", {
        signal: controller.signal,
      });
      const reader = response.body!.getReader();
      await reader.read();
      await appendFile(
        join(fixture, "codex", "sessions", "test.jsonl"),
        "\n" +
          JSON.stringify({
            type: "token_usage_record",
            timestamp: new Date().toISOString(),
            payload: {
              thread_id: "fixture",
              response_id: "r2",
              usage: {
                input_tokens: 250,
                output_tokens: 30,
                cached_input_tokens: 200,
              },
            },
          }) +
          "\n",
      );
      let events = "";
      while (!events.includes("event: updated")) {
        const chunk = await reader.read();
        if (chunk.done) throw new Error("Stream ended before update");
        events += new TextDecoder().decode(chunk.value);
      }
      const snapshot = await (await fetch(origin + "/api/snapshot")).json();
      expect(snapshot.sessions[0].requests).toHaveLength(2);
      expect(snapshot.sessions[0].requests.at(-1).input).toBe(250);
    } finally {
      clearTimeout(timeout);
      controller.abort();
    }
  });
});
