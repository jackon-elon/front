import { sessionTotals, type Session } from "./schema";

export function usageProfile(session: Session) {
  const totals = sessionTotals(session);
  const count = session.requests.length;
  return {
    total: totals.total,
    avgInput: count ? totals.input / count : null,
    avgOutput: count ? totals.output / count : null,
    peakInput: count
      ? session.requests.reduce((peak, r) => Math.max(peak, r.input), 0)
      : null,
    cacheRate:
      totals.cacheKnownInput > 0 ? totals.cache / totals.cacheKnownInput : null,
    cacheKnown: session.requests.filter((r) => r.cacheRead !== null).length,
    requests: count,
    errors: session.requests.filter((r) => r.error).length,
    compactions: session.requests.filter((r) => r.kind === "compaction").length,
  };
}

export function metricDifference(
  value: number | null,
  baseline: number | null,
) {
  if (value === null || baseline === null) return null;
  return {
    absolute: value - baseline,
    relative: baseline === 0 ? null : (value - baseline) / baseline,
  };
}

/** Oldest of the two recent runs becomes the explicit baseline. */
export function recentProjectPair(sessions: Session[], project: string) {
  return sessions
    .filter((s) => s.project === project)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 2)
    .reverse();
}

export function contextRows(
  sessions: Session[],
  normalized: boolean,
  alignment: "step" | "progress",
) {
  const size = Math.max(0, ...sessions.map((s) => s.requests.length));
  const count = alignment === "progress" ? (size ? 101 : 0) : size;
  return Array.from({ length: count }, (_, i) =>
    Object.fromEntries([
      ["step", alignment === "progress" ? i : i + 1],
      ...sessions.map((s, series) => {
        const index =
          alignment === "progress"
            ? Math.floor((i / 100) * Math.max(0, s.requests.length - 1))
            : i;
        const r = s.requests[index];
        return [
          `series${series}`,
          r
            ? normalized
              ? r.contextLimit
                ? (r.input / r.contextLimit) * 100
                : null
              : r.input
            : null,
        ];
      }),
    ]),
  );
}
