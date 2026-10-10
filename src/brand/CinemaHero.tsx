import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  ScanLine,
  Check,
  ShieldCheck,
} from "lucide-react";
import { ImageFrame, FRAME_COUNT } from "./ImageFrame";
import { Tabs, usePresentationMotion } from "./ui";
import "./hero-workspace.css";
const previews = ["影像阅览", "报告空间", "协作路径"] as const;
const reviewSteps = ["准备检查资料", "组织报告信息", "交由专业复核"];
export function CinemaHero() {
  const [mode, setMode] = useState(0);
  const [frame, setFrame] = useState(1);
  const reduce = usePresentationMotion();
  return (
    <section className="launch-hero" id="top" aria-labelledby="launch-title">
      <div className="launch-copy wrap">
        <div>
          <p className="launch-brand">讯飞影联</p>
          <h1 id="launch-title">
            影像相连。
            <br />
            <span>专业，更近。</span>
          </h1>
          <p className="launch-subtitle">区域影像云 · 数字影像 · 智能协作</p>
        </div>
        <div className="launch-actions">
          <a href="#products">
            探索产品 <ArrowUpRight size={20} />
          </a>
        </div>
      </div>
      <div className="launch-art wrap">
        <div className="hero-workspace" aria-label="影联网产品界面预览">
          <div className="hero-workspace-bar">
            <span className="hero-window-lights" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <strong>影联网</strong>
            <span className="hero-workspace-note">产品体验 · 设计示意</span>
          </div>
          <div className="hero-workspace-body">
            <aside className="hero-workspace-sidebar" aria-hidden="true">
              <span>工作空间</span>
              <div className={mode === 0 ? "active" : ""}>
                <ScanLine size={18} /> 影像资料
              </div>
              <div className={mode === 1 ? "active" : ""}>
                <FileText size={18} /> 报告信息
              </div>
              <div className={mode === 2 ? "active" : ""}>
                <Layers size={18} /> 专业协作
              </div>
              <p>
                一份资料。
                <br />
                连接每一步。
              </p>
            </aside>
            <div className="hero-workspace-content">
              <div className="hero-workspace-toolbar">
                <span>同一份资料，连续的工作空间。</span>
                <Tabs
                  labels={previews}
                  value={mode}
                  onChange={setMode}
                  label="首屏产品预览"
                  panelId="hero-preview-panel"
                />
              </div>
              <div
                id="hero-preview-panel"
                key={mode}
                data-motion={reduce ? "off" : "on"}
                className={`hero-preview-panel hero-preview-${mode}`}
                role="tabpanel"
                aria-label={previews[mode]}
              >
                {mode === 0 ? (
                  <>
                    <div className="hero-preview-image">
                      <span>MR · 合成关节影像</span>
                      <ImageFrame
                        frame={frame}
                        label={`首屏合成影像，第 ${frame + 1} 帧`}
                      />
                      <div className="hero-frame-controls">
                        <button
                          aria-label="首屏影像上一帧"
                          disabled={frame === 0}
                          onClick={() => setFrame((v) => v - 1)}
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span>
                          {frame + 1} / {FRAME_COUNT}
                        </span>
                        <button
                          aria-label="首屏影像下一帧"
                          disabled={frame === FRAME_COUNT - 1}
                          onClick={() => setFrame((v) => v + 1)}
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="hero-preview-context">
                      <span>资料与专业，彼此相连。</span>
                      <h2>
                        从影像。
                        <br />
                        到协作。
                      </h2>
                      <p>
                        让检查资料、报告信息与专业支持，在同一个空间有序衔接。
                      </p>
                      <a href="#cloud">
                        进入影像云 <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </>
                ) : mode === 1 ? (
                  <>
                    <div className="hero-preview-document">
                      <FileText size={24} strokeWidth={1.3} />
                      <span>报告协同</span>
                      <h2>
                        有序的信息。
                        <br />
                        清晰的下一步。
                      </h2>
                      <dl>
                        <div>
                          <dt>关联资料</dt>
                          <dd>合成关节影像</dd>
                        </div>
                        <div>
                          <dt>复核路径</dt>
                          <dd>由专业医生确认</dd>
                        </div>
                      </dl>
                      <p>资料核对 → 框架组织 → 专业复核</p>
                    </div>
                    <div className="hero-preview-context">
                      <span>让信息，回到专业手中。</span>
                      <h2>
                        每一份报告。
                        <br />
                        都值得认真。
                      </h2>
                      <p>
                        组织资料，保留上下文，让协作中的每一步都有清晰的依据。
                      </p>
                      <a href="#ai">
                        探索报告协同 <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="hero-preview-process">
                      {reviewSteps.map((step, i) => (
                        <div key={step}>
                          <span>
                            {i === 2 ? (
                              <ShieldCheck size={20} />
                            ) : (
                              <Check size={20} />
                            )}
                          </span>
                          <div>
                            <small>0{i + 1}</small>
                            <strong>{step}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="hero-preview-context">
                      <span>清晰的路径。明确的责任。</span>
                      <h2>
                        连接资料。
                        <br />
                        也连接专业。
                      </h2>
                      <p>从资料准备到医生复核，让协作形成一条连续的路径。</p>
                      <a href="#agent">
                        探索医疗 Agent <ArrowUpRight size={17} />
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="#products" className="launch-down" aria-label="浏览产品亮点">
        <ChevronDown size={22} />
      </a>
    </section>
  );
}
