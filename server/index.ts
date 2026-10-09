import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { createHash } from "node:crypto";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import {
  annotationSchema,
  snapshotSchema,
  type Annotation,
  type Snapshot,
} from "../shared/schema";
import { scan } from "./scanner";

const port = Number(process.env.AGENTLENS_PORT ?? 5174);
const store = resolve(
  process.env.AGENTLENS_STORE ?? ".agentlens/annotations.json",
);
let annotations: Record<string, Annotation> = {};
try {
  annotations = JSON.parse(await readFile(store, "utf8"));
} catch {
  /* first launch */
}
let snapshot: Snapshot | null = null;
let scanning: Promise<Snapshot> | null = null;
let revision = 0;
let previous = "";
const clients = new Set<ServerResponse>();
let saveQueue = Promise.resolve();
const refresh = () =>
  scanning ??
  (scanning = scan()
    .then((result) => {
      snapshotSchema.parse(result);
      const fingerprint = createHash("sha256")
        .update(JSON.stringify(result.sessions))
        .digest("hex");
      if (fingerprint !== previous) {
        previous = fingerprint;
        revision++;
        for (const client of clients)
          client.write(`event: updated\ndata: ${revision}\n\n`);
      }
      snapshot = result;
      return result;
    })
    .finally(() => {
      scanning = null;
    }));
const json = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
};
async function body(req: IncomingMessage) {
  let size = 0;
  let text = "";
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16000) throw new Error("请求过大");
    text += chunk;
  }
  return JSON.parse(text);
}
const server = createServer(async (req, res) => {
  // Loopback binding plus host/origin checks prevent drive-by access to local metadata.
  const host = req.headers.host ?? "";
  const origin = req.headers.origin;
  if (
    !/^(127\.0\.0\.1|localhost):\d+$/.test(host) ||
    (origin && !/^http:\/\/(127\.0\.0\.1|localhost):(5173|5174)$/.test(origin))
  )
    return json(res, 403, { error: "仅允许本地 AgentLens 访问" });
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  try {
    if (url.pathname === "/api/health")
      return json(res, 200, { ok: true, revision });
    if (url.pathname === "/api/events" && req.method === "GET") {
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      res.write(`event: connected\ndata: ${revision}\n\n`);
      clients.add(res);
      req.on("close", () => clients.delete(res));
      return;
    }
    if (url.pathname === "/api/snapshot" && req.method === "GET") {
      const result = snapshot ?? (await refresh());
      return json(res, 200, {
        ...result,
        sessions: result.sessions.map((s) => ({
          ...s,
          annotation: annotations[s.id] ?? s.annotation,
        })),
      });
    }
    if (url.pathname === "/api/refresh" && req.method === "POST") {
      await refresh();
      return json(res, 200, { ok: true });
    }
    if (url.pathname.startsWith("/api/annotations/") && req.method === "PUT") {
      const id = decodeURIComponent(
        url.pathname.slice("/api/annotations/".length),
      );
      if (!snapshot?.sessions.some((s) => s.id === id))
        return json(res, 404, { error: "会话不存在" });
      const data = annotationSchema.parse(await body(req));
      // Persist first. Queries only observe acknowledged metadata.
      saveQueue = saveQueue
        .catch(() => {})
        .then(async () => {
          const next = { ...annotations, [id]: data };
          await mkdir(dirname(store), { recursive: true });
          await writeFile(store + ".tmp", JSON.stringify(next), "utf8");
          await rename(store + ".tmp", store);
          annotations = next;
        });
      await saveQueue;
      for (const client of clients)
        client.write("event: updated\ndata: metadata\n\n");
      return json(res, 200, data);
    }
    return json(res, 404, { error: "接口不存在" });
  } catch {
    return json(res, 400, { error: "数据格式不正确或本地文件无法访问" });
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`AgentLens local API: http://127.0.0.1:${port}`),
);
const interval = setInterval(() => {
  refresh().catch(() => {});
  for (const client of clients) client.write(": heartbeat\n\n");
}, 10000);
refresh().catch((err) => console.error("Scan failed:", err.message));
const close = () => {
  clearInterval(interval);
  for (const client of clients) client.end();
  server.close(() => process.exit(0));
};
process.on("SIGINT", close);
process.on("SIGTERM", close);
