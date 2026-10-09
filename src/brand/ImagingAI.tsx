import { useId, useState } from "react";
import {
  ScanLine,
  Crosshair,
  ListChecks,
  MoveHorizontal,
  RotateCcw,
} from "lucide-react";
import { Reveal } from "./ui";
import { RadiologyFilm, FRAME_COUNT, frameStyle } from "./RadiologyFilm";
export function ImagingAI() {
  const [reveal, setReveal] = useState(55);
  const [frame, setFrame] = useState(2);
  const [windowWidth, setWindowWidth] = useState(190);
  const [windowLevel, setWindowLevel] = useState(112);
  const id = useId();
  return (
    <section
      className="ai-section section-pad"
      id="ai-exhibit"
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
          <RadiologyFilm
            frame={frame}
            label={`关节 MR 合成影像，第 ${frame + 1} 帧`}
          />
          <div
            className="comparison-overlay"
            style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
            aria-hidden="true"
          >
            <RadiologyFilm
              frame={frame}
              windowing={{ width: windowWidth, level: windowLevel }}
            />
          </div>
          <span className="comparison-tag left">灰度调整</span>
          <span className="comparison-tag right">原始影像</span>
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
            aria-valuetext={`灰度调整区域 ${reveal}%`}
          />
          <label htmlFor={id} className="comparison-hint">
            <MoveHorizontal size={15} /> 拖动分界线，探索不同视图
          </label>
        </div>
        <div className="reading-controls">
          <div className="reading-controls-heading">
            <div>
              <span>影像序列</span>
              <strong>关节 MR · 六帧设计示意</strong>
            </div>
            <button
              onClick={() => {
                setFrame(2);
                setWindowWidth(190);
                setWindowLevel(112);
                setReveal(55);
              }}
            >
              <RotateCcw size={15} /> 重置视图
            </button>
          </div>
          <div className="filmstrip" aria-label="选择影像帧">
            {Array.from({ length: FRAME_COUNT }, (_, i) => (
              <button
                key={i}
                aria-label={`查看第 ${i + 1} 帧影像`}
                aria-pressed={frame === i}
                onClick={() => setFrame(i)}
              >
                <span className="filmstrip-image" style={frameStyle(i)} />
                <span>0{i + 1}</span>
              </button>
            ))}
          </div>
          <div className="reading-sliders">
            <label htmlFor={`${id}-frame`}>
              <span>
                影像帧{" "}
                <output>
                  {frame + 1} / {FRAME_COUNT}
                </output>
              </span>
              <input
                id={`${id}-frame`}
                type="range"
                min="0"
                max={FRAME_COUNT - 1}
                value={frame}
                onChange={(e) => setFrame(Number(e.target.value))}
                aria-label="切换影像帧"
                aria-valuetext={`第 ${frame + 1} 帧，共 ${FRAME_COUNT} 帧`}
              />
            </label>
            <label htmlFor={`${id}-width`}>
              <span>
                窗宽 <output>{windowWidth}</output>
              </span>
              <input
                id={`${id}-width`}
                type="range"
                min="64"
                max="384"
                value={windowWidth}
                onChange={(e) => setWindowWidth(Number(e.target.value))}
                aria-label="调整窗宽"
              />
            </label>
            <label htmlFor={`${id}-level`}>
              <span>
                窗位 <output>{windowLevel}</output>
              </span>
              <input
                id={`${id}-level`}
                type="range"
                min="64"
                max="192"
                value={windowLevel}
                onChange={(e) => setWindowLevel(Number(e.target.value))}
                aria-label="调整窗位"
              />
            </label>
          </div>
          <p className="reading-note">
            拖动影像分界线，对照灰度变化。这里演示合成图片的阅片交互，数值不代表临床参数。
          </p>
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
          关节影像为生成的展示素材。窗宽窗位是对 8 位图片的灰度映射，不是 DICOM
          诊断或 AI 推理。
        </p>
      </Reveal>
    </section>
  );
}
