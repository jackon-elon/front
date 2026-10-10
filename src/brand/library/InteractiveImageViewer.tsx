import {
  useEffect,
  useId,
  useReducer,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Download,
  Hand,
  Redo2,
  RotateCcw,
  Scan,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { ImageFrame } from "../ImageFrame";
import {
  annotationsReducer,
  clamp,
  constrain,
  imagePoint,
  initialHistory,
  initialView,
  zoomAt,
  type Annotation,
  type AnnotationAction,
  type Point,
  type View,
} from "./viewerModel";
import "./viewer.css";

type Gesture =
  | { type: "pan"; anchor: Point; view: View }
  | { type: "pinch"; center: Point; distance: number; view: View }
  | { type: "mark"; from: Point };
const midpoint = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export function InteractiveImageViewer({
  frame,
  recordId,
}: {
  frame: number;
  recordId: string;
}) {
  const helpId = useId();
  const stage = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(initialView);
  const currentView = useRef(view);
  const [tool, setTool] = useState<"pan" | "mark">("pan");
  const [history, dispatch] = useReducer(annotationsReducer, initialHistory);
  const [draft, setDraft] = useState<Omit<Annotation, "id" | "frame"> | null>(
    null,
  );
  const draftRef = useRef(draft);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<Gesture | null>(null);
  const tick = useRef(0);
  const nextId = useRef(0);
  const [notice, setNotice] = useState("");
  const marks = history.present.filter((mark) => mark.frame === frame);
  const update = (next: View) => {
    currentView.current = next;
    if (!tick.current)
      tick.current = requestAnimationFrame(() => {
        tick.current = 0;
        setView(currentView.current);
      });
  };
  const changeDraft = (next: typeof draft) => {
    draftRef.current = next;
    setDraft(next);
  };
  const cancelGesture = () => {
    const captured = [...pointers.current.keys()];
    pointers.current.clear();
    gesture.current = null;
    changeDraft(null);
    for (const id of captured) {
      if (stage.current?.hasPointerCapture(id))
        stage.current.releasePointerCapture(id);
    }
  };
  const applyHistory = (action: AnnotationAction) => {
    cancelGesture();
    dispatch(action);
  };
  const localPoint = (clientX: number, clientY: number): Point => {
    const rect = stage.current!.getBoundingClientRect();
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  };
  const normalizedImage = (point: Point) => {
    const image = imagePoint(currentView.current, point);
    return { x: clamp(image.x, 0, 1), y: clamp(image.y, 0, 1) };
  };
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      if (pointers.current.size) return;
      const rect = element.getBoundingClientRect();
      const delta =
        event.deltaY *
        (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1);
      currentView.current = zoomAt(
        currentView.current,
        currentView.current.scale * Math.exp(-delta * 0.002),
        {
          x: (event.clientX - rect.left) / rect.width,
          y: (event.clientY - rect.top) / rect.height,
        },
      );
      if (!tick.current)
        tick.current = requestAnimationFrame(() => {
          tick.current = 0;
          setView(currentView.current);
        });
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", wheel);
      cancelAnimationFrame(tick.current);
      tick.current = 0;
      pointers.current.clear();
      gesture.current = null;
    };
  }, []);
  // A frame switch cancels incomplete annotations but keeps the viewport and
  // history. Completed marks belong to their original frame.
  useEffect(() => {
    pointers.current.clear();
    gesture.current = null;
    draftRef.current = null;
    setDraft(null);
  }, [frame]);

  const beginPan = () => {
    const point = [...pointers.current.values()][0];
    gesture.current = point
      ? { type: "pan", anchor: point, view: currentView.current }
      : null;
  };
  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || pointers.current.size >= 2) return;
    stage.current?.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = localPoint(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 2) {
      changeDraft(null);
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        type: "pinch",
        center: midpoint(a, b),
        distance: Math.max(distance(a, b), 0.001),
        view: currentView.current,
      };
    } else if (tool === "mark") {
      const from = normalizedImage(point);
      gesture.current = { type: "mark", from };
      changeDraft({ from, to: from });
    } else beginPan();
  };
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = localPoint(event.clientX, event.clientY);
    pointers.current.set(event.pointerId, point);
    const active = gesture.current;
    if (active?.type === "pan")
      update(
        constrain({
          scale: active.view.scale,
          pan: {
            x: active.view.pan.x + point.x - active.anchor.x,
            y: active.view.pan.y + point.y - active.anchor.y,
          },
        }),
      );
    else if (active?.type === "mark")
      changeDraft({ from: active.from, to: normalizedImage(point) });
    else if (active?.type === "pinch" && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      update(
        zoomAt(
          active.view,
          (active.view.scale * distance(a, b)) / active.distance,
          active.center,
          midpoint(a, b),
        ),
      );
    }
  };
  const finish = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    move(event);
    const mark = draftRef.current;
    if (
      gesture.current?.type === "mark" &&
      mark &&
      Math.abs(mark.to.x - mark.from.x) > 0.015 &&
      Math.abs(mark.to.y - mark.from.y) > 0.015
    ) {
      dispatch({
        type: "add",
        annotation: { ...mark, id: `${recordId}-${++nextId.current}`, frame },
      });
      setNotice("标注已添加，可撤销或导出。");
    }
    pointers.current.delete(event.pointerId);
    changeDraft(null);
    beginPan();
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const exportMarks = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            schema: "imaging-concept-annotations/v1",
            recordId,
            synthetic: true,
            coordinateSpace: "normalized-image",
            annotations: history.present,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${recordId}-annotations.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`已导出 ${history.present.length} 个示意标注。`);
  };
  return (
    <div className="interactive-viewer">
      <div className="viewer-toolbar" role="toolbar" aria-label="影像查看工具">
        <div className="viewer-tool-group">
          <button
            aria-label="拖拽影像"
            aria-pressed={tool === "pan"}
            onClick={() => {
              cancelGesture();
              setTool("pan");
            }}
          >
            <Hand size={18} />
            <span>移动</span>
          </button>
          <button
            aria-label="框选标注"
            aria-pressed={tool === "mark"}
            onClick={() => {
              cancelGesture();
              setTool("mark");
            }}
          >
            <Scan size={18} />
            <span>标注</span>
          </button>
        </div>
        <div className="viewer-tool-group">
          <button
            aria-label="缩小影像"
            disabled={view.scale <= 1}
            onClick={() =>
              update(
                zoomAt(currentView.current, currentView.current.scale - 0.25, {
                  x: 0.5,
                  y: 0.5,
                }),
              )
            }
          >
            <ZoomOut size={18} />
          </button>
          <output aria-label="影像缩放比例">
            {Math.round(view.scale * 100)}%
          </output>
          <button
            aria-label="放大影像"
            disabled={view.scale >= 4}
            onClick={() =>
              update(
                zoomAt(currentView.current, currentView.current.scale + 0.25, {
                  x: 0.5,
                  y: 0.5,
                }),
              )
            }
          >
            <ZoomIn size={18} />
          </button>
          <button
            aria-label="复位影像视图"
            onClick={() => {
              cancelGesture();
              update(initialView);
            }}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>
      <div
        ref={stage}
        className={`viewer-stage tool-${tool}`}
        tabIndex={0}
        role="group"
        aria-label="交互影像画布"
        aria-describedby={helpId}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={finish}
        onPointerCancel={cancelGesture}
        onLostPointerCapture={(event) => {
          if (pointers.current.has(event.pointerId)) cancelGesture();
        }}
        onKeyDown={(event) => {
          const shortcut = event.ctrlKey || event.metaKey;
          if (event.key === "Escape" && gesture.current) {
            event.preventDefault();
            event.stopPropagation();
            cancelGesture();
          } else if (shortcut && event.key.toLowerCase() === "z") {
            event.preventDefault();
            applyHistory({ type: event.shiftKey ? "redo" : "undo" });
          } else if (
            event.key === "+" ||
            event.key === "=" ||
            event.key === "-"
          ) {
            event.preventDefault();
            update(
              zoomAt(
                currentView.current,
                currentView.current.scale + (event.key === "-" ? -0.25 : 0.25),
                { x: 0.5, y: 0.5 },
              ),
            );
          } else if (event.key.startsWith("Arrow")) {
            event.preventDefault();
            event.stopPropagation();
            const amount = event.shiftKey ? 0.12 : 0.04;
            update(
              constrain({
                ...currentView.current,
                pan: {
                  x:
                    currentView.current.pan.x +
                    (event.key === "ArrowLeft"
                      ? amount
                      : event.key === "ArrowRight"
                        ? -amount
                        : 0),
                  y:
                    currentView.current.pan.y +
                    (event.key === "ArrowUp"
                      ? amount
                      : event.key === "ArrowDown"
                        ? -amount
                        : 0),
                },
              }),
            );
          }
        }}
      >
        <div
          className="viewer-image-plane"
          style={{
            transform: `translate(${view.pan.x * 100}%, ${view.pan.y * 100}%) scale(${view.scale})`,
          }}
        >
          <ImageFrame
            frame={frame}
            label={`合成关节影像，第 ${frame + 1} 帧`}
          />
          <svg viewBox="0 0 1000 1000" aria-hidden="true">
            {[
              ...marks,
              ...(draft ? [{ ...draft, id: "draft", frame }] : []),
            ].map((mark, i) => (
              <g
                key={mark.id}
                className={
                  mark.id === "draft" ? "annotation-draft" : "annotation"
                }
              >
                <rect
                  x={Math.min(mark.from.x, mark.to.x) * 1000}
                  y={Math.min(mark.from.y, mark.to.y) * 1000}
                  width={Math.abs(mark.to.x - mark.from.x) * 1000}
                  height={Math.abs(mark.to.y - mark.from.y) * 1000}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={Math.min(mark.from.x, mark.to.x) * 1000 + 10}
                  y={Math.min(mark.from.y, mark.to.y) * 1000 + 40}
                >
                  {i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <span className="viewer-corner-label">合成影像 · 非临床资料</span>
        <span className="viewer-mark-count">{marks.length} 个标注</span>
      </div>
      <div className="viewer-history" role="toolbar" aria-label="标注操作">
        <button
          aria-label="撤销标注"
          disabled={!history.past.length}
          onClick={() => applyHistory({ type: "undo" })}
        >
          <Undo2 size={17} />
          撤销
        </button>
        <button
          aria-label="重做标注"
          disabled={!history.future.length}
          onClick={() => applyHistory({ type: "redo" })}
        >
          <Redo2 size={17} />
          重做
        </button>
        <button
          aria-label="清除当前帧标注"
          disabled={!marks.length}
          onClick={() => applyHistory({ type: "clear", frame })}
        >
          <Trash2 size={17} />
          清除
        </button>
        <button
          aria-label="导出示意标注"
          disabled={!history.present.length}
          onClick={exportMarks}
        >
          <Download size={17} />
          导出
        </button>
      </div>
      <p className="viewer-help" id={helpId}>
        滚轮缩放，拖拽移动；双指可缩放。框选标注仅用于交互演示。
      </p>
      <span className="sr-only" role="status">
        {notice}
      </span>
    </div>
  );
}
