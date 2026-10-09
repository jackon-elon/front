import type { Provider, Session, Snapshot, UsageRequest } from "./schema";

export interface RequestEvent {
  key: string;
  sessionId: string;
  provider: Provider;
  project: string;
  request: UsageRequest;
  input: number;
  output: number;
}

export function usageChanges(
  previous: Snapshot,
  current: Snapshot,
): RequestEvent[] {
  const old = new Map(
    previous.sessions.flatMap((s) =>
      s.requests.map((r) => [`${s.id}/${r.id}`, r] as const),
    ),
  );
  return current.sessions
    .flatMap((s) =>
      s.requests.flatMap((r) => {
        const before = old.get(`${s.id}/${r.id}`);
        const input = Math.max(0, r.input - (before?.input ?? 0));
        const output = Math.max(0, r.output - (before?.output ?? 0));
        if (before && !input && !output) return [];
        return [
          {
            key: `${s.id}/${r.id}/${r.input}/${r.output}`,
            sessionId: s.id,
            provider: s.provider,
            project: s.project,
            request: r,
            input,
            output,
          },
        ];
      }),
    )
    .sort((a, b) => Date.parse(b.request.time) - Date.parse(a.request.time));
}

export function requestTimeline(
  sessions: Session[],
  end: number,
  minutes: number,
) {
  const start = end - minutes * 60_000;
  const width = (end - start) / 48;
  const bins = Array.from({ length: 48 }, (_, i) => ({
    time: start + i * width,
    input: 0,
    output: 0,
    cache: 0,
    count: 0,
    sessionIds: [] as string[],
  }));
  for (const s of sessions)
    for (const r of s.requests) {
      const t = Date.parse(r.time);
      if (t < start || t > end) continue;
      const b = bins[Math.min(47, Math.floor((t - start) / width))];
      b.input += r.input;
      b.output += r.output;
      b.cache += r.cacheRead ?? 0;
      b.count++;
      if (!b.sessionIds.includes(s.id)) b.sessionIds.push(s.id);
    }
  return bins;
}
