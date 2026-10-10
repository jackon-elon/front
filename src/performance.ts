import type { ProfilerOnRenderCallback } from "react";

// Explicit, local-only diagnostics: no network reporting or production UI.
export const diagnosticsEnabled =
  new URLSearchParams(window.location.search).get("diagnostics") === "1";
type RenderSample = {
  id: string;
  phase: string;
  actualMs: number;
  baseMs: number;
  committedAtMs: number;
};
const samples: RenderSample[] = [];
let publish: (() => void) | undefined;
export const profileRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  _startTime,
  commitTime,
) => {
  samples.push({
    id,
    phase,
    actualMs: actualDuration,
    baseMs: baseDuration,
    committedAtMs: commitTime,
  });
  if (samples.length > 100) samples.shift();
  publish?.();
};
export function startDiagnostics() {
  if (!diagnosticsEnabled) return;
  const output = document.createElement("output");
  output.id = "performance-diagnostics";
  output.hidden = true;
  output.setAttribute("aria-hidden", "true");
  document.body.append(output);
  const supported =
    typeof PerformanceObserver === "undefined"
      ? []
      : PerformanceObserver.supportedEntryTypes;
  const report = {
    environment: import.meta.env.DEV ? "development" : "production",
    reactProfiling: import.meta.env.DEV
      ? "enabled-development-only"
      : "disabled-in-standard-production-build",
    supportedEntryTypes: supported,
    firstContentfulPaintMs: null as number | null,
    largestContentfulPaintMs: null as number | null,
    longTasks: { count: 0, totalMs: 0, maxMs: 0 },
    // Raw diagnostic aggregates, deliberately not advertised as CLS or INP.
    layoutShiftScoreTotal: 0,
    sampledInteractionMaxMs: null as number | null,
    reactCommits: samples,
  };
  let timer = 0;
  const flush = () => {
    timer = 0;
    output.textContent = JSON.stringify(report);
  };
  publish = () => {
    if (!timer) timer = window.setTimeout(flush, 250);
  };
  const observers: PerformanceObserver[] = [];
  for (const type of [
    "paint",
    "largest-contentful-paint",
    "longtask",
    "layout-shift",
    "event",
  ]) {
    if (!supported.includes(type)) continue;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (type === "paint" && entry.name === "first-contentful-paint")
          report.firstContentfulPaintMs = entry.startTime;
        if (type === "largest-contentful-paint")
          report.largestContentfulPaintMs = entry.startTime;
        if (type === "longtask") {
          report.longTasks.count++;
          report.longTasks.totalMs += entry.duration;
          report.longTasks.maxMs = Math.max(
            report.longTasks.maxMs,
            entry.duration,
          );
        }
        if (type === "layout-shift") {
          const shift = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };
          if (!shift.hadRecentInput)
            report.layoutShiftScoreTotal += shift.value;
        }
        if (
          type === "event" &&
          (entry as PerformanceEventTiming & { interactionId?: number })
            .interactionId
        )
          report.sampledInteractionMaxMs = Math.max(
            report.sampledInteractionMaxMs ?? 0,
            entry.duration,
          );
      }
      publish?.();
    });
    observer.observe({
      type,
      buffered: true,
      ...(type === "event" ? { durationThreshold: 16 } : {}),
    });
    observers.push(observer);
  }
  flush();
  window.addEventListener(
    "pagehide",
    () => {
      observers.forEach((observer) => observer.disconnect());
      window.clearTimeout(timer);
      publish = undefined;
    },
    { once: true },
  );
}
