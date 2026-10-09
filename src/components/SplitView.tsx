import { useRef, useState, type ReactNode, type CSSProperties } from "react";
import { readSetting, saveSetting } from "../lib/storage";

export function SplitView({ children }: { children: [ReactNode, ReactNode] }) {
  const container = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => {
    const saved = Number(readSetting("pane-ratio", 60));
    return Number.isFinite(saved) ? Math.max(40, Math.min(70, saved)) : 60;
  });
  const dragging = useRef(false);
  const change = (next: number) => {
    const value = Math.max(40, Math.min(70, next));
    setRatio(value);
    try {
      saveSetting("pane-ratio", value);
    } catch {
      /* layout remains usable without persistence */
    }
  };
  return (
    <div
      ref={container}
      className="workbench-grid"
      style={{ "--pane-ratio": `${ratio}%` } as CSSProperties}
    >
      {children[0]}
      <div
        role="separator"
        tabIndex={0}
        aria-label="调整请求与会话面板宽度"
        aria-orientation="vertical"
        aria-valuemin={40}
        aria-valuemax={70}
        aria-valuenow={Math.round(ratio)}
        className="pane-handle"
        onDoubleClick={() => change(60)}
        onKeyDown={(e) => {
          if (["ArrowLeft", "ArrowRight", "Home"].includes(e.key)) {
            e.preventDefault();
            change(
              e.key === "Home" ? 60 : ratio + (e.key === "ArrowRight" ? 2 : -2),
            );
          }
        }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!dragging.current || !container.current) return;
          const box = container.current.getBoundingClientRect();
          change(((e.clientX - box.left) / box.width) * 100);
        }}
        onPointerUp={(e) => {
          dragging.current = false;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onLostPointerCapture={() => {
          dragging.current = false;
        }}
      >
        <i />
      </div>
      {children[1]}
    </div>
  );
}
