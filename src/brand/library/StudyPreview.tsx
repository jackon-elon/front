import { Profiler, useState } from "react";
import { diagnosticsEnabled, profileRender } from "../../performance";
import { Bookmark, ChevronLeft, ChevronRight } from "lucide-react";
import { FRAME_COUNT } from "../ImageFrame";
import { InteractiveImageViewer } from "./InteractiveImageViewer";
import type { Study } from "./catalog";

export function StudyPreview({
  study,
  bookmarked,
  onBookmark,
}: {
  study: Study;
  bookmarked: boolean;
  onBookmark: (id: string) => void;
}) {
  // Frame changes stay in this viewer and never update the virtualized list.
  const [frame, setFrame] = useState(study.frame);
  return (
    <section className="study-preview" aria-label={`资料预览 ${study.id}`}>
      <header>
        <div>
          <span className="eyebrow">影像预览</span>
          <h4>{study.title}</h4>
        </div>
        <button
          className="library-icon-button"
          aria-label={bookmarked ? "取消收藏当前资料" : "收藏当前资料"}
          aria-pressed={bookmarked}
          onClick={() => onBookmark(study.id)}
        >
          <Bookmark size={21} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </header>
      {diagnosticsEnabled ? (
        <Profiler id="ImageViewer" onRender={profileRender}>
          <InteractiveImageViewer frame={frame} recordId={study.id} />
        </Profiler>
      ) : (
        <InteractiveImageViewer frame={frame} recordId={study.id} />
      )}
      <div className="study-frame-controls">
        <button
          className="library-icon-button"
          aria-label="上一帧资料影像"
          disabled={frame === 0}
          onClick={() => setFrame((value) => value - 1)}
        >
          <ChevronLeft size={21} />
        </button>
        <span aria-live="polite">
          第 {frame + 1} / {FRAME_COUNT} 帧
        </span>
        <button
          className="library-icon-button"
          aria-label="下一帧资料影像"
          disabled={frame === FRAME_COUNT - 1}
          onClick={() => setFrame((value) => value + 1)}
        >
          <ChevronRight size={21} />
        </button>
      </div>
      <dl className="study-metadata">
        <div>
          <dt>资料编号</dt>
          <dd>{study.id}</dd>
        </div>
        <div>
          <dt>所属分组</dt>
          <dd>{study.group}</dd>
        </div>
        <div>
          <dt>示意时间</dt>
          <dd>{study.dateLabel}</dd>
        </div>
      </dl>
    </section>
  );
}
