import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useState,
  useRef,
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
import {
  Activity,
  ArrowUpRight,
  Command,
  GitCompareArrows,
  LayoutGrid,
  Menu,
  PlugZap,
  RefreshCw,
  Search,
  X,
  Check,
} from "lucide-react";
import { useApp } from "./state/AppContext";
import { Empty, Skeleton } from "./components/UI";
import { readSetting } from "./lib/storage";
const Overview = lazy(() => import("./pages/Overview"));
const Sessions = lazy(() => import("./pages/Sessions"));
const Compare = lazy(() => import("./pages/Compare"));
const Sources = lazy(() => import("./pages/Sources"));
const SessionDetail = lazy(() => import("./components/SessionDetail"));
const CommandPalette = lazy(() => import("./components/CommandPalette"));
const Inspector = lazy(() => import("./components/RegionInspector"));
const nav = [
  { path: "/", label: "总览", english: "Overview", icon: LayoutGrid },
  { path: "/sessions", label: "会话探索", english: "Sessions", icon: Activity },
  {
    path: "/compare",
    label: "对比工作台",
    english: "Compare",
    icon: GitCompareArrows,
  },
  { path: "/sources", label: "数据源", english: "Connections", icon: PlugZap },
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
        message="数据或网络可能发生了变化，请刷新页面重试。"
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
    snapshot,
  } = useApp();
  const [command, setCommand] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [compactNav, setCompactNav] = useState(
    () => window.matchMedia("(max-width: 950px)").matches,
  );
  const rail = useRef<HTMLElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 950px)");
    const resize = () => {
      setCompactNav(media.matches);
      if (!media.matches) setMobile(false);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement;
    const focusables = () => [
      ...(rail.current?.querySelectorAll<HTMLElement>("a[href],button") ?? []),
    ];
    focusables()[0]?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMobile(false);
      }
      if (e.key === "Tab") {
        const items = focusables();
        const first = items[0];
        const last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [mobile]);
  const [animations, setAnimations] = useState(() =>
    readSetting("motion", true),
  );
  const page = nav.find((n) => n.path === location.pathname);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setMobile(false);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${page?.label ?? "AgentLens"} · AgentLens`;
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommand((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [page?.label]);
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
      <div className="app-shell">
        <aside
          id="workspace-nav"
          ref={rail}
          inert={compactNav && !mobile}
          aria-hidden={compactNav && !mobile}
          className={`sidebar ${mobile ? "mobile-open" : ""}`}
        >
          <Link className="brand" to="/">
            <span className="brand-mark">
              <i />
              <i />
              <i />
            </span>
            <span>
              agentlens<small>AGENT OBSERVABILITY</small>
            </span>
          </Link>
          <button className="workspace-picker" onClick={() => setCommand(true)}>
            <span className="workspace-avatar">
              <Command size={17} />
            </span>
            <span>
              {mode === "local"
                ? "本机工作区"
                : mode === "demo"
                  ? "展示工作区"
                  : "导入工作区"}
              <small>
                {mode === "local" ? "Local filesystem" : "Browser workspace"}
              </small>
            </span>
            <Command size={14} />
          </button>
          <span className="nav-heading">EXPLORER / 01—04</span>
          <nav aria-label="主导航">
            {nav.map(({ path, label, english, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                title={english}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                <span>{label}</span>
                {path === "/compare" && compare.length > 0 && (
                  <b>{compare.length}</b>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <div className="sidebar-callout">
            <span className="nav-heading">DATA SOURCES</span>
            {snapshot?.sources.map((s) => (
              <Link className="rail-source" key={s.provider} to="/sources">
                <i className={s.status === "ready" ? "ready" : ""} />
                <span>
                  {s.provider === "codex"
                    ? "Codex"
                    : s.provider === "claude"
                      ? "Claude Code"
                      : "WorkBuddy"}
                </span>
                <small>
                  {s.status === "ready"
                    ? "已发现"
                    : s.status === "demo"
                      ? "示例"
                      : "未连接"}
                </small>
              </Link>
            ))}
            <a
              href="https://github.com/jackon-elon/front"
              target="_blank"
              rel="noreferrer"
            >
              GitHub 源码 <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="sidebar-footer">
            <span className="profile-avatar">J</span>
            <div>
              <strong>
                {mode === "local"
                  ? "LOCAL / LIVE"
                  : mode === "demo"
                    ? "DEMO / FICTIONAL"
                    : "IMPORT / HISTORY"}
              </strong>
              <small>
                {mode === "local" ? "元数据留在本机" : "仅当前浏览器"}
              </small>
            </div>
            <span className="status-circle" />
          </div>
        </aside>
        {mobile && (
          <button
            className="mobile-scrim"
            aria-label="关闭导航"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="app-main">
          <header className="topbar">
            <button
              className="icon-button mobile-menu"
              aria-label="打开导航"
              aria-expanded={mobile}
              aria-controls="workspace-nav"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <div className="breadcrumb">
              工作空间 <span>/</span>
              <strong>{page?.label ?? "页面"}</strong>
            </div>
            <div className="topbar-actions">
              <button
                className="global-search"
                aria-label="搜索与跳转"
                onClick={() => setCommand(true)}
              >
                <Search size={16} />
                <span>搜索与跳转</span>
                <kbd>Ctrl K</kbd>
              </button>
              <span
                className={`mode-badge ${mode === "local" && connected ? "live" : ""}`}
              >
                <i />
                {mode === "demo"
                  ? "DEMO · 示例数据"
                  : mode === "import"
                    ? "已导入记录"
                    : connected
                      ? "LOCAL · 实时监听"
                      : "LOCAL · 等待连接"}
              </span>
              <select
                aria-label="数据模式"
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                <option value="demo">演示模式</option>
                <option value="local">本地模式</option>
                <option value="import">导入模式</option>
              </select>
              <button
                className="icon-button"
                aria-label="刷新数据"
                disabled={refreshing}
                onClick={refresh}
              >
                <RefreshCw size={17} className={refreshing ? "spin" : ""} />
              </button>
            </div>
          </header>
          <main className="page-content" id="main-content" tabIndex={-1}>
            <Boundary key={location.pathname}>
              <Suspense fallback={<Skeleton />}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 14, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
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
                        <Route path="/" element={<Overview />} />
                        <Route path="/sessions" element={<Sessions />} />
                        <Route path="/compare" element={<Compare />} />
                        <Route path="/sources" element={<Sources />} />
                        <Route
                          path="*"
                          element={
                            <Empty
                              title="这个页面不存在"
                              message="回到总览，继续探索你的工作记录。"
                              action={
                                <Link className="button" to="/">
                                  回到总览
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
          <footer className="app-footer">
            <span>
              AGENTLENS <i>·</i> Agent observability, on your terms.
            </span>
            <span>Local first. Open source.</span>
          </footer>
        </div>
      </div>
      <Suspense fallback={null}>
        {command && (
          <CommandPalette open={command} onClose={() => setCommand(false)} />
        )}
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
