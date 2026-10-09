import {
  emptyAnnotation,
  type Provider,
  type Session,
  type UsageRequest,
} from "./schema";

// Only metadata leaves this boundary. No message bodies, credentials or tool arguments.
type Obj = Record<string, any>;
const number = (v: unknown): number | null =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : null;
const value = (v: unknown) => number(v) ?? 0;
const date = (v: unknown) => {
  const d = new Date(typeof v === "number" || typeof v === "string" ? v : NaN);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
};
const basename = (v: unknown) =>
  typeof v === "string"
    ? (v.replace(/\\/g, "/").split("/").filter(Boolean).at(-1)?.slice(0, 160) ??
      "未命名项目")
    : "未命名项目";
function request(
  id: string,
  stamp: string,
  model: string,
  usage: Obj,
): UsageRequest | null {
  if (
    number(usage.input_tokens) === null ||
    number(usage.output_tokens) === null
  )
    return null;
  return {
    id,
    time: stamp,
    model,
    input: value(usage.input_tokens),
    output: value(usage.output_tokens),
    cacheRead: number(usage.cached_input_tokens),
    cacheWrite: number(usage.cache_write_input_tokens),
    reasoning: number(usage.reasoning_output_tokens),
    contextLimit: null,
    latencyMs: null,
    kind: "request",
    error: false,
  };
}
function makeSession(
  id: string,
  provider: Provider,
  project: string,
  requests: UsageRequest[],
  startedAt: string,
  messages: number | null,
  tools: number | null,
  parentId: string | null,
  notices: string[],
): Session {
  requests.sort((a, b) => a.time.localeCompare(b.time));
  return {
    id: `${provider}:${id}`,
    provider,
    title: `${project} · ${new Date(startedAt).toLocaleDateString("zh-CN")}`,
    project,
    requests,
    startedAt,
    updatedAt: requests.at(-1)?.time ?? startedAt,
    messages,
    tools,
    parentId: parentId ? `${provider}:${parentId}` : null,
    notices,
    annotation: { ...emptyAnnotation, tags: [] },
  };
}

