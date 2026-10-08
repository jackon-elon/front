import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { HashRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { useLab } from "./state/LabContext";

const Home = lazy(() => import("./pages/HomeExperience"));
const Works = lazy(() => import("./pages/WorksGallery"));
const Experiment = lazy(() => import("./pages/ExperimentPage"));
const About = lazy(() => import("./pages/AboutPage"));

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
    if (this.state.failed)
      return (
        <main className="error-page">
          <h1>空间暂时停顿了。</h1>
          <p>重新加载，继续这次探索。</p>
          <button
            className="button button-dark"
            onClick={() => location.reload()}
          >
            重新加载
          </button>
        </main>
      );
    return this.props.children;
  }
}
function Shell() {
  const { pathname } = useLocation();
  const { notification, setAppearance } = useLab();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setAppearance(pathname === "/" || pathname === "/about" ? "light" : "dark");
    const titles =
      pathname === "/"
        ? "交互实验室"
        : pathname.startsWith("/experiment")
          ? "开始实验"
          : pathname === "/works"
            ? "作品"
            : pathname === "/about"
              ? "关于实验室"
              : "页面未找到";
    document.title = "FORM & FLOW — " + titles;
  }, [pathname, setAppearance]);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus({ preventScroll: true });
          main?.scrollIntoView({ block: "start", behavior: "instant" });
        }}
      >
        跳到主要内容
      </a>
      <Header />
      <div id="main-content" tabIndex={-1}>
        <PageBoundary key={pathname}>
          <Suspense
            fallback={
              <div className="page-loading" role="status">
                正在进入空间
                <span className="loading-dot" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/works" element={<Works />} />
              <Route path="/experiment/:kind" element={<Experiment />} />
              <Route path="/about" element={<About />} />
              <Route
                path="*"
                element={
                  <main className="error-page">
                    <span className="eyebrow">404 / OUTSIDE THE SPACE</span>
                    <h1>这里还没有形态。</h1>
                    <Link className="button button-dark" to="/">
                      回到空间 ↗
                    </Link>
                  </main>
                }
              />
            </Routes>
          </Suspense>
        </PageBoundary>
      </div>
      <div
        className={"toast " + (notification ? "visible" : "")}
        role="status"
        aria-live="polite"
      >
        {notification}
      </div>
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
