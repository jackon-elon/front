import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  initialDesign,
  normalizeStudio,
  studioReducer,
  studioStorageKey,
  type DesignSettings,
  type SavedDesign,
  type StudioState,
} from "./studioModel";
import type { ProjectId } from "../data/projects";
interface StudioValue extends StudioState {
  persistent: boolean;
  notification: string;
  notify: (message: string) => void;
  toggleFavorite: (id: ProjectId) => void;
  reorder: (from: ProjectId, to: ProjectId) => void;
  edit: (id: ProjectId, patch: Partial<DesignSettings>) => void;
  reset: (id: ProjectId) => void;
  save: (id: ProjectId, title: string, note: string) => void;
  restore: (id: string) => void;
  remove: (id: string) => void;
  setReducedMotion: (value: boolean) => void;
}
const StudioContext = createContext<StudioValue | null>(null);
function readInitial() {
  try {
    return normalizeStudio(
      JSON.parse(localStorage.getItem(studioStorageKey) ?? "null"),
    );
  } catch {
    return normalizeStudio(null);
  }
}
export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studioReducer, undefined, readInitial);
  const [persistent, setPersistent] = useState(true),
    [notification, setNotification] = useState("");
  const [noticeVersion, setNoticeVersion] = useState(0);
  const notify = useCallback((message: string) => {
    setNotification(message);
    setNoticeVersion((v) => v + 1);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(studioStorageKey, JSON.stringify(state));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [state]);
  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(""), 3200);
    return () => clearTimeout(timer);
  }, [notification, noticeVersion]);
  const toggleFavorite = useCallback(
    (id: ProjectId) => dispatch({ type: "favorite", id }),
    [],
  );
  const reorder = useCallback(
    (from: ProjectId, to: ProjectId) => dispatch({ type: "reorder", from, to }),
    [],
  );
  const edit = useCallback(
    (id: ProjectId, patch: Partial<DesignSettings>) =>
      dispatch({ type: "edit", id, patch }),
    [],
  );
  const reset = useCallback(
    (id: ProjectId) => {
      dispatch({ type: "reset", id });
      notify("已恢复原始设计");
    },
    [notify],
  );
  const save = useCallback(
    (projectId: ProjectId, title: string, note: string) => {
      const entry: SavedDesign = {
        id: crypto.randomUUID(),
        projectId,
        title: title.trim().slice(0, 40),
        note: note.trim().slice(0, 200),
        settings: { ...(state.drafts[projectId] ?? initialDesign) },
        createdAt: new Date().toISOString(),
      };
      if (!entry.title) return;
      dispatch({ type: "save", entry });
      notify(
        persistent
          ? "你的版本已保存在这台设备"
          : "已暂存版本；当前浏览器无法持久保存",
      );
    },
    [state.drafts, notify, persistent],
  );
  const restore = useCallback(
    (id: string) => {
      dispatch({ type: "restore", id });
      notify("已恢复这个设计版本");
    },
    [notify],
  );
  const remove = useCallback(
    (id: string) => {
      dispatch({ type: "delete", id });
      notify("已删除这个版本");
    },
    [notify],
  );
  const setReducedMotion = useCallback(
    (reduced: boolean) => dispatch({ type: "motion", reduced }),
    [],
  );
  const value = useMemo(
    () => ({
      ...state,
      persistent,
      notification,
      notify,
      toggleFavorite,
      reorder,
      edit,
      reset,
      save,
      restore,
      remove,
      setReducedMotion,
    }),
    [
      state,
      persistent,
      notification,
      notify,
      toggleFavorite,
      reorder,
      edit,
      reset,
      save,
      restore,
      remove,
      setReducedMotion,
    ],
  );
  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}
export function useStudio() {
  const value = useContext(StudioContext);
  if (!value) throw new Error("StudioProvider is required");
  return value;
}
