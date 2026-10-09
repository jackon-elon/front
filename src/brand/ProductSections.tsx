import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cloudModes, aiModes } from "./content";
import { Reveal, Tabs, usePresentationMotion } from "./ui";
import { ImagingWorkstation, DigitalFilm } from "./ImagingWorkstation";
export function ProductSections({
  onExplore,
}: {
  onExplore: (index: number) => void;
}) {
  const [cloud, setCloud] = useState(0);
  const [ai, setAI] = useState(0);
  const reduce = usePresentationMotion();
  return (
    <div className="product-sections">
      <section
        className="cloud-showcase"
        id="cloud"
        aria-labelledby="cloud-showcase-title"
      >
        <Reveal className="product-intro wrap">
          <p className="product-kicker">影联网 · 区域影像云</p>
          <h2 id="cloud-showcase-title">
            影像有了云。
            <br />
            <span>协作，没有距离。</span>
          </h2>
          <p className="product-lead">
            从数字影像到远程会诊，让检查资料与专业服务，
            <br className="desktop-only" />
            在医院、医生和患者之间连接。
          </p>
        </Reveal>
        <div className="showcase-switch">
          <Tabs
            labels={cloudModes.map((m) => m.name)}
            value={cloud}
            onChange={setCloud}
            label="首页云影像场景"
            panelId="cloud-showcase-panel"
          />
        </div>
        <Reveal className="cloud-display wrap">
          <div className="cloud-desktop">
            <ImagingWorkstation compact cloudMode={cloud} />
          </div>
          <div className="cloud-mobile">
            <DigitalFilm />
          </div>
        </Reveal>
        <div
          id="cloud-showcase-panel"
          role="tabpanel"
          aria-label={cloudModes[cloud].name}
          className="product-detail-row wrap"
        >
          <div>
            <h3>{cloudModes[cloud].title}</h3>
            <p>{cloudModes[cloud].description}</p>
          </div>
          <button className="product-detail-link" onClick={() => onExplore(0)}>
            探索云影像 <ArrowUpRight size={19} />
          </button>
        </div>
        <div className="cloud-capabilities wrap">
          {cloudModes[cloud].nodes.map((node, i) => (
            <div key={node}>
              <span>0{i + 1}</span>
              <h3>{node}</h3>
            </div>
          ))}
        </div>
      </section>
      <section
        className="intelligence-showcase"
        id="ai"
        aria-labelledby="intelligence-title"
      >
        <Reveal className="product-intro wrap">
          <p className="product-kicker">医学影像 AI</p>
          <h2 id="intelligence-title">
            从看见影像。
            <br />
            <span>到读懂信息。</span>
          </h2>
          <p className="product-lead">
            围绕质控、报告和影像对比，探索智能辅助的工作方式。
            <br className="desktop-only" />
            让专业判断，始终由医生掌握。
          </p>
        </Reveal>
        <div className="showcase-switch">
          <Tabs
            labels={aiModes.map((m) => m.name)}
            value={ai}
            onChange={setAI}
            label="首页影像智能功能"
            panelId="intelligence-panel"
          />
        </div>
        <div
          className="intelligence-stage wrap"
          id="intelligence-panel"
          role="tabpanel"
          aria-label={aiModes[ai].name}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ai}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.18 }}
            >
              <ImagingWorkstation mode={ai} />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="product-detail-row wrap">
          <div>
            <h3>{aiModes[ai].title}</h3>
            <p>{aiModes[ai].description}</p>
          </div>
          <button className="product-detail-link" onClick={() => onExplore(1)}>
            了解智能影像 <ArrowUpRight size={19} />
          </button>
        </div>
        <p className="product-source-note wrap">
          界面与影像为设计示意，不执行诊断。产品方向参考公开资料，具体能力以正式产品信息为准。
        </p>
      </section>
      <section
        className="agent-showcase"
        id="agent"
        aria-labelledby="agent-showcase-title"
      >
        <Reveal className="agent-showcase-layout wrap">
          <div className="agent-showcase-copy">
            <p className="product-kicker">医疗 Agent · 协作概念</p>
            <h2 id="agent-showcase-title">
              从一个问题。
              <br />
              <span>到下一步行动。</span>
            </h2>
            <p>
              影像、报告、参考资料。
              <br />
              在一条有序的工作流里，找到彼此。
            </p>
            <button
              className="product-detail-link"
              onClick={() => onExplore(2)}
            >
              体验协作流程 <ArrowUpRight size={19} />
            </button>
          </div>
          <div className="agent-editorial">
            <div className="agent-editorial-header">
              <span className="agent-monogram">A</span>
              <div>
                <span>医疗 Agent</span>
                <p>把协作，连接起来。</p>
              </div>
              <span>概念演示</span>
            </div>
            <div className="agent-editorial-prompt">
              为这次远程阅片，准备一份协作清单。
              <ArrowRight size={18} />
            </div>
            <div className="agent-editorial-path">
              {[
                ["影像资料", "关联检查与影像"],
                ["报告信息", "组织可复核的框架"],
                ["专业确认", "由医生完成复核"],
              ].map(([title, desc], i) => (
                <div key={title}>
                  <span>
                    {i === 2 ? (
                      <ShieldCheck size={21} />
                    ) : i === 1 ? (
                      <FileText size={21} />
                    ) : (
                      <Check size={21} />
                    )}
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                  <b>0{i + 1}</b>
                </div>
              ))}
            </div>
            <div className="agent-editorial-note">
              <i /> 清晰的路径。明确的责任。
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
