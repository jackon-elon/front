import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useStudio } from "../state/StudioContext";
import { getRegionSource, regions } from "./regions";
import "./inspector.css";

interface Selection {
  title: string;
  selector: string;
  source: string;
  note: string;
  rect: { left: number; top: number; width: number; height: number };
  element?: Element;
  font?: string;
  fontSize?: string;
  lineHeight?: string;
}
export default function RegionInspector() {
  const { pathname } = useLocation();
  const { notify } = useStudio();
  const [enabled, setEnabled] = useState(() => {
    try {
      const saved = sessionStorage.getItem("form-flow:inspect");
      return saved === "on" || (saved !== "off" && import.meta.env.DEV);
    } catch {
      return import.meta.env.DEV;
    }
  });
  const [pinned, setPinned] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [point, setPoint] = useState({ x: 20, y: 100 });
  const [viewport, setViewport] = useState({
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  });
  const current = useRef<Selection | null>(null);
  useEffect(() => {
    if (!enabled || !pinned) return;
    const refresh = () => {
      const value = current.current;
      if (!value?.element?.isConnected) {
        setPinned(false);
        setSelection(null);
        current.current = null;
        return;
      }
      const rect = value.element.getBoundingClientRect();
      const style = getComputedStyle(value.element);
      const next = {
        ...value,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        font: style.fontFamily,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
      current.current = next;
      setSelection(next);
    };
    window.addEventListener("scroll", refresh, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", refresh);
    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
    };
  }, [enabled, pinned]);
  useEffect(() => {
    setPinned(false);
    setSelection(null);
    current.current = null;
  }, [pathname]);
  useEffect(() => {
    try {
      sessionStorage.setItem("form-flow:inspect", enabled ? "on" : "off");
    } catch {
      /* session-only */
    }
    if (!enabled) {
      setSelection(null);
      current.current = null;
      setPinned(false);
    }
  }, [enabled]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPinned(false);
      if (event.altKey && event.code === "KeyL") {
        event.preventDefault();
        setEnabled((value) => !value);
      }
    };
    window.addEventListener("keydown", key);
    const resize = () =>
      setViewport({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (!enabled || pinned) return;
    let frame = 0;
    let dirty = true;
    let pointer = { x: -1, y: -1 };
    let candidates: { region: (typeof regions)[number]; element: Element }[] =
      [];
    const scan = () => {
      candidates = regions.flatMap((region) =>
        [...document.querySelectorAll(region.selector)].map((element) => ({
          region,
          element,
        })),
      );
      dirty = false;
    };
    const update = () => {
      frame = 0;
      const { x, y } = pointer;
      if (x < 0 || y < 0) return;
      if (dirty) scan();
      const under = document.elementFromPoint(x, y);
      if (under?.closest("[data-inspector-ui]")) return;
      const modal = document.querySelector(".modal");
      const match = (fallback: boolean): Selection | null => {
        for (const { region, element } of candidates) {
          if (
            !!region.fallback !== fallback ||
            !element.isConnected ||
            (modal && !modal.contains(element))
          )
            continue;
          const rect = element.getBoundingClientRect();
          if (
            !rect.width ||
            !rect.height ||
            x < rect.left ||
            x > rect.right ||
            y < rect.top ||
            y > rect.bottom
          )
            continue;
          const style = getComputedStyle(element);
          if (style.visibility === "hidden" || style.display === "none")
            continue;
          return {
            ...region,
            element,
            source: getRegionSource(region, element),
            rect: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
            },
            font: style.fontFamily,
            fontSize: style.fontSize,
            lineHeight: style.lineHeight,
          };
        }
        return null;
      };
      const hit = match(false) ?? match(true);
      current.current = hit;
      setSelection(hit);
      setPoint(pointer);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const move = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const leave = () => {
      pointer = { x: -1, y: -1 };
      current.current = null;
      setSelection(null);
    };
    const pin = (event: MouseEvent) => {
      if (
        !event.altKey ||
        (event.target as Element).closest("[data-inspector-ui]")
      )
        return;
      pointer = { x: event.clientX, y: event.clientY };
      update();
      if (!current.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setPinned(true);
    };
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            !(
              record.target instanceof Element &&
              record.target.closest("[data-inspector-ui]")
            ),
        )
      ) {
        dirty = true;
        schedule();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", schedule, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", schedule);
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("click", pin, true);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("click", pin, true);
    };
  }, [enabled, pinned, pathname]);
  const copy = async () => {
    if (!selection) return;
    const text =
      "请修改「" +
      selection.title +
      "」。\n对应文件：" +
      selection.source +
      "\n" +
      selection.selector +
      "\n" +
      selection.note +
      (selection.fontSize ? "\n当前字号：" + selection.fontSize : "") +
      "\n我想要的变化：";
    try {
      await navigator.clipboard.writeText(text);
      notify("区域定位已复制，可以粘贴给 AI");
    } catch {
      notify("浏览器未允许复制，可直接使用面板中的区域名称");
    }
  };
  const cardWidth = Math.min(350, viewport.width - 24);
  const left = pinned
    ? Math.max(12, viewport.width - cardWidth - 18)
    : Math.max(12, Math.min(point.x + 18, viewport.width - cardWidth - 12));
  const top = pinned
    ? 96
    : Math.max(12, Math.min(point.y + 20, viewport.height - 270));
  const outline = selection
    ? {
        left: Math.max(0, selection.rect.left),
        top: Math.max(0, selection.rect.top),
        width: Math.max(
          0,
          Math.min(viewport.width, selection.rect.left + selection.rect.width) -
            Math.max(0, selection.rect.left),
        ),
        height: Math.max(
          0,
          Math.min(
            viewport.height,
            selection.rect.top + selection.rect.height,
          ) - Math.max(0, selection.rect.top),
        ),
      }
    : undefined;
  return createPortal(
    <>
      <div className="region-inspector-toolbar" data-inspector-ui>
        <button
          className={enabled ? "is-on" : ""}
          aria-pressed={enabled}
          onClick={() => setEnabled((value) => !value)}
        >
          ◉ 区域定位{enabled ? " · 开" : ""}
        </button>
        {enabled && (
          <>
            <button
              disabled={!selection}
              onClick={() => setPinned((value) => !value)}
            >
              {pinned ? "继续跟随" : "固定当前"}
            </button>
            <button disabled={!selection} onClick={copy}>
              复制定位
            </button>
          </>
        )}
      </div>
      {enabled && !selection && (
        <div className="region-inspector-hint" data-inspector-ui>
          移动鼠标查看区域 · Alt+L 开关 · Alt+点击固定
        </div>
      )}
      {enabled && selection && (
        <>
          <div
            data-inspector-ui
            className="region-inspector-outline"
            style={outline}
          />
          <aside
            data-inspector-ui
            className={"region-inspector-card " + (pinned ? "is-pinned" : "")}
            aria-label="区域定位信息"
            style={{ left, top, width: cardWidth }}
          >
            <div className="region-inspector-card__heading">
              <span>{pinned ? "已固定区域" : "鼠标所在区域"}</span>
              {pinned && (
                <button
                  aria-label="取消固定区域"
                  onClick={() => setPinned(false)}
                >
                  ×
                </button>
              )}
            </div>
            <h2>{selection.title}</h2>
            <code>{selection.selector}</code>
            <p className="region-inspector-source">{selection.source}</p>
            <p>{selection.note}</p>
            {selection.fontSize && (
              <div className="region-inspector-metrics">
                字号 {selection.fontSize} · 行高 {selection.lineHeight}
                <span>字体列表：{selection.font}</span>
              </div>
            )}
            <div className="region-inspector-size">
              {Math.round(selection.rect.width)} ×{" "}
              {Math.round(selection.rect.height)} px{" "}
              {selection.fontSize
                ? "· 样式在 src/styles.css"
                : "· 页面元素范围"}
            </div>
            <small>
              {pinned
                ? "点击“复制定位”后，粘贴给 AI 并补充想改什么。"
                : "Alt+点击固定；正常点击仍操作网页。"}
            </small>
          </aside>
        </>
      )}
    </>,
    document.body,
  );
}
