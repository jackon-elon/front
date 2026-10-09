import type { UsageRequest } from "./schema";

/** A bounded circular window keeps the selected record centered at both ends. */
export function galleryEntries<T extends { id: string }>(
  sessions: T[],
  index: number,
  spread: boolean,
) {
  if (!sessions.length) return [];
  const center =
    ((index % sessions.length) + sessions.length) % sessions.length;
  const count = Math.min(spread ? 5 : 3, sessions.length);
  const before = Math.floor((count - 1) / 2);
  const offsets = spread
    ? Array.from({ length: count }, (_, i) => i - before)
    : Array.from({ length: count }, (_, i) => count - i - 1);
  return offsets.map((relative) => {
    const ordinal = (center + relative + sessions.length) % sessions.length;
    return {
      session: sessions[ordinal],
      ordinal: ordinal + 1,
      offset: spread ? relative : relative === 0 ? 0 : relative === 1 ? 1 : -1,
    };
  });
}

/** Chronological bins retain all requests, including when a session is very long. */
export function recordBins(requests: UsageRequest[], limit = 64) {
  const count = Math.min(requests.length, Math.max(1, Math.floor(limit)));
  if (!count) return [];
  const bins = Array.from({ length: count }, () => ({
    input: 0,
    output: 0,
    cache: 0,
    cacheKnown: false,
    first: 0,
    last: 0,
  }));
  requests.forEach((request, index) => {
    const bucket = Math.min(
      count - 1,
      Math.floor((index * count) / requests.length),
    );
    const bin = bins[bucket];
    if (
      index === 0 ||
      Math.floor(((index - 1) * count) / requests.length) !== bucket
    )
      bin.first = index;
    bin.last = index;
    bin.input += request.input;
    bin.output += request.output;
    bin.cache += request.cacheRead ?? 0;
    bin.cacheKnown ||= request.cacheRead !== null;
  });
  return bins;
}

export function requestIndexFromAngle(x: number, y: number, count: number) {
  if (!count) return 0;
  const angle = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
  return Math.min(count - 1, Math.floor((angle / (Math.PI * 2)) * count));
}

/** Labels in the center and the empty corners are not request sectors. */
export function recordSector(x: number, y: number, count: number) {
  const radius = Math.hypot(x, y);
  return count > 0 && radius >= 65 && radius <= 247
    ? requestIndexFromAngle(x, y, count)
    : null;
}
