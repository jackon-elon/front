import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  Check,
  ShieldCheck,
} from "lucide-react";
import { media, cloudModes, aiModes } from "./content";
import { Reveal } from "./ui";
import { ImageFrame } from "./ImageFrame";

export function ProductSections({
  onExplore,
}: {
  onExplore: (index: number) => void;
}) {
  return (
    <div>
      <section
        className="brand-cloud brand-section"
        id="cloud"
        aria-labelledby="cloud-showcase-title"
      >
        <Reveal className="brand-heading wrap">
          <p className="brand-kicker">影联网 · 影像云</p>
          <h2 id="cloud-showcase-title">
            影像有了云。
            <br />
            <span>专业，不再遥远。</span>
          </h2>
          <p className="brand-lead">
            连接检查资料，也连接专业的人。
            <br />
            让跨院协作，成为更自然的日常。
          </p>
          <button className="brand-text-link" onClick={() => onExplore(0)}>
            深入了解影像云 <ArrowUpRight size={19} />
          </button>
        </Reveal>
        <Reveal className="brand-cloud-photo wrap">
          <img
            src={media.care}
            width="1672"
            height="941"
            alt="医生在阅片室协作，生成的医疗工作场景示意"
            loading="lazy"
          />
          <p>
            相隔的，是距离。
            <br />
            相连的，是专业。
          </p>
        </Reveal>
        <div className="brand-feature-notes wrap">
          {cloudModes.map((mode) => (
            <div key={mode.name}>
              <h3>{mode.name}</h3>
              <p>
                <strong>{mode.title}</strong> {mode.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="brand-intelligence brand-section"
        id="ai"
        aria-labelledby="intelligence-title"
      >
        <Reveal className="brand-heading wrap">
          <p className="brand-kicker">医学影像 AI</p>
          <h2 id="intelligence-title">
            多一份洞察。
            <br />
            <span>看见更多细节。</span>
          </h2>
          <p className="brand-lead">
            把影像、报告与关联信息，放在一起。
            <br />
            把专业判断，留给医生。
          </p>
          <button className="brand-text-link" onClick={() => onExplore(1)}>
            深入了解影像智能 <ArrowUpRight size={19} />
          </button>
        </Reveal>
        <Reveal className="brand-imaging-display wrap">
          <div className="brand-display-bar">
            <span>影像与信息，在一处汇合。</span>
            <span>场景示意</span>
          </div>
          <div className="brand-display-content">
            <div className="brand-image-pair">
              <ImageFrame frame={1} label="合成关节影像，侧面参考视图" />
              <ImageFrame frame={3} label="合成关节影像，正面参考视图" />
            </div>
            <div className="brand-display-context">
              <FileText size={28} strokeWidth={1.3} />
              <h3>
                关联影像。
                <br />
                有序的信息。
              </h3>
              <p>从资料核对到报告复核，让每一步都有清晰的上下文。</p>
              <span>检查资料 → 报告框架 → 医生复核</span>
            </div>
          </div>
        </Reveal>
        <div className="brand-feature-notes wrap">
          {aiModes.map((mode) => (
            <div key={mode.name}>
              <h3>{mode.name}</h3>
              <p>
                <strong>{mode.title}</strong> {mode.description}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="brand-agent brand-section"
        id="agent"
        aria-labelledby="agent-showcase-title"
      >
        <Reveal className="brand-agent-layout wrap">
          <div className="brand-agent-copy">
            <p className="brand-kicker">医疗 Agent · 协作概念</p>
            <h2 id="agent-showcase-title">
              从一个问题。
              <br />
              <span>到下一步行动。</span>
            </h2>
            <p className="brand-lead">
              影像、报告、参考资料。
              <br />
              在有序的工作流里，找到彼此。
            </p>
            <button className="brand-text-link" onClick={() => onExplore(2)}>
              体验协作流程 <ArrowUpRight size={19} />
            </button>
          </div>
          <div className="brand-agent-flow">
            <div className="brand-agent-request">
              为这次阅片，准备协作清单。
              <ArrowRight size={20} />
            </div>
            {[
              ["影像资料", "关联检查与影像"],
              ["报告信息", "组织可复核的框架"],
              ["专业确认", "由医生完成复核"],
            ].map(([title, desc], i) => (
              <div className="brand-agent-step" key={title}>
                <span>
                  {i === 2 ? (
                    <ShieldCheck size={24} />
                  ) : i === 1 ? (
                    <FileText size={24} />
                  ) : (
                    <Check size={24} />
                  )}
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
            <p className="brand-agent-footnote">清晰的路径。明确的责任。</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
