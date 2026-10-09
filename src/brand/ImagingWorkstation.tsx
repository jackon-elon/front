import { useId, useState } from "react";
import {
  Check,
  FileText,
  ShieldCheck,
  Layers,
  ChevronLeft,
  ChevronRight,
  Link2,
  Unlink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";
import { ImageFrame } from "./ImageFrame";
import { aiModes } from "./content";
import { usePresentationMotion } from "./ui";

function QualityScene() {
  const [frame, setFrame] = useState(0);
  const [reviewed, setReviewed] = useState<number[]>([]);
  const complete = reviewed.includes(frame);
  return (
    <div className="quality-layout">
      <div className="quality-images">
        <div className="workspace-study">
          <span>MR · 关节影像</span>
          <span>六帧合成资料</span>
        </div>
        <div className="quality-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <button
              key={i}
              aria-label={`查看第${i + 1}帧资料`}
              aria-pressed={frame === i}
              onClick={() => setFrame(i)}
            >
              <ImageFrame frame={i} />
              <span>0{i + 1}</span>
              {reviewed.includes(i) && (
                <Check className="frame-reviewed" size={17} />
              )}
            </button>
          ))}
        </div>
        <p className="workspace-footnote">
          <Layers size={15} />
          选择一帧，核对资料与复核状态。
        </p>
      </div>
      <aside className="quality-review">
        <span className="scene-overline">资料质量 · 复核示意</span>
        <h3>
          每一帧。
          <br />
          都有据可查。
        </h3>
        <p>
          当前选择 <b>第 {frame + 1} 帧</b>
        </p>
        <div className="quality-checklist">
          <div>
            <Check size={18} />
            <span>
              影像资料<strong>合成图集 · MR</strong>
            </span>
          </div>
          <div>
            <FileText size={18} />
            <span>
              序列标签<strong>演示标签，待实际资料补充</strong>
            </span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>
              人工复核
              <strong>
                {complete ? "本帧已标记复核" : "等待专业人员确认"}
              </strong>
            </span>
          </div>
        </div>
        <button
          className="scene-primary"
          aria-pressed={complete}
          onClick={() =>
            setReviewed((list) =>
              list.includes(frame)
                ? list.filter((i) => i !== frame)
                : [...list, frame],
            )
          }
        >
          {complete ? "撤销本帧复核标记" : "标记本帧已复核"}
        </button>
        <p role="status" className="quality-status">
          {complete
            ? `第 ${frame + 1} 帧已标记。`
            : "未执行自动质控或诊断分析。"}
        </p>
      </aside>
    </div>
  );
}

function ReportScene() {
  const [frame, setFrame] = useState(2);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);
  const draftId = useId();
  return (
    <div className="report-layout">
      <div className="report-reference">
        <div className="workspace-study">
          <span>影像参考</span>
          <span>MR</span>
        </div>
        <ImageFrame frame={frame} />
        <div className="report-thumbnails">
          {Array.from({ length: 6 }, (_, i) => (
            <button
              key={i}
              aria-label={`选择报告参考第${i + 1}帧`}
              aria-pressed={frame === i}
              onClick={() => setFrame(i)}
            >
              <ImageFrame frame={i} />
            </button>
          ))}
        </div>
        <p>资料与草稿，并排查看。</p>
      </div>
      <div className="report-paper">
        <div className="report-paper-heading">
          <span>
            <FileText size={22} />
            结构化报告
          </span>
          <span>协作草稿</span>
        </div>
        <h3>
          从影像资料，
          <br />
          到清晰的报告框架。
        </h3>
        <dl className="report-metadata">
          <div>
            <dt>检查方式</dt>
            <dd>MR</dd>
          </div>
          <div>
            <dt>资料来源</dt>
            <dd>合成展示图集</dd>
          </div>
          <div>
            <dt>专业结论</dt>
            <dd>待医生填写与复核</dd>
          </div>
        </dl>
        <label htmlFor={draftId}>报告协作草稿</label>
        <textarea
          id={draftId}
          value={draft}
          placeholder="在这里整理资料摘要与协作事项…"
          onChange={(e) => {
            setDraft(e.target.value);
            setSaved(false);
          }}
        />
        <div className="report-actions">
          <button
            className="scene-secondary"
            onClick={() => {
              setDraft(
                "MR · 关节影像\n资料：六帧合成影像，用于界面展示。\n影像所见与结论：待专业医生填写和复核。",
              );
              setSaved(false);
            }}
          >
            插入资料摘要
          </button>
          <button
            className="scene-primary"
            disabled={!draft.trim()}
            onClick={() => setSaved(true)}
          >
            保存演示草稿
          </button>
        </div>
        <p role="status">
          {saved
            ? "草稿已保留在本页，切换功能后可继续编辑。"
            : "仅用于界面演示，不生成诊断结论。"}
        </p>
      </div>
    </div>
  );
}

