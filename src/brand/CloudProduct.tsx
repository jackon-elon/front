import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowDown, ChevronUp } from "lucide-react";
import { RenderBoundary } from "../components/RenderBoundary";
import { cloudModes } from "./content";
import { Tabs } from "./ui";
import { CloudScene } from "./CloudScene";
import { imagingLibrary, canPreloadNearby } from "./productResources";
const ImagingLibrary = imagingLibrary.Component;
export function CloudProduct({ initialMode = 0 }: { initialMode?: 0 | 1 | 2 }) {
  const [mode, setMode] = useState<number>(initialMode);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const libraryEntry = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!libraryEntry.current || !canPreloadNearby()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void imagingLibrary.preload();
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(libraryEntry.current);
    return () => observer.disconnect();
  }, []);
  const current = cloudModes[mode];
  return (
    <section
      className="cloud-section exhibit-catalog section-pad"
      aria-labelledby="cloud-title"
    >
      <div className="center-heading wrap">
        <p className="eyebrow">影联网 · 云影像服务</p>
        <h2 id="cloud-title">
          影像相连。
          <br />
          <span className="blue-text">每一次协作，都更近。</span>
        </h2>
        <p className="section-description">
          区域影像、数字胶片与远程会诊的产品场景。
        </p>
      </div>
      <div className="showcase-switch">
        <Tabs
          labels={cloudModes.map((m) => m.name)}
          value={mode}
          onChange={setMode}
          label="云影像产品场景"
          panelId="cloud-panel"
        />
      </div>
      <div
        id="cloud-panel"
        role="tabpanel"
        aria-label={current.name}
        className="exhibit-content wrap"
      >
        <CloudScene mode={mode} />
        <div className="exhibit-caption">
          <h3>{current.title}</h3>
          <p>{current.description}</p>
          <div className="exhibit-capabilities">
            {current.nodes.map((node) => (
              <span key={node}>{node}</span>
            ))}
          </div>
        </div>
      </div>
      <section className="library-section wrap" aria-labelledby="library-title">
        <div className="library-intro">
          <div>
            <p className="eyebrow">区域资料库 · 交互体验</p>
            <h3 id="library-title">从海量资料，找到这一份。</h3>
            <p>搜索、整理，再打开影像。体验资料浏览与本页收藏。</p>
          </div>
          <button
            ref={libraryEntry}
            onPointerEnter={() => void imagingLibrary.preload()}
            onFocus={() => void imagingLibrary.preload()}
            onPointerDown={() => void imagingLibrary.preload()}
            className="button blue-button"
            aria-expanded={libraryOpen}
            aria-controls="library-content"
            onClick={() => {
              void imagingLibrary.preload();
              setLibraryOpen((value) => !value);
            }}
          >
            {libraryOpen ? "收起资料浏览" : "浏览影像资料"}
            {libraryOpen ? <ChevronUp size={18} /> : <ArrowDown size={18} />}
          </button>
        </div>
        <div id="library-content">
          {libraryOpen && (
            <RenderBoundary title="资料浏览暂时未能打开。">
              <Suspense
                fallback={
                  <div className="exhibit-loading" role="status">
                    正在打开影像资料…
                  </div>
                }
              >
                <ImagingLibrary />
              </Suspense>
            </RenderBoundary>
          )}
        </div>
      </section>
      <p className="exhibit-visual-note">
        产品界面为设计示意，不接入真实医院或患者数据。
      </p>
    </section>
  );
}
