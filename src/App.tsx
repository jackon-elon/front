import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  HashRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  Link,
  useSearchParams,
} from "react-router-dom";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { ArrowUpRight, Check, Menu, RefreshCw, Search, X } from "lucide-react";
import { useApp } from "./state/AppContext";
import { Empty, Skeleton } from "./components/UI";
import { Modal } from "./components/Modal";
import { readSetting } from "./lib/storage";
import "./experience.css";
const Experience = lazy(() => import("./pages/Experience"));
const Overview = lazy(() => import("./pages/Overview"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Compare = lazy(() => import("./pages/Compare"));
const Sources = lazy(() => import("./pages/Sources"));
const SessionDetail = lazy(() => import("./components/SessionDetail"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));
const Inspector = lazy(() => import("./components/RegionInspector"));
const nav = [
  { path: "/", label: "视觉探索", english: "Experience" },
  { path: "/sessions", label: "会话展册", english: "Sessions" },
  { path: "/compare", label: "变化分析", english: "Change analysis" },
  { path: "/workspace", label: "实时工作台", english: "Workspace" },
  { path: "/sources", label: "连接数据源", english: "Connections" },
];
class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <Empty
        error
        title="这个视图暂时无法加载"
        message="请刷新页面重试。"
        action={
          <button className="button" onClick={() => window.location.reload()}>
            重新加载
          </button>
        }
      />
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const location = useLocation();
  const [params] = useSearchParams();
  const {
    mode,
    setMode,
    connected,
    refresh,
    refreshing,
    compare,
    loading,
    error,
    notification,
    toast,
  } = useApp();
  const [command, setCommand] = useState(false);
  const [menu, setMenu] = useState(false);
  const [animations, setAnimations] = useState(() =>
    readSetting("motion", true),
  );
  const home = location.pathname === "/";
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMenu(false);
    document.title = `${nav.find((n) => n.path === location.pathname)?.label ?? "AgentLens"} · AgentLens`;
    document.documentElement.dataset.view = home ? "experience" : "workspace";
  }, [location.pathname, home]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setAnimations(document.documentElement.dataset.motion !== "off"),
    );
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion"],
    });
    return () => observer.disconnect();
  }, []);
  return (
    <MotionConfig reducedMotion={animations ? "user" : "always"}>
      <div
        className={`studio-shell ${home ? "studio-home" : "studio-workspace"}`}
      >
        <header className="studio-header" data-region="顶部导航">
          <Link className="studio-brand" to="/">
            agentlens<span>®</span>
          </Link>
          <nav aria-label="主导航">
            {nav.slice(0, 3).map((n) => (
              <NavLink end={n.path === "/"} key={n.path} to={n.path}>
                {n.label}
                {n.path === "/compare" && compare.length > 0 && (
                  <small>{compare.length}</small>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="studio-header-tools">
            <span
              className={`studio-status ${connected && mode === "local" ? "live" : ""}`}
            >
              <i />
              {mode === "local" ? "LOCAL" : mode === "demo" ? "DEMO" : "IMPORT"}
            </span>
            <select
              aria-label="数据模式"
              value={mode}
              onChange={(e) => setMode(e.target.value as typeof mode)}
            >
              <option value="local">本机实时</option>
              <option value="demo">虚构演示</option>
              <option value="import">导入记录</option>
            </select>
            <button aria-label="搜索与跳转" onClick={() => setCommand(true)}>
              <Search size={20} />
            </button>
            <button
              aria-label="刷新数据"
              disabled={refreshing}
              onClick={refresh}
            >
              <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            </button>
            <button
              className="studio-menu-button"
              aria-label="打开全屏导航"
              aria-expanded={menu}
              onClick={() => setMenu(true)}
            >
              MENU <Menu size={21} />
            </button>
          </div>
        </header>
        <main
          className={home ? "studio-experience-content" : "studio-page-content"}
          id="main-content"
          tabIndex={-1}
        >
          <Boundary key={location.pathname}>
            <Suspense fallback={<Skeleton />}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, clipPath: "inset(6% 0 0 0)" }}
                  animate={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
                  exit={{ opacity: 0, clipPath: "inset(0 0 12% 0)" }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  {location.pathname !== "/sources" && (loading || error) ? (
                    loading ? (
                      <Skeleton />
                    ) : (
                      <Empty
                        error
                        title="数据还没连接上"
                        message={error?.message ?? ""}
                        action={
                          <div className="empty-actions">
                            <button
                              className="button primary"
                              onClick={refresh}
                            >
                              重试连接
                            </button>
                            <Link className="button" to="/sources">
                              管理数据源
                            </Link>
                          </div>
                        }
                      />
                    )
                  ) : (
                    <Routes location={location}>
                      <Route
                        path="/"
                        element={<Experience animations={animations} />}
                      />
                      <Route path="/workspace" element={<Overview />} />
                      <Route path="/sessions" element={<Sessions />} />
                      <Route path="/compare" element={<Compare />} />
                      <Route path="/sources" element={<Sources />} />
                      <Route
                        path="*"
                        element={
                          <Empty
                            title="这个页面不存在"
                            message="回到视觉探索，继续浏览。"
                            action={
                              <Link className="button" to="/">
                                回到首页
                              </Link>
                            }
                          />
                        }
                      />
                    </Routes>
                  )}
                </motion.div>
              </AnimatePresence>
            </Suspense>
          </Boundary>
        </main>
        {!home && (
          <footer className="studio-workspace-footer">
            <Link to="/">← 返回视觉探索</Link>
            <span>AGENTLENS / LOCAL FIRST / OPEN SOURCE</span>
          </footer>
        )}
      </div>
      <Modal
        open={menu}
        title="EXPLORE / AGENTLENS"
        onClose={() => setMenu(false)}
        className="studio-fullscreen-menu"
      >
        <nav aria-label="全屏导航">
          {nav.map((n, i) => (
            <Link key={n.path} to={n.path} onClick={() => setMenu(false)}>
              <span>0{i + 1}</span>
              <strong>
                {n.label}
                <small>{n.english}</small>
              </strong>
              <ArrowUpRight />
            </Link>
          ))}
        </nav>
        <div className="studio-menu-foot">
          <span>
            {mode === "local"
              ? "LOCAL / 本机实时数据"
              : mode === "demo"
                ? "DEMO / 虚构演示数据"
                : "IMPORT / 导入记录"}
          </span>
          <a
            href="https://github.com/jackon-elon/front"
            target="_blank"
            rel="noreferrer"
          >
            GITHUB ↗
          </a>
        </div>
      </Modal>
      <Suspense fallback={null}>
        {command && (
          <CommandPalette open={command} onClose={() => setCommand(false)} />
        )}{" "}
        {params.has("session") && <SessionDetail />}
        {import.meta.env.DEV && <Inspector />}
      </Suspense>
      <AnimatePresence>
        {notification && (
          <motion.div
            role="status"
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Check size={17} />
            {notification}
            <button
              className="icon-button"
              aria-label="关闭通知"
              onClick={() => toast("")}
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
export default function App() {
  return (
    <HashRouter>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        跳到主要内容
      </a>
      <Shell />
    </HashRouter>
  );
}
