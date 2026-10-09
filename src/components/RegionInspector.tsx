import { useEffect, useState } from "react";
import { MousePointer2, X, Copy } from "lucide-react";
import { useApp } from "../state/AppContext";
import { useLocation } from "react-router-dom";
export default function RegionInspector() {
  const [enabled, setEnabled] = useState(false);
  const [region, setRegion] = useState<{
    name: string;
    rect: DOMRect;
    selector: string;
    font: string;
  } | null>(null);
  const { toast } = useApp();
  const location = useLocation();
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "F8") {
        e.preventDefault();
        setEnabled((v) => !v);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!enabled) {
      setRegion(null);
      return;
    }
    const move = (event: PointerEvent) => {
      if ((event.target as Element).closest("[data-inspector]")) return;
      const element = (event.target as Element).closest<HTMLElement>(
        "[data-region]",
      );
      if (!element) {
        setRegion(null);
        return;
      }
      const font = getComputedStyle(
        element.querySelector("h2,h1,.metric-value") ?? element,
      ).fontSize;
      setRegion({
        name: element.dataset.region ?? "",
        rect: element.getBoundingClientRect(),
        selector: `.${element.className.split(" ")[0]}`,
        font,
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, [enabled]);
  const pages: Record<string, string> = {
    "/": "Overview",
    "/sessions": "Sessions",
    "/compare": "Compare",
    "/sources": "Sources",
  };
  const file =
    region?.selector === ".metric"
      ? "src/components/UI.tsx"
      : `src/pages/${pages[location.pathname] ?? "Overview"}.tsx`;
  const descriptor = region
    ? `修改区域：${region.name}\n组件文件：${file}\n样式文件：src/styles.css\n选择器：${region.selector}\n区域标题/数值字号：${region.font}\n我的修改要求：`
    : "";
  return (
    <>
      <button
        data-inspector
        className={`inspector-toggle ${enabled ? "active" : ""}`}
        onClick={() => setEnabled((v) => !v)}
      >
        <MousePointer2 size={14} />
        区域定位 {enabled ? "开" : "关"} · F8
      </button>
      {enabled && region && (
        <>
          <div
            className="region-outline"
            style={{
              top: region.rect.top,
              left: region.rect.left,
              width: region.rect.width,
              height: region.rect.height,
            }}
          />
          <aside data-inspector className="region-info">
            <button
              className="icon-button"
              aria-label="关闭区域定位"
              onClick={() => setEnabled(false)}
            >
              <X size={16} />
            </button>
            <span className="eyebrow">DEVELOPER INSPECTOR</span>
            <h3>{region.name}</h3>
            <code>{region.selector}</code>
            <p>
              {file}
              <br />
              src/styles.css
              <br />
              字号：{region.font}
            </p>
            <button
              className="button primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(descriptor);
                  toast("已复制区域描述，补充修改要求即可发给 AI");
                } catch {
                  toast("剪贴板不可用，请复制定位卡中的文件和选择器");
                }
              }}
            >
              <Copy size={14} />
              复制修改描述
            </button>
          </aside>
        </>
      )}
    </>
  );
}