function ComparisonScene() {
  const [frames, setFrames] = useState<[number, number]>([1, 4]);
  const [linked, setLinked] = useState(true);
  const [zoom, setZoom] = useState(1);
  const canStep = (pane: number, delta: number) =>
    linked
      ? frames.every((f) => f + delta >= 0 && f + delta < 6)
      : frames[pane] + delta >= 0 && frames[pane] + delta < 6;
  const step = (pane: number, delta: number) => {
    if (canStep(pane, delta))
      setFrames((previous) =>
        linked
          ? [previous[0] + delta, previous[1] + delta]
          : pane === 0
            ? [previous[0] + delta, previous[1]]
            : [previous[0], previous[1] + delta],
      );
  };
  return (
    <div className="comparison-layout">
      <div className="comparison-toolbar">
        <span>
          两份资料。<b>同一个视野。</b>
        </span>
        <div>
          <button aria-pressed={linked} onClick={() => setLinked(!linked)}>
            {linked ? <Link2 size={17} /> : <Unlink size={17} />}
            <span>{linked ? "联动浏览" : "独立浏览"}</span>
          </button>
          <button
            aria-label="缩小影像"
            disabled={zoom === 1}
            onClick={() => setZoom((value) => Math.max(1, value - 0.25))}
          >
            <ZoomOut size={18} />
          </button>
          <span className="comparison-zoom" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button
            aria-label="放大影像"
            disabled={zoom === 2}
            onClick={() => setZoom((value) => Math.min(2, value + 0.25))}
          >
            <ZoomIn size={18} />
          </button>
          <button
            aria-label="复位影像对照"
            onClick={() => {
              setFrames([1, 4]);
              setZoom(1);
              setLinked(true);
            }}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div className="comparison-panes">
        {frames.map((frame, pane) => (
          <div className="comparison-pane" key={pane}>
            <div className="workspace-study">
              <span>{pane === 0 ? "参考资料" : "当前资料"}</span>
              <span>MR · 合成示意</span>
            </div>
            <div className="comparison-image">
              <div style={{ transform: `scale(${zoom})` }}>
                <ImageFrame frame={frame} />
              </div>
            </div>
            <div className="comparison-frame-controls">
              <span>第 {frame + 1} / 6 帧</span>
              <div>
                <button
                  aria-label={`${pane === 0 ? "参考" : "当前"}资料上一帧`}
                  disabled={!canStep(pane, -1)}
                  onClick={() => step(pane, -1)}
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  aria-label={`${pane === 0 ? "参考" : "当前"}资料下一帧`}
                  disabled={!canStep(pane, 1)}
                  onClick={() => step(pane, 1)}
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="workspace-footnote">
        <Layers size={15} />
        可以联动翻帧、独立查看与缩放。演示使用同一份合成图集。
      </p>
    </div>
  );
}

export function ImagingWorkstation({ mode = 0 }: { mode?: number }) {
  const reduce = usePresentationMotion();
  return (
    <div
      className="ai-workspace"
      data-motion={reduce ? "off" : "on"}
      data-scene={mode === 0 ? "quality" : mode === 1 ? "report" : "comparison"}
      aria-label={`${aiModes[mode].name}界面设计示意`}
    >
      <div className="scene-console-bar">
        <span>
          <Layers size={17} />
          影联网 <b>影像智能</b>
        </span>
        <small>交互设计示意</small>
      </div>
      <div hidden={mode !== 0}>
        <QualityScene />
      </div>
      <div hidden={mode !== 1}>
        <ReportScene />
      </div>
      <div hidden={mode !== 2}>
        <ComparisonScene />
      </div>
    </div>
  );
}
