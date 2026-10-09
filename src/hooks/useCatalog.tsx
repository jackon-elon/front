import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { readCatalog, type Project } from "../data/projects";
const CatalogContext = createContext<{
  projects: Project[];
  loading: boolean;
  error: string;
  retry: () => void;
} | null>(null);
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(import.meta.env.BASE_URL + "catalog.json", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error("作品暂时无法加载");
        return response.json().catch(() => {
          throw new Error("作品数据暂时无法读取，请重试");
        });
      })
      .then((data) => {
        if (!controller.signal.aborted) setProjects(readCatalog(data));
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "作品加载失败");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  return (
    <CatalogContext.Provider value={{ projects, loading, error, retry }}>
      {children}
    </CatalogContext.Provider>
  );
}
export function useCatalog() {
  const value = useContext(CatalogContext);
  if (!value) throw new Error("CatalogProvider is required");
  return value;
}
