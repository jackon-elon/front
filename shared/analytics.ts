import { providerNames, type Provider, type Session } from "./schema";

export interface Filters {
  provider: Provider | "all";
  days: number;
  project: string;
}
export function analyze(
  sessions: Session[],
  filters: Filters,
  now = Date.now(),
) {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const firstDay = new Date(midnight);
  firstDay.setDate(firstDay.getDate() - filters.days + 1);
  const cutoff = firstDay.getTime();
  const selected = sessions.filter(
    (s) =>
      (filters.provider === "all" || s.provider === filters.provider) &&
      (!filters.project || s.project === filters.project),
  );
  const localDay = (stamp: string) => {
    const d = new Date(stamp);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const daily = Array.from({ length: filters.days }, (_, i) => {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() + i);
    return {
      date: localDay(d.toISOString()),
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      input: 0,
      output: 0,
      cache: 0,
      total: 0,
      requests: 0,
    };
  });
  const map = new Map(daily.map((d) => [d.date, d]));
  const breakdown = (["codex", "claude", "workbuddy"] as Provider[]).map(
    (provider) => ({
      provider,
      name: providerNames[provider],
      total: 0,
      input: 0,
      output: 0,
      cache: 0,
      requests: 0,
    }),
  );
  let total = 0,
    input = 0,
    output = 0,
    cache = 0,
    knownCacheInput = 0,
    requests = 0,
    errors = 0,
    contextKnown = 0,
    maxContext = 0;
  const heatmap = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0),
  );
  const activeSessions: string[] = [];
  for (const session of selected) {
    let active = false;
    for (const r of session.requests) {
      const time = Date.parse(r.time);
      if (time < cutoff || time > now + 86400000) continue;
      const day = map.get(localDay(r.time));
      if (!day) continue;
      active = true;
      const sum = r.input + r.output;
      total += sum;
      input += r.input;
      output += r.output;
      cache += r.cacheRead ?? 0;
      if (r.cacheRead !== null) knownCacheInput += r.input;
      requests++;
      errors += Number(r.error);
      if (r.contextLimit) {
        contextKnown++;
        maxContext = Math.max(maxContext, r.input / r.contextLimit);
      }
      const b = breakdown.find((b) => b.provider === session.provider)!;
      b.total += sum;
      b.input += r.input;
      b.output += r.output;
      b.cache += r.cacheRead ?? 0;
      b.requests++;
      day.input += r.input;
      day.output += r.output;
      day.cache += r.cacheRead ?? 0;
      day.total += sum;
      day.requests++;
      const date = new Date(time);
      heatmap[(date.getDay() + 6) % 7][date.getHours()]++;
    }
    if (active) activeSessions.push(session.id);
  }
  return {
    total,
    input,
    output,
    cache,
    knownCacheInput,
    cacheRate: knownCacheInput ? cache / knownCacheInput : null,
    requests,
    errors,
    contextKnown,
    maxContext,
    activeSessions,
    daily,
    breakdown,
    heatmap,
  };
}
export type Analytics = ReturnType<typeof analyze>;
