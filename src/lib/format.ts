export const compact = (n: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
export const integer = (n: number) =>
  new Intl.NumberFormat("en").format(Math.round(n));
export const percent = (n: number | null) =>
  n === null ? "—" : `${(n * 100).toFixed(1)}%`;
export const time = (s: string) =>
  new Date(s).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
export const duration = (ms: number | null) =>
  ms === null
    ? "—"
    : ms > 60000
      ? `${Math.round(ms / 60000)} min`
      : `${(ms / 1000).toFixed(1)} s`;
