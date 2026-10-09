import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Plus,
  X,
  GitCompareArrows,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { PageTitle, Panel, ProviderBadge, Empty } from "../components/UI";
import { ContextChart } from "../components/Charts";
import { compact, percent } from "../lib/format";
import { sessionTotals, type Session } from "../../shared/schema";

export default function Compare() {
  const { compare, toggleCompare, clearCompare, snapshot } = useApp();
  const [order, setOrder] = useState<string[]>([]);
  const [normalized, setNormalized] = useState(false);
  const [drag, setDrag] = useState<string | null>(null);
  const ids = [
    ...order.filter((id) => compare.includes(id)),
    ...compare.filter((id) => !order.includes(id)),
  ];
  const sessions = ids
    .map((id) => snapshot?.sessions.find((s) => s.id === id))
    .filter((s): s is Session => Boolean(s));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  };
  const add = (id: string) => {
    if (id) toggleCompare(id);
  };
  return (
    <>
      <PageTitle
        kicker="WORKSPACE / COMPARE"
        title="并排看，才更清晰"
        description="跨 Agent 检查输入增长、缓存和请求结构。拖动卡片调整顺序。"
      >
        <Link className="button" to="/sessions">
          <Plus size={16} />
          选择会话
        </Link>
        <button
          className="button"
          disabled={!sessions.length}
          onClick={clearCompare}
        >
          清空对比
        </button>
      </PageTitle>
      <div className="comparison-slots">
        <AnimatePresence>
          {sessions.map((s, index) => {
            const t = sessionTotals(s);
            return (
              <motion.article
                layout
                className={`comparison-card ${drag === s.id ? "dragging" : ""}`}
                key={s.id}
                initial={{ opacity: 0, y: 25, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 260, damping: 26 }}
                draggable
                onDragStartCapture={(event) => {
                  event.dataTransfer.setData("text/plain", s.id);
                  setDrag(s.id);
                }}
                onDragEndCapture={() => setDrag(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const source = e.dataTransfer.getData("text/plain");
                  if (ids.includes(source)) move(ids.indexOf(source), index);
                  setDrag(null);
                }}
              >
                <div className="comparison-card-head">
                  <span className="slot-number">0{index + 1}</span>
                  <ProviderBadge provider={s.provider} />
                  <button
                    className="icon-button"
                    aria-label={`移除对比 ${s.title}`}
                    onClick={() => toggleCompare(s.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="comparison-orbit" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <span>{compact(t.total)}</span>
                </div>
                <h2>{s.title}</h2>
                <p>
                  {s.project} · {s.requests.length} 次模型请求
                </p>
                <div className="comparison-stats">
                  <div>
                    <span>缓存命中</span>
                    <strong>
                      {percent(
                        t.cacheKnownInput ? t.cache / t.cacheKnownInput : null,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>用户消息</span>
                    <strong>{s.messages ?? "—"}</strong>
                  </div>
                </div>
                <div className="reorder-controls">
                  <GripVertical size={14} />
                  <span>拖动排序</span>
                  <button
                    className="icon-button"
                    disabled={index === 0}
                    aria-label={`将 ${s.title} 左移`}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={index === sessions.length - 1}
                    aria-label={`将 ${s.title} 右移`}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowRight size={15} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {sessions.length < 3 && (
          <div className="comparison-empty">
            <div className="add-orbit">
              <Plus size={24} />
            </div>
            <h2>{sessions.length ? "再加入一个视角" : "从第一个会话开始"}</h2>
            <p>最多三个会话，支持跨 Agent 对比</p>
            <select
              aria-label="加入对比的会话"
              value=""
              onChange={(e) => add(e.target.value)}
            >
              <option value="">选择一个会话…</option>
              {snapshot?.sessions
                .filter((s) => !compare.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {s.provider} · {s.id.slice(-5)}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>
      {sessions.length ? (
        <>
          <Panel
            title="上下文增长，放在同一张图里"
            eyebrow="CONTEXT OVERLAY"
            action={
              <div className="segment">
                <button
                  className={!normalized ? "active" : ""}
                  aria-pressed={!normalized}
                  onClick={() => setNormalized(false)}
                >
                  输入 Token
                </button>
                <button
                  className={normalized ? "active" : ""}
                  aria-pressed={normalized}
                  onClick={() => setNormalized(true)}
                >
                  占上限比例
                </button>
              </div>
            }
          >
            <ContextChart
              sessions={sessions}
              normalized={normalized}
              syncId="comparison"
            />
            <p className="panel-footnote">
              横轴按各会话的请求序号对齐。未记录上下文上限的请求，在比例图中留空。压缩会导致输入下降。
            </p>
          </Panel>
          <Panel title="从规模到效率" eyebrow="SIDE BY SIDE">
            <div className="comparison-table">
              <div className="comparison-table-row">
                <span>统计指标</span>
                {sessions.map((s) => (
                  <strong key={s.id}>
                    {s.project} <small>{s.id.slice(-5)}</small>
                  </strong>
                ))}
              </div>
              {[
                {
                  name: "总 Tokens",
                  get: (s: Session) => compact(sessionTotals(s).total),
                },
                {
                  name: "平均每次请求的输入",
                  get: (s: Session) =>
                    compact(
                      sessionTotals(s).input / Math.max(1, s.requests.length),
                    ),
                },
                {
                  name: "平均每次请求的输出",
                  get: (s: Session) =>
                    compact(
                      sessionTotals(s).output / Math.max(1, s.requests.length),
                    ),
                },
                {
                  name: "缓存写入 Tokens",
                  get: (s: Session) =>
                    s.requests.some((r) => r.cacheWrite !== null)
                      ? compact(sessionTotals(s).write)
                      : "未知",
                },
                {
                  name: "记录到的上下文压缩",
                  get: (s: Session) =>
                    String(
                      s.requests.filter((r) => r.kind === "compaction").length,
                    ),
                },
                {
                  name: "记录到的错误请求",
                  get: (s: Session) =>
                    String(s.requests.filter((r) => r.error).length),
                },
                {
                  name: "工具调用",
                  get: (s: Session) =>
                    s.tools === null ? "未知" : String(s.tools),
                },
              ].map((row) => (
                <div key={row.name} className="comparison-table-row">
                  <span>{row.name}</span>
                  {sessions.map((s) => (
                    <strong key={s.id}>{row.get(s)}</strong>
                  ))}
                </div>
              ))}
            </div>
            <p className="panel-footnote">
              不同任务和模型的 Token
              规模不能直接代表能力高低；这里只比较记录到的使用结构。
            </p>
          </Panel>
        </>
      ) : (
        <Empty
          title="还没有选定会话"
          message="从上方选择记录，或前往会话列表批量加入。"
          action={
            <Link className="button primary" to="/sessions">
              <GitCompareArrows size={16} />
              浏览会话
            </Link>
          }
        />
      )}
    </>
  );
}
