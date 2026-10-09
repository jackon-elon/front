import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { StudioHeader } from "./components/StudioHeader";
import { TransitionLink } from "./components/TransitionLink";
import { useStudio } from "./state/StudioContext";
import { useMotionPreference } from "./hooks/useMotionPreference";
import Discover from "./pages/DiscoverPage";
import Catalog from "./pages/CatalogPage";
import Design from "./pages/DesignPage";
import Shelf from "./pages/ShelfPage";
import Info from "./pages/InfoPage";
const RegionInspector = lazy(() => import("./learning/RegionInspector"));
const scrollPositions = new Map<string, number>();
class PageBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("Page error", error);
  }
  render() {
    return this.state.failed ? (
      <main className="empty-state">
        <h1>灵感暂时停顿了。</h1>
        <p>重新加载，继续探索。</p>
        <button
          className="button button-dark"
          onClick={() => location.reload()}
        >
          重新加载
        </button>
      </main>
    ) : (
      this.props.children
    );
  }
}
function Shell() {
  const location = useLocation(),
    navigationType = useNavigationType(),
    studio = useStudio(),
    reduced = useMotionPreference();
  const previousPath = useRef<string | null>(null);
  useLayoutEffect(() => {
    const restored =
      typeof location.state?.restoreScroll === "number"
        ? location.state.restoreScroll
        : navigationType === "POP"
          ? (scrollPositions.get(location.key) ?? 0)
          : 0;
    // Filters replace the URL on the same page without moving the viewport.
    if (!(
      previousPath.current === location.pathname && navigationType === "REPLACE"
    ))
      window.scrollTo({ top: restored, behavior: "instant" });
    previousPath.current = location.pathname;
    const remember = () => scrollPositions.set(location.key, window.scrollY);
    remember();
    window.addEventListener("scroll", remember, { passive: true });
    return () => window.removeEventListener("scroll", remember);
  }, [location.pathname, location.key, navigationType]);
  useEffect(() => {
    document.title =
      "FORM & FLOW — " +
      (location.pathname === "/"
        ? "让想法动起来"
        : location.pathname === "/works"
          ? "作品"
          : location.pathname === "/collection"
            ? "我的收藏"
            : location.pathname === "/about"
              ? "这里怎么玩"
              : "设计你的版本");
  }, [location.pathname]);
  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reduced);
  }, [reduced]);
  return (
    <>
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
      <StudioHeader />
      <div id="main-content" tabIndex={-1}>
        <PageBoundary key={location.pathname}>
          <Routes>
            <Route path="/" element={<Discover />} />
            <Route path="/works" element={<Catalog />} />
            <Route path="/works/:id" element={<Design />} />
            <Route path="/collection" element={<Shelf />} />
            <Route path="/about" element={<Info />} />
            <Route
              path="/experiment/particles"
              element={<Navigate replace to="/works/off-grid" />}
            />
            <Route
              path="/experiment/liquid"
              element={<Navigate replace to="/works/soft-signal" />}
            />
            <Route
              path="/experiment/light"
              element={<Navigate replace to="/works/form-study" />}
            />
            <Route
              path="*"
              element={
                <main className="empty-state">
                  <span className="eyebrow">404 / NOT HERE, YET.</span>
                  <h1>这个想法，还没出现。</h1>
                  <TransitionLink className="button button-dark" to="/">
                    回到发现 ↗
                  </TransitionLink>
                </main>
              }
            />
          </Routes>
        </PageBoundary>
      </div>
      <footer className="site-footer">
        <TransitionLink className="footer-brand" to="/">
          FORM & FLOW<span>®</span>
        </TransitionLink>
        <span>
          STAY CURIOUS. KEEP PLAYING.<small>© 2026 · 一个独立创意空间</small>
        </span>
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: reduced ? "instant" : "smooth",
            })
          }
          aria-label="回到顶部"
        >
          ↑
        </button>
      </footer>
      <div
        className={`toast ${studio.notification ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {studio.notification}
      </div>
      <Suspense fallback={null}>
        <RegionInspector />
      </Suspense>
    </>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
