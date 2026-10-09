import { useId, useState } from "react";
import { ScanLine, Crosshair, ListChecks, MoveHorizontal } from "lucide-react";
import { media } from "./content";
import { Reveal } from "./ui";
export function ImagingAI({ onDetail }: { onDetail: () => void }) {
  const [reveal, setReveal] = useState(55);
  const id = useId();
  return (
    <section
      className="ai-section section-pad"
      id="ai"
      aria-labelledby="ai-title"
    >
      <Reveal className="center-heading wrap">
        <p className="eyebrow">AI 辅助诊断</p>
        <h2 id="ai-title">
          看见细节。
          <br />
          <span className="silver-text">让每一份洞察，更有依据。</span>
        </h2>
        <p className="section-description">
          让 AI 参与信息整理，让专业判断始终掌握在医生手中。
        </p>
      </Reveal>
      <Reveal className="ai-stage wrap">
        <div className="comparison-view">
          <img
            src={media.anatomy}
            alt="用于交互演示的医学影像艺术模型"
            loading="lazy"
          />
          <div
            className="comparison-overlay"
            style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
            aria-hidden="true"
          >
            <img src={media.anatomy} alt="" loading="lazy" />
            <div className="anatomy-outline outline-one" />
            <div className="anatomy-outline outline-two" />
            <div className="anatomy-label">
              <Crosshair size={16} /> 影像信息辅助标注
            </div>
            <div className="scan-axis axis-horizontal" />
            <div className="scan-axis axis-vertical" />
          </div>
          <span className="comparison-tag left">辅助标注</span>
          <span className="comparison-tag right">原始视图</span>
          <div
            className="comparison-line"
            style={{ left: `${reveal}%` }}
            aria-hidden="true"
          >
            <span>
              <MoveHorizontal size={21} />
            </span>
          </div>
          <input
            id={id}
            className="comparison-range"
            type="range"
            min="8"
            max="92"
            value={reveal}
            onChange={(e) => setReveal(Number(e.target.value))}
            aria-label="调整影像对照分界线"
            aria-valuetext={`辅助标注区域 ${reveal}%`}
          />
          <label htmlFor={id} className="comparison-hint">
            <MoveHorizontal size={15} /> 拖动分界线，探索不同视图
          </label>
        </div>
        <div className="ai-feature-list">
          {[
            {
              Icon: ScanLine,
              title: "影像辅助分析",
              text: "让关注的影像信息，以更直观的方式呈现。",
            },
            {
              Icon: ListChecks,
              title: "结构化表达",
              text: "把分散的信息整理为清晰、可复核的框架。",
            },
            {
              Icon: Crosshair,
              title: "专业判断，在医生手中",
              text: "AI 提供辅助，复核与确认由专业人员完成。",
            },
          ].map(({ Icon, title, text }) => (
            <div key={title}>
              <Icon size={25} strokeWidth={1.5} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <p className="visual-note">
          影像及标注为设计示意，不代表实际检查或临床结果。
        </p>
      </Reveal>
      <button className="dark-pill" onClick={onDetail}>
        进一步了解 AI 辅助诊断 <span>+</span>
      </button>
    </section>
  );
}
