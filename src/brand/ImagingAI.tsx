import { useState } from "react";
import { aiModes } from "./content";
import { Tabs } from "./ui";
import { ImagingWorkstation } from "./ImagingWorkstation";
export function ImagingAI() {
  const [mode, setMode] = useState(0);
  const current = aiModes[mode];
  return (
    <section
      className="ai-section exhibit-catalog section-pad"
      aria-labelledby="ai-title"
    >
      <div className="center-heading wrap">
        <p className="eyebrow">医学影像 AI</p>
        <h2 id="ai-title">
          让信息更清晰。
          <br />
          <span>让判断更从容。</span>
        </h2>
        <p className="section-description">
          点击切换场景，直接了解辅助工作的路径。
        </p>
      </div>
      <div className="showcase-switch">
        <Tabs
          labels={aiModes.map((m) => m.name)}
          value={mode}
          onChange={setMode}
          label="影像智能功能"
          panelId="ai-panel"
        />
      </div>
      <div
        id="ai-panel"
        className="wrap"
        role="tabpanel"
        aria-label={current.name}
      >
        <ImagingWorkstation mode={mode} />
        <div className="exhibit-caption">
          <h3>{current.title}</h3>
          <p>{current.description}</p>
        </div>
      </div>
      <p className="exhibit-visual-note">
        合成影像与界面仅用于设计展示，不进行质量评估、诊断或 AI 推理。
      </p>
    </section>
  );
}