export class CodexParser {
  id = "";
  project = "未命名项目";
  parent: string | null = null;
  started = "";
  model = "unknown";
  requests = new Map<string, UsageRequest>();
  fallback: UsageRequest[] = [];
  baseline: Obj | null = null;
  active = true;
  messages = 0;
  tools = 0;
  malformed = 0;
  contextLimit: number | null = null;
  lastRecord: UsageRequest | null = null;
  compactions = new Set<string>();
  feed(record: Obj) {
    const q: Obj = record.payload ?? {};
    const stamp = date(record.timestamp) ?? this.started;
    if (record.type === "session_meta") {
      this.id = String(q.id ?? q.session_id ?? "");
      this.started =
        date(q.timestamp ?? record.timestamp) ?? new Date(0).toISOString();
      this.project = basename(q.cwd);
      this.parent =
        q.parent_thread_id ??
        q.source?.subagent?.thread_spawn?.parent_thread_id ??
        null;
      this.active = !this.parent;
    }
    if (record.type === "turn_context") {
      this.model = typeof q.model === "string" ? q.model : "unknown";
      // Ambiguous child snapshots are not used; owned explicit records are handled below.
      this.active = !this.parent;
    }
    if (record.type === "response_item" && this.active) {
      if (q.type === "message" && q.role === "user") this.messages++;
      if (["function_call", "custom_tool_call"].includes(q.type)) this.tools++;
    }
    const add = (rec: Obj, kind: "request" | "compaction") => {
      if (rec.thread_id && rec.thread_id !== this.id) return;
      if (!rec.response_id || !rec.usage || !stamp) return;
      const id = String(rec.response_id);
      const r = request(id, stamp, this.model, rec.usage);
      if (!r) return;
      r.kind = kind;
      r.contextLimit = this.contextLimit;
      if (!this.requests.has(id)) this.requests.set(id, r);
      this.lastRecord = this.requests.get(id)!;
    };
    if (record.type === "token_usage_record")
      add(q, this.compactions.has(q.response_id) ? "compaction" : "request");
    if (record.type === "compacted") {
      const id = q.compaction_response_id ?? q.response_id;
      if (typeof id === "string") {
        this.compactions.add(id);
        const previous = this.requests.get(id);
        if (previous) previous.kind = "compaction";
      }
      if (q.latest_token_usage_record?.response_id === id)
        add(q.latest_token_usage_record, "compaction");
    }
    if (
      record.type === "event_msg" &&
      q.type === "token_count" &&
      q.info?.total_token_usage
    ) {
      const info = q.info;
      const cumulative: Obj = info.total_token_usage;
      this.contextLimit = number(info.model_context_window);
      if (this.lastRecord && this.contextLimit)
        this.lastRecord.contextLimit = this.contextLimit;
      if (this.parent && !this.active) {
        this.baseline = cumulative;
        return;
      }
      const previous = this.baseline;
      this.baseline = cumulative;
      const delta: Obj = {};
      for (const key of [
        "input_tokens",
        "output_tokens",
        "cached_input_tokens",
        "cache_write_input_tokens",
        "reasoning_output_tokens",
      ]) {
        if (number(cumulative[key]) !== null)
          delta[key] = Math.max(
            0,
            value(cumulative[key]) - value(previous?.[key]),
          );
      }
      // Decreasing counters indicate a reset, rather than negative usage.
      if (
        previous &&
        value(cumulative.input_tokens) < value(previous.input_tokens)
      )
        return;
      if (
        value(delta.input_tokens) + value(delta.output_tokens) === 0 ||
        !stamp
      )
        return;
      const r = request(
        `snapshot-${this.fallback.length}`,
        stamp,
        this.model,
        delta,
      );
      if (r) {
        r.contextLimit = this.contextLimit;
        this.fallback.push(r);
      }
    }
  }
  finish(): Session | null {
    if (!this.id || !this.started) return null;
    const explicit = [...this.requests.values()];
    const requests = explicit.length
      ? explicit
      : this.parent
        ? []
        : this.fallback;
    const notices = ["只读取元数据；请求延迟未记录。"];
    if (!explicit.length)
      notices.push("旧版累计快照差分；请求数是用量增量记录数。");
    if (this.parent)
      notices.push(
        "子 Agent：仅纳入明确归属本 thread 的请求；旧版无归属快照不计入。",
      );
    if (this.malformed)
      notices.push(`${this.malformed} 条损坏或未写完的 JSON 行已跳过。`);
    return makeSession(
      this.id,
      "codex",
      this.project,
      requests,
      this.started,
      this.parent ? null : this.messages,
      this.parent ? null : this.tools,
      this.parent,
      notices,
    );
  }
}

export class ClaudeParser {
  id = "";
  project = "Claude 项目";
  started = "";
  messages = 0;
  tools = 0;
  requests = new Map<string, UsageRequest>();
  toolIds = new Set<string>();
  feed(r: Obj) {
    if (typeof r.sessionId === "string") this.id = r.sessionId;
    if (r.cwd) this.project = basename(r.cwd);
    const stamp = date(r.timestamp);
    if (!this.started && stamp) this.started = stamp;
    const message = r.message ?? {};
    if (
      r.type === "user" &&
      !r.isMeta &&
      !r.isToolResult &&
      !(
        Array.isArray(message.content) &&
        message.content.some((x: Obj) => x.type === "tool_result")
      )
    )
      this.messages++;
    if (r.type !== "assistant" || !message.usage || !stamp) return;
    const u: Obj = message.usage;
    const id = String(message.id ?? r.requestId ?? r.uuid ?? "");
    if (!id) return;
    const read = number(u.cache_read_input_tokens);
    const write = number(u.cache_creation_input_tokens);
    const normalized = {
      input_tokens: value(u.input_tokens) + (read ?? 0) + (write ?? 0),
      output_tokens: u.output_tokens,
      cached_input_tokens: read,
      cache_write_input_tokens: write,
    };
    const item = request(
      id,
      stamp,
      String(message.model ?? "unknown"),
      normalized,
    );
    const previous = this.requests.get(id);
    if (item && (!previous || item.output >= previous.output))
      this.requests.set(id, item);
    if (Array.isArray(message.content))
      for (const c of message.content)
        if (c.type === "tool_use" && c.id && !this.toolIds.has(c.id)) {
          this.toolIds.add(c.id);
          this.tools++;
        }
  }
  finish(): Session | null {
    if (!this.id || !this.started) return null;
    return makeSession(
      this.id,
      "claude",
      this.project,
      [...this.requests.values()],
      this.started,
      this.messages,
      this.tools,
      null,
      ["输入包括缓存读取和写入；日志未提供模型上下文上限及请求延迟。"],
    );
  }
}

