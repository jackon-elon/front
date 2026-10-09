import { useEffect, useReducer } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUp,
  Check,
  FileText,
  Layers,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { agentModes } from "./content";
import { Reveal, Tabs } from "./ui";
import { initialWorkflow, workflowReducer } from "./workflow";
export function MedicalAgent() {
  const [{ mode, step, playing, runId }, dispatch] = useReducer(
    workflowReducer,
    initialWorkflow,
  );
  const reduce = useReducedMotion();
  const current = agentModes[mode];
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(
      () => dispatch({ type: "advance", runId }),
      reduce ? 180 : 750,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [playing, step, reduce, runId]);
  const reset = () => {
    dispatch({ type: "reset" });
  };
  const changeMode = (next: number) => {
    dispatch({ type: "mode", mode: next });
  };
  const play = () => {
    dispatch({ type: "start" });
  };
  return (
    <section
      className="agent-section section-pad"
      id="agent-exhibit"
      aria-labelledby="agent-title"
    >
      <Reveal className="center-heading wrap">
        <p className="eyebrow">医疗 Agent</p>
        <h2 id="agent-title">
          理解你的问题。
          <br />
          <span className="blue-text">连接下一步行动。</span>
        </h2>
        <p className="section-description">
          让资料、工具与工作流，围绕一个问题有序展开。
          <br className="desktop-only" />
          从准备到复核，每一步都清晰可见。
        </p>
      </Reveal>
      <div className="product-tabs">
        <Tabs
          labels={agentModes.map((m) => m.name)}
          value={mode}
          onChange={changeMode}
          label="医疗 Agent 协同场景"
          panelId="agent-panel"
        />
      </div>
      <div
        className="agent-product wrap"
        role="tabpanel"
        id="agent-panel"
        aria-label={current.name}
      >
        <div className="agent-conversation">
          <div className="agent-product-brand">
            <div className="small-orb">
              <Layers size={25} />
            </div>
            <div>
              <strong>医疗 Agent</strong>
              <span>从信息，到有序的协作</span>
            </div>
            <span className="concept-chip">场景演示</span>
          </div>
          <div className="conversation-body">
            <div className="user-bubble">{current.prompt}</div>
            <div className="agent-response">
              <Sparkles size={22} />
              <div>
                <strong>
                  {step < 0
                    ? "准备就绪。一起看一次协同过程。"
                    : step < 3
                      ? "正在连接资料与协作步骤…"
                      : "资料已整理，等待专业人员复核。"}
                </strong>
                <p>{current.note}</p>
              </div>
            </div>
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  className="agent-result"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <FileText size={22} />
                  <div>
                    <strong>{current.name} · 工作摘要</strong>
                    {current.result.map((line) => (
                      <span key={line}>{line}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="agent-input">
            <span>
              {playing
                ? "协同过程进行中"
                : step >= 3
                  ? "已完成演示，可重新体验"
                  : "体验一次有序的协作"}
            </span>
            <button aria-label="开始协同演示" disabled={playing} onClick={play}>
              <ArrowUp size={21} />
            </button>
          </div>
        </div>
        <div className="agent-process">
          <div className="process-heading">
            <span>协同路径</span>
            <button aria-label="重置协同演示" onClick={reset}>
              <RotateCcw size={17} />
            </button>
          </div>
          <ol className="process-steps">
            {current.steps.map((name, index) => (
              <li
                key={name}
                className={
                  step > index
                    ? "complete"
                    : index === 3 && step === 3 && !playing
                      ? "review"
                      : step === index
                        ? "current"
                        : ""
                }
              >
                <span className="step-circle">
                  {step > index ? <Check size={16} /> : `0${index + 1}`}
                </span>
                <div>
                  <strong>{name}</strong>
                  <span>
                    {step > index
                      ? "已完成"
                      : index === 3 && step === 3 && !playing
                        ? "等待人工确认"
                        : step === index
                          ? "处理中"
                          : "等待开始"}
                  </span>
                </div>
              </li>
            ))}
          </ol>
          <p className="process-review">
            <ShieldCheck size={19} /> 人工复核，是流程的一部分。
          </p>
          <p className="process-note">
            演示仅展示协同逻辑，不连接患者数据或实际诊疗服务。
          </p>
          <span className="sr-only" role="status" aria-live="polite">
            {step < 0
              ? "演示准备就绪"
              : playing
                ? `正在${current.steps[step]}`
                : "协同演示完成，等待人工复核"}
          </span>
        </div>
      </div>
    </section>
  );
}
