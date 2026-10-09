import type { UsageRequest } from "./schema";

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