export function parseWorkBuddy(trace: Obj): Session | null {
  const m: Obj = trace.modelInfo ?? {};
  const stamp = date(trace.startedAt);
  if (
    !trace.sessionId ||
    !stamp ||
    number(m.totalInputTokens) === null ||
    number(m.totalOutputTokens) === null
  )
    return null;
  const read = number(m.totalCachedTokens);
  const rawInput = value(m.totalInputTokens);
  const rawOutput = value(m.totalOutputTokens);
  const total = number(trace.totalTokens);
  // Some versions report cache-exclusive input. Infer only when totals reconcile exactly.
  const exclusive =
    read !== null && total === rawInput + rawOutput + read && read > 0;
  const normalizedInput = exclusive ? rawInput + read : rawInput;
  const cache = read !== null && read <= normalizedInput ? read : null;
  const r = request(
    String(trace.traceId ?? trace.id ?? `trace-${stamp}`),
    stamp,
    Array.isArray(m.models) ? m.models.map(String).join(" + ") : "unknown",
    {
      input_tokens: normalizedInput,
      output_tokens: m.totalOutputTokens,
      cached_input_tokens: cache,
    },
  );
  if (!r) return null;
  r.error =
    trace.status === "error" ||
    Boolean(trace.error) ||
    (Array.isArray(trace.spans) &&
      trace.spans.some(
        (span: Obj) => span.status === "error" || Boolean(span.error),
      ));
  r.latencyMs = number(trace.durationMs);
  return makeSession(
    String(trace.sessionId),
    "workbuddy",
    "WorkBuddy",
    [r],
    stamp,
    null,
    null,
    null,
    [
      "按 trace 聚合；未读取会话数据库，标题、用户消息、工具次数及上下文上限不可获取。",
      "缓存字段采用 modelInfo.totalCachedTokens；积分不是 token。",
      ...(exclusive ? ["输入根据 totalTokens 对账，已合并缓存读取。"] : []),
      ...(read !== null && cache === null
        ? ["缓存大于输入且总量无法对账，缓存命中率按未知处理。"]
        : []),
    ],
  );
}

export function importLogs(text: string, provider: Provider): Session[] {
  const records: Obj[] = [];
  if (provider === "workbuddy") {
    const parsed = JSON.parse(text);
    records.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  } else
    for (const line of text.split(/\r?\n/))
      if (line.trim()) records.push(JSON.parse(line));
  if (provider === "workbuddy")
    return mergeSessions(
      records.map(parseWorkBuddy).filter((s): s is Session => Boolean(s)),
    );
  const parser = provider === "codex" ? new CodexParser() : new ClaudeParser();
  for (const r of records) parser.feed(r);
  const result = parser.finish();
  return result && result.requests.length ? [result] : [];
}
export function mergeSessions(sessions: Session[]): Session[] {
  const map = new Map<string, Session>();
  for (const s of sessions) {
    const previous = map.get(s.id);
    if (!previous) {
      map.set(s.id, s);
      continue;
    }
    const requests = new Map(previous.requests.map((r) => [r.id, r]));
    for (const r of s.requests) requests.set(r.id, r);
    previous.requests = [...requests.values()].sort((a, b) =>
      a.time.localeCompare(b.time),
    );
    previous.startedAt =
      previous.startedAt < s.startedAt ? previous.startedAt : s.startedAt;
    previous.updatedAt =
      previous.updatedAt > s.updatedAt ? previous.updatedAt : s.updatedAt;
    previous.messages =
      previous.messages === null && s.messages === null
        ? null
        : Math.max(previous.messages ?? 0, s.messages ?? 0);
    previous.tools =
      previous.tools === null && s.tools === null
        ? null
        : Math.max(previous.tools ?? 0, s.tools ?? 0);
  }
  return [...map.values()].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
}
