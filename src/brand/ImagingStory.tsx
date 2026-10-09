import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useInView,
  type MotionValue,
} from "motion/react";
import {
  ArrowUpRight,
  Cloud,
  Check,
  ScanLine,
  FileText,
  Hospital,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { media } from "./content";
import { usePresentationMotion } from "./ui";
import { WorkspaceArtwork } from "./WorkspaceArtwork";

const chapters = [
  {
    id: "cloud",
    label: "云端连接",
    product: "云影像",
    title: (
      <>
        从一张影像，
        <br />
        到一个医疗网络。
      </>
    ),
    description: "让检查资料走出院区，连接远方的专业协作。",
  },
  {
    id: "ai",
    label: "智能洞察",
    product: "AI 辅助诊断",
    title: (
      <>
        每一个细节，
        <br />
        都值得被看见。
      </>
    ),
    description: "聚焦影像信息，辅助阅片分析。专业判断，始终在医生手中。",
  },
  {
    id: "agent",
    label: "有序协同",
    product: "医疗 Agent",
    title: (
      <>
        把下一步，
        <br />
        连接成一条路径。
      </>
    ),
    description: "让影像、报告与知识，围绕一次协作有序展开。",
  },
];
function WorkspacePlane({
  progress,
  index,
  chapter,
}: {
  progress: MotionValue<number>;
  index: number;
  chapter: number;
}) {
  const x = useTransform(
    progress,
    [0, 0.22, 0.36, 0.58, 0.75, 1],
    [index * 35, index * 55, 0, 0, index * 12, index * 12],
  );
  const y = useTransform(
    progress,
    [0, 0.22, 0.36, 0.58, 0.75, 1],
    [-index * 17, -index * 22, 0, 0, -index * 8, -index * 8],
  );
  const rotateY = useTransform(
    progress,
    [0, 0.22, 0.36, 0.58, 0.75, 1],
    [-28, -38, 0, 0, -20, -20],
  );
  const opacity =
    chapter === 0
      ? index
        ? 0.5
        : 1
      : chapter === 1
        ? index
          ? 0
          : 1
        : index
          ? 0
          : 0.12;
  const scale = useTransform(
    progress,
    [0, 0.25, 0.36, 0.58, 0.75, 1],
    [1, 1, 1.05, 1.05, 0.8, 0.8],
  );
  return (
    <motion.div
      className="story-slice"
      style={{ x, y, rotateY, opacity, scale, zIndex: 7 - index }}
    >
      <WorkspaceArtwork annotated={chapter === 1} />
    </motion.div>
  );
}

export function ImagingStory({
  onExplore,
  onActive,
}: {
  onExplore: (index: number) => void;
  onActive: (id: string) => void;
}) {
  const target = useRef<HTMLElement>(null);
  const [chapter, setChapter] = useState(0);
  const reduce = usePresentationMotion();
  const inView = useInView(target, { margin: "-70px 0px -100px 0px" });
  const { scrollYProgress: progress } = useScroll({
    target,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(progress, "change", (value) =>
    setChapter(value < 0.31 ? 0 : value < 0.67 ? 1 : 2),
  );
  useEffect(() => {
    if (inView && !reduce) onActive(chapters[chapter].id);
  }, [chapter, inView, onActive, reduce]);
  const background = useTransform(
    progress,
    [0, 0.24, 0.34, 0.6, 0.71, 1],
    ["#f5f5f7", "#f5f5f7", "#080b11", "#080b11", "#f5f5f7", "#f5f5f7"],
  );
  const scanY = useTransform(progress, [0.32, 0.6], ["18%", "78%"]);
  const reportY = useTransform(progress, [0.64, 0.78], [70, 0]);

  if (reduce)
    return (
      <section
        className="story-static"
        ref={target}
        id="products"
        aria-label="影像的连接旅程"
      >
        {chapters.map((item, i) => (
          <article key={item.id} id={item.id}>
            <div>
              <p>{item.product}</p>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <button className="text-link" onClick={() => onExplore(i)}>
                进入{item.product}展台 <ArrowUpRight size={18} />
              </button>
            </div>
            {i === 2 ? (
              <img
                src={media.care}
                alt="医疗团队协作的场景示意"
                loading="lazy"
              />
            ) : (
              <WorkspaceArtwork
                annotated={i === 1}
                label="云端资料空间设计示意"
              />
            )}
          </article>
        ))}
      </section>
    );

  return (
    <section
      className={`story-track story-chapter-${chapter}`}
      ref={target}
      aria-label="影像的连接旅程"
      id="products"
    >
      {chapters.map((item, i) => (
        <div
          key={item.id}
          className="story-anchor"
          id={item.id}
          style={{ top: `${[0, 125, 260][i]}svh` }}
        >
          <span className="sr-only">{item.product}章节</span>
        </div>
      ))}
      <motion.div className="story-pin" style={{ backgroundColor: background }}>
        <div className="story-copy-layers">
          <motion.div
            key={chapter}
            className={`story-caption ${chapter === 1 ? "on-dark" : ""}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="story-kicker">{chapters[chapter].product}</p>
            <h2>{chapters[chapter].title}</h2>
            <p className="story-description">{chapters[chapter].description}</p>
            <button
              className="story-explore"
              onClick={() => onExplore(chapter)}
            >
              进入产品展台{" "}
              <span>
                <ArrowUpRight size={18} />
              </span>
            </button>
          </motion.div>
        </div>
        <div className="story-object" aria-hidden="true">
          {[4, 3, 2, 1, 0].map((i) => (
            <WorkspacePlane
              progress={progress}
              index={i}
              chapter={chapter}
              key={i}
            />
          ))}
          <motion.div
            className="cloud-orbit"
            style={{ opacity: chapter === 0 ? 1 : 0 }}
          >
            <div className="orbit-label orbit-one">
              <Hospital size={18} />
              <span>医疗机构</span>
            </div>
            <div className="orbit-label orbit-two">
              <Cloud size={18} />
              <span>影像云</span>
            </div>
            <div className="orbit-label orbit-three">
              <Layers size={18} />
              <span>协同阅片</span>
            </div>
            <svg
              className="orbit-connections"
              viewBox="0 0 600 650"
              fill="none"
            >
              <path
                d="M90 210C160 80 470 80 515 260M510 370C450 590 100 550 80 410"
                stroke="#87a6cc"
                strokeWidth="1"
                strokeDasharray="3 6"
              />
            </svg>
          </motion.div>
          <motion.div
            className="story-ai-scan"
            style={{ opacity: chapter === 1 ? 1 : 0 }}
          >
            <motion.div className="story-scan-line" style={{ top: scanY }} />
            <div className="ai-reticle">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="ai-detail-label">
              <ScanLine size={17} />
              <span>
                信息整理
                <br />
                <small>让影像信息更清晰</small>
              </span>
            </div>
          </motion.div>
          <motion.div
            className="story-report"
            style={{ opacity: chapter === 2 ? 1 : 0, y: reportY }}
          >
            <div className="report-heading">
              <span>
                <FileText size={21} />
              </span>
              <p>
                从资料，到协作。<small>医疗 Agent · 概念演示</small>
              </p>
            </div>
            <div className="report-sheet">
              <p>一次有序的协同</p>
              {["影像资料关联", "信息整理与报告框架", "人工复核与确认"].map(
                (line, i) => (
                  <div className="report-task" key={line}>
                    <span>
                      {i === 2 ? (
                        <ShieldCheck size={18} />
                      ) : (
                        <Check size={16} />
                      )}
                    </span>
                    <div>
                      <strong>{line}</strong>
                      <small>
                        {i === 2 ? "等待专业人员确认" : "连接到协作路径"}
                      </small>
                    </div>
                  </div>
                ),
              )}
              <div className="report-paper-lines">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="report-bottom">
              <i /> 每一步，清晰可见。
            </div>
          </motion.div>
        </div>
        <div className="story-toolbar">
          <nav aria-label="影像旅程章节">
            {chapters.map((item, i) => (
              <a
                href={`#${item.id}`}
                key={item.id}
                aria-current={chapter === i ? "step" : undefined}
              >
                <span>0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <span className="story-scroll-hint">
            随滚动探索 <span>↓</span>
          </span>
        </div>
        <p className="story-visual-note">产品界面与协作路径为设计示意</p>
      </motion.div>
    </section>
  );
}
