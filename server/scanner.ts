import { readdir, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { join } from "node:path";
import {
  CodexParser,
  ClaudeParser,
  mergeSessions,
  parseWorkBuddy,
} from "../shared/parsers";
import type { Provider, Session, Snapshot } from "../shared/schema";

const paths: Record<Provider, string[]> = {
  codex: [
    join(
      process.env.CODEX_HOME ?? join(homedir(), ".codex"),
      "archived_sessions",
    ),
    join(process.env.CODEX_HOME ?? join(homedir(), ".codex"), "sessions"),
  ],
  claude: [
    join(
      process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), ".claude"),
      "projects",
    ),
  ],
  workbuddy: [
    join(process.env.WORKBUDDY_HOME ?? join(homedir(), ".workbuddy"), "traces"),
  ],
};
async function files(
  root: string,
  suffix: string,
  depth = 0,
): Promise<string[]> {
  if (depth > 12) return [];
  const entries = await readdir(root, { withFileTypes: true });
  const result: string[] = [];
  for (const e of entries) {
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory())
      result.push(...(await files(join(root, e.name), suffix, depth + 1)));
    else if (e.isFile() && e.name.endsWith(suffix))
      result.push(join(root, e.name));
  }
  return result;
}
const cache = new Map<
  string,
  { size: number; mtime: number; result: Session | null }
>();
async function scanFile(
  path: string,
  provider: Provider,
): Promise<Session | null> {
  const st = await stat(path);
  if (st.size > 128 * 1024 * 1024)
    throw new Error("日志超过单文件 128 MB 上限");
  const cached = cache.get(path);
  if (cached?.size === st.size && cached.mtime === st.mtimeMs)
    return cached.result ? structuredClone(cached.result) : null;
  const parser = provider === "codex" ? new CodexParser() : new ClaudeParser();
  const stream = createReadStream(path, { encoding: "utf8" });
  let result: Session | null;
  if (provider === "workbuddy") {
    let text = "";
    for await (const chunk of stream) text += chunk;
    result = parseWorkBuddy(JSON.parse(text));
  } else {
    const lines = createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of lines) {
      if (!line.trim()) continue;
      try {
        parser.feed(JSON.parse(line));
      } catch {
        if (parser instanceof CodexParser) parser.malformed++;
      }
    }
    result = parser.finish();
  }
  cache.set(path, {
    size: st.size,
    mtime: st.mtimeMs,
    result: result ? structuredClone(result) : null,
  });
  return result;
}
export async function scan(): Promise<Snapshot> {
  const all: Session[] = [];
  const sources: Snapshot["sources"] = [];
  for (const provider of ["codex", "claude", "workbuddy"] as Provider[]) {
    let found: string[] = [];
    let available = false;
    let skipped = 0;
    let issue = "";
    for (const root of paths[provider]) {
      try {
        found.push(
          ...(await files(root, provider === "workbuddy" ? ".json" : ".jsonl")),
        );
        available = true;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT")
          issue = "目录不可读取，请检查权限";
      }
    }
    for (const path of found) {
      try {
        const session = await scanFile(path, provider);
        if (session?.requests.length) all.push(session);
        else skipped++;
      } catch {
        skipped++;
      }
    }
    sources.push({
      provider,
      status: issue ? "error" : available ? "ready" : "missing",
      files: found.length,
      skipped,
      message:
        issue ||
        (available
          ? `已扫描 ${found.length} 个日志文件，仅提取用量元数据`
          : "默认目录不存在；可设置环境变量或导入日志"),
    });
  }
  return {
    version: 1,
    mode: "local",
    generatedAt: new Date().toISOString(),
    sessions: mergeSessions(all),
    sources,
  };
}
