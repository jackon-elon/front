import { z } from "zod";

export const providerSchema = z.enum(["codex", "claude", "workbuddy"]);
export type Provider = z.infer<typeof providerSchema>;
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const nullableCount = count.nullable();
export const requestSchema = z.object({
  id: z.string().max(300),
  time: z.string().datetime(),
  model: z.string().max(200),
  input: count,
  output: count,
  cacheRead: nullableCount,
  cacheWrite: nullableCount,
  reasoning: nullableCount,
  contextLimit: nullableCount,
  latencyMs: nullableCount,
  kind: z.enum(["request", "compaction"]),
  error: z.boolean(),
});
export type UsageRequest = z.infer<typeof requestSchema>;
export const annotationSchema = z.object({
  pinned: z.boolean(),
  tags: z.array(z.string().trim().min(1).max(24)).max(8),
  note: z.string().max(500),
});
export type Annotation = z.infer<typeof annotationSchema>;
export const emptyAnnotation: Annotation = {
  pinned: false,
  tags: [],
  note: "",
};
export const sessionSchema = z.object({
  id: z.string().min(1).max(300),
  provider: providerSchema,
  title: z.string().min(1).max(200),
  project: z.string().max(200),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  parentId: z.string().nullable(),
  messages: nullableCount,
  tools: nullableCount,
  requests: z.array(requestSchema).max(100000),
  notices: z.array(z.string().max(300)).max(20),
  annotation: annotationSchema,
});
export type Session = z.infer<typeof sessionSchema>;
export const sourceSchema = z.object({
  provider: providerSchema,
  status: z.enum(["ready", "missing", "error", "demo"]),
  files: count,
  skipped: count,
  message: z.string(),
});
export const snapshotSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string().datetime(),
  mode: z.enum(["demo", "local", "import"]),
  sessions: z.array(sessionSchema).max(10000),
  sources: z.array(sourceSchema),
});
export type Snapshot = z.infer<typeof snapshotSchema>;
export const providerNames: Record<Provider, string> = {
  codex: "Codex",
  claude: "Claude Code",
  workbuddy: "WorkBuddy",
};
export const providerColors: Record<Provider, string> = {
  codex: "#a9d7b7",
  claude: "#e8a97d",
  workbuddy: "#91bbd8",
};
export function sessionTotals(session: Session) {
  return session.requests.reduce(
    (a, r) => ({
      input: a.input + r.input,
      output: a.output + r.output,
      cache: a.cache + (r.cacheRead ?? 0),
      write: a.write + (r.cacheWrite ?? 0),
      total: a.total + r.input + r.output,
      cacheKnownInput: a.cacheKnownInput + (r.cacheRead === null ? 0 : r.input),
    }),
    { input: 0, output: 0, cache: 0, write: 0, total: 0, cacheKnownInput: 0 },
  );
}
