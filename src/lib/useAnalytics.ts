import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { analyze, type Analytics, type Filters } from "../../shared/analytics";
import type { Provider, Session } from "../../shared/schema";
export function useFilters() {
  const [params, setParams] = useSearchParams();
  const source = params.get("source");
  const filters: Filters = {
    provider: ["codex", "claude", "workbuddy"].includes(source ?? "")
      ? (source as Provider)
      : "all",
    days: [7, 14, 28].includes(Number(params.get("days")))
      ? Number(params.get("days"))
      : 14,
    project: params.get("project") ?? "",
  };
  const update = (key: string, value: string) =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value && value !== "all") next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  return { filters, update };
}
export function useAnalytics(sessions: Session[], filters: Filters) {
  const [result, setResult] = useState<Analytics | null>(null);
  const [pending, setPending] = useState(true);
  const worker = useRef<Worker | null>(null);
  const sequence = useRef(0);
  useEffect(() => {
    const instance = new Worker(
      new URL("./analytics.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.current = instance;
    instance.onmessage = (
      event: MessageEvent<{ id: number; result: Analytics }>,
    ) => {
      if (event.data.id === sequence.current) {
        setResult(event.data.result);
        setPending(false);
      }
    };
    return () => {
      instance.terminate();
      worker.current = null;
    };
  }, []);
  useEffect(() => {
    setPending(true);
    const id = ++sequence.current;
    if (worker.current) {
      worker.current.onerror = () => {
        if (id === sequence.current) {
          setResult(analyze(sessions, filters));
          setPending(false);
        }
      };
      worker.current.postMessage({ id, sessions, filters });
    }
  }, [sessions, filters.provider, filters.days, filters.project]); // primitive dependencies prevent redundant work
  return { result, pending };
}
