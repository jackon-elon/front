import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Cloud,
  Hospital,
  Scan,
  FileText,
  Share2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { cloudModes, media } from "./content";
import { Reveal, Tabs } from "./ui";
export function CloudProduct() {
  const [mode, setMode] = useState(0);
  const current = cloudModes[mode];
  return (
    <section
      className="cloud-section section-pad"
      id="cloud"
      aria-labelledby="cloud-title"
    >
      <Reveal className="center-heading wrap">
        <p className="eyebrow">云影像</p>
        <h2 id="cloud-title">
          影像有了云。
          <br />
          <span className="blue-text">连接，就有了更多可能。</span>
        </h2>
        <p className="section-description">
          让一份检查资料，连接一次专业协作。
          <br className="desktop-only" />
          从院内到区域，从归档到阅片，每一步自然衔接。
        </p>
      </Reveal>
      <div className="product-tabs">
        <Tabs
          labels={cloudModes.map((m) => m.name)}
          value={mode}
          onChange={setMode}
          label="云影像产品场景"
          panelId="cloud-panel"
        />
      </div>
      <div
        className="cloud-stage wrap"
        role="tabpanel"
        id="cloud-panel"
        aria-label={current.name}
      >
        <div className="product-window">
          <div className="window-bar">
            <div className="window-dots">
              <i />
              <i />
              <i />
            </div>
            <span>影联网 · {current.focus}</span>
            <ShieldCheck size={17} />
          </div>
          <div className="workspace-view">
            <aside className="workspace-sidebar">
              <div className="workspace-logo">
                <Cloud size={24} />
                <strong>影像空间</strong>
              </div>
              {[
                { Icon: Scan, label: "影像资料" },
                { Icon: FileText, label: "报告信息" },
                { Icon: Share2, label: "协作任务" },
              ].map(({ Icon, label }, i) => (
                <div key={label} className={i === mode ? "selected" : ""}>
                  <Icon size={19} />
                  {label}
                </div>
              ))}
              <small>产品交互概念</small>
            </aside>
            <div className="workspace-main">
              <div className="workspace-title">
                <div>
                  <span>IMAGING WORKSPACE</span>
                  <h3>{current.focus}</h3>
                </div>
                <span className="workspace-status">
                  <i /> 协作空间
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  className="workspace-content"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="workspace-image">
                    <img
                      src={media.anatomy}
                      alt="医学影像切片概念模型"
                      loading="lazy"
                    />
                    <div className="image-label">
                      <Scan size={16} /> 影像资料预览 <span>概念示意</span>
                    </div>
                  </div>
                  <div className="connection-list">
                    <p>一条连续的连接</p>
                    {current.nodes.map((node, i) => (
                      <div className="connection-node" key={node}>
                        <span>
                          <Hospital size={20} />
                        </span>
                        <div>
                          <small>0{i + 1}</small>
                          <strong>{node}</strong>
                        </div>
                        <ChevronRight size={17} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="cloud-caption">
          <h3>{current.title}</h3>
          <p>{current.description}</p>
        </div>
      </div>
    </section>
  );
}
