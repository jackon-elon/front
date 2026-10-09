import { useState } from "react";
import { cloudModes } from "./content";
import { Tabs } from "./ui";
import { DigitalFilm, ImagingWorkstation } from "./ImagingWorkstation";
export function CloudProduct() {
  const [mode, setMode] = useState(0);
  const current = cloudModes[mode];
  return (
    <section
      className="cloud-section exhibit-catalog section-pad"
      aria-labelledby="cloud-title"
    >
      <div className="center-heading wrap">
        <p className="eyebrow">影联网 · 云影像服务</p>
        <h2 id="cloud-title">
          影像相连。
          <br />
          <span className="blue-text">每一次协作，都更近。</span>
        </h2>
        <p className="section-description">
          区域影像、数字胶片与远程会诊的产品场景。
        </p>
      </div>
      <div className="showcase-switch">
        <Tabs
          labels={cloudModes.map((m) => m.name)}
          value={mode}
          onChange={setMode}
          label="云影像产品场景"
          panelId="cloud-panel"
        />
      </div>
      <div
        id="cloud-panel"
        role="tabpanel"
        aria-label={current.name}
        className="exhibit-content wrap"
      >
        <div className={mode === 1 ? "exhibit-film" : "exhibit-reader"}>
          {mode === 1 ? (
            <DigitalFilm />
          ) : (
            <ImagingWorkstation compact cloudMode={mode} />
          )}
        </div>
        <div className="exhibit-caption">
          <h3>{current.title}</h3>
          <p>{current.description}</p>
          <div className="exhibit-capabilities">
            {current.nodes.map((node) => (
              <span key={node}>{node}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="exhibit-visual-note">
        产品界面为设计示意，不接入真实医院或患者数据。
      </p>
    </section>
  );
}
