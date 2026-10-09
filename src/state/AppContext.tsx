import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDemo } from "../../shared/demo";
import {
  annotationSchema,
  snapshotSchema,
  type Annotation,
  type Snapshot,
} from "../../shared/schema";
import {
  loadImport,
  readSetting,
  saveImport,
  saveSetting,
} from "../lib/storage";
import { usageChanges, type RequestEvent } from "../../shared/live";

export type Mode = "demo" | "local" | "import";
const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(
  window.location.hostname,
);
async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!response.ok)
    throw new Error(`本地服务响应 ${response.status}，请检查连接后重试`);
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error("本地 API 未启动。运行 npm run dev:all，或切换到演示模式");
  }
}
interface Context {
  mode: Mode;
  setMode: (mode: Mode) => void;
  snapshot: Snapshot | undefined;
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  refresh: () => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  toast: (message: string) => void;
  notification: string;
  importData: (snapshot: Snapshot) => Promise<void>;
  connected: boolean;
  checkedAt: string | null;
  events: RequestEvent[];
  eventCount: number;
}
const AppContext = createContext<Context | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [mode, updateMode] = useState<Mode>(() => {
    const fallback = loopback ? "local" : "demo";
    // A versioned preference removes the old default-to-demo behavior on localhost.
    const saved = readSetting<Mode>("mode:v3", fallback);
    return ["demo", "local", "import"].includes(saved) ? saved : fallback;
  });
  const [compare, setCompare] = useState<string[]>(() => {
    const saved = readSetting<unknown>("comparison", []);
    return Array.isArray(saved)
      ? saved.filter((id): id is string => typeof id === "string").slice(0, 3)
      : [];
  });
  useEffect(() => {
    try {
      saveSetting("comparison", compare);
    } catch {
      /* selection remains available in memory */
    }
  }, [compare]);
  const [notification, toast] = useState("");
  const [connected, setConnected] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const baseline = useRef<{ mode: Mode; snapshot: Snapshot } | null>(null);
  const query = useQuery({
    queryKey: ["snapshot", mode],
    queryFn: async ({ signal }) => {
      if (mode === "local") {
        if (!loopback)
          throw new Error(
            "在线演示不能读取电脑日志。请下载项目并在本机运行 npm run dev:all，再选择本地模式。",
          );
        return snapshotSchema.parse(await api("/api/snapshot", { signal }));
      }
      const snapshot = mode === "import" ? await loadImport() : createDemo();
      if (!snapshot)
        throw new Error(
          "还没有导入记录。请到数据源页面导入 JSONL 或 Trace 文件",
        );
      const annotations = readSetting<Record<string, Annotation>>(
        `annotations:${mode}`,
        {},
      );
      return {
        ...snapshot,
        sessions: snapshot.sessions.map((s) => ({
          ...s,
          annotation: annotationSchema.safeParse(annotations[s.id]).success
            ? annotations[s.id]
            : s.annotation,
        })),
      };
    },
    retry: false,
    staleTime: mode === "local" ? 10000 : Infinity,
    refetchOnWindowFocus: mode === "local",
    refetchInterval: mode === "local" && !connected ? 5000 : false,
  });
  useEffect(() => {
    const current = query.data;
    if (!current) return;
    const before = baseline.current;
    if (!before || before.mode !== mode) {
      setEvents([]);
      setEventCount(0);
    } else {
      const changes = usageChanges(before.snapshot, current);
      if (changes.length) {
        setEvents((old) => [...changes, ...old].slice(0, 100));
        setEventCount((n) => n + changes.length);
      }
    }
    baseline.current = { mode, snapshot: current };
    setCheckedAt(current.generatedAt);
  }, [query.data, mode]);
  useEffect(() => {
    if (mode !== "local" || !loopback) {
      setConnected(false);
      return;
    }
    const source = new EventSource("/api/events");
    source.addEventListener("connected", () => {
      setConnected(true);
      // Reconcile changes that happened while the stream was disconnected.
      void queryClient.invalidateQueries({ queryKey: ["snapshot", "local"] });
    });
    source.addEventListener("updated", () => {
      setConnected(true);
      void queryClient.invalidateQueries({ queryKey: ["snapshot", "local"] });
    });
    source.onerror = () => setConnected(false);
    source.addEventListener("scanned", (event: MessageEvent) => {
      setConnected(true);
      setCheckedAt(event.data);
    });
    return () => {
      source.close();
      setConnected(false);
    };
  }, [mode, queryClient]);
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => toast(""), 4200);
    return () => clearTimeout(timer);
  }, [notification]);
  const refresh = useMutation({
    mutationFn: async () => {
      if (mode === "local" && loopback)
        await api("/api/refresh", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["snapshot", mode] });
    },
    onSuccess: () => toast("数据已更新"),
    onError: (error) => toast(error.message),
  });
  const setMode = (next: Mode) => {
    updateMode(next);
    setCompare([]);
    try {
      saveSetting("mode:v3", next);
    } catch {
      toast("浏览器存储不可用，设置仅在当前页面生效");
    }
  };
  const toggleCompare = (id: string) =>
    setCompare((previous) => {
      if (previous.includes(id)) return previous.filter((x) => x !== id);
      if (previous.length === 3) {
        toast("最多对比三个会话");
        return previous;
      }
      return [...previous, id];
    });
  const importData = async (snapshot: Snapshot) => {
    await saveImport(snapshot);
    await queryClient.invalidateQueries({ queryKey: ["snapshot", "import"] });
    setMode("import");
    toast(`已导入 ${snapshot.sessions.length} 个会话`);
  };
  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        snapshot: query.data,
        loading: query.isPending,
        error: query.error,
        refreshing: query.isFetching || refresh.isPending,
        refresh: () => refresh.mutate(),
        compare,
        toggleCompare,
        clearCompare: () => setCompare([]),
        toast,
        notification,
        importData,
        connected,
        checkedAt,
        events,
        eventCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("Missing AppProvider");
  return context;
}
export function useAnnotation(id: string) {
  const { mode, toast } = useApp();
  const client = useQueryClient();
  const key = ["snapshot", mode];
  return useMutation({
    scope: { id },
    mutationFn: async (annotation: Annotation) => {
      const validated = annotationSchema.parse(annotation);
      if (mode === "local")
        return api<Annotation>(`/api/annotations/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(validated),
        });
      const previous = readSetting<Record<string, Annotation>>(
        `annotations:${mode}`,
        {},
      );
      saveSetting(`annotations:${mode}`, { ...previous, [id]: validated });
      return validated;
    },
    onMutate: async (annotation) => {
      await client.cancelQueries({ queryKey: key });
      const previous = client.getQueryData<Snapshot>(key);
      client.setQueryData<Snapshot>(
        key,
        (data) =>
          data && {
            ...data,
            sessions: data.sessions.map((s) =>
              s.id === id ? { ...s, annotation } : s,
            ),
          },
      );
      return {
        previous: previous?.sessions.find((s) => s.id === id)?.annotation,
      };
    },
    onError: (error, _, context) => {
      if (context?.previous)
        client.setQueryData<Snapshot>(
          key,
          (data) =>
            data && {
              ...data,
              sessions: data.sessions.map((s) =>
                s.id === id ? { ...s, annotation: context.previous! } : s,
              ),
            },
        );
      toast(error.message);
    },
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
}
