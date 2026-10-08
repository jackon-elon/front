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
import { artworks, type ArtworkKind } from "../data/artworks";
import {
  defaultSettings,
  labReducer,
  normalizePersisted,
  storageKey,
  type LabSettings,
  type PersistedLab,
  type SavedExperiment,
} from "./model";

interface LabContextValue extends PersistedLab {
  appearance: "light" | "dark";
  setAppearance: (value: "light" | "dark") => void;
  updateSettings: (value: Partial<LabSettings>) => void;
  resetSettings: () => void;
  toggleFavorite: (kind: ArtworkKind) => void;
  saveExperiment: (kind: ArtworkKind, title: string) => void;
  deleteExperiment: (id: string) => void;
  restoreExperiment: (id: string) => void;
  notify: (message: string) => void;
  notification: string;
  persistent: boolean;
}

const LabContext = createContext<LabContextValue | null>(null);

function readInitialState(): PersistedLab {
  try {
    return normalizePersisted(
      JSON.parse(localStorage.getItem(storageKey) ?? "null"),
    );
  } catch {
    return normalizePersisted(null);
  }
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(labReducer, undefined, readInitialState);
  const [appearance, setAppearance] = useState<"light" | "dark">("light");
  const [notification, setNotification] = useState("");
  const [persistent, setPersistent] = useState(true);
  const [noticeVersion, setNoticeVersion] = useState(0);

  const notify = useCallback((message: string) => {
    setNotification(message);
    setNoticeVersion((version) => version + 1);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setPersistent(true);
    } catch {
      setPersistent(false);
    }
  }, [state]);

  useEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);

  useEffect(() => {
    if (!notification) return;
    const timeout = window.setTimeout(() => setNotification(""), 3400);
    return () => window.clearTimeout(timeout);
  }, [notification, noticeVersion]);

  const updateSettings = useCallback((value: Partial<LabSettings>) => {
    dispatch({ type: "settings", value });
  }, []);
  const resetSettings = useCallback(() => {
    dispatch({ type: "reset" });
    notify("已回到最初的形态");
  }, [notify]);
  const toggleFavorite = useCallback((kind: ArtworkKind) => {
    dispatch({ type: "favorite", kind });
  }, []);
  const saveExperiment = useCallback(
    (kind: ArtworkKind, title: string) => {
      const entry: SavedExperiment = {
        id: crypto.randomUUID(),
        kind,
        title:
          title.trim().slice(0, 40) ||
          artworks.find((item) => item.kind === kind)!.title,
        settings: { ...state.settings },
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "save", entry });
      notify(
        persistent
          ? "实验已保存到这台设备"
          : "已暂存本次实验；当前浏览器无法持久保存",
      );
    },
    [state.settings, notify, persistent],
  );
  const deleteExperiment = useCallback(
    (id: string) => {
      dispatch({ type: "delete", id });
      notify("已移除这个实验");
    },
    [notify],
  );
  const restoreExperiment = useCallback(
    (id: string) => {
      dispatch({ type: "restore", id });
      notify("已恢复这组实验参数");
    },
    [notify],
  );

  const value = useMemo<LabContextValue>(
    () => ({
      ...state,
      appearance,
      setAppearance,
      notification,
      notify,
      persistent,
      updateSettings,
      resetSettings,
      toggleFavorite,
      saveExperiment,
      deleteExperiment,
      restoreExperiment,
    }),
    [
      state,
      appearance,
      notification,
      notify,
      persistent,
      updateSettings,
      resetSettings,
      toggleFavorite,
      saveExperiment,
      deleteExperiment,
      restoreExperiment,
    ],
  );

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab(): LabContextValue {
  const context = useContext(LabContext);
  if (!context) throw new Error("useLab must be used inside LabProvider");
  return context;
}

export { defaultSettings };
