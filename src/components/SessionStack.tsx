import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  GitCompareArrows,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { sessionTotals, type Session } from "../../shared/schema";
import { compact, percent } from "../lib/format";
import { ProviderBadge } from "./UI";
import { useApp } from "../state/AppContext";

export function SessionStack({ sessions }: { sessions: Session[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const [, setParams] = useSearchParams();
  const { compare, toggleCompare } = useApp();
  // Keep the same session in front when a live update changes the ordering.
  const index = Math.max(
    0,
    sessions.findIndex((s) => s.id === selectedId),
  );
  const active = sessions[index];
  if (!active) return <p className="deck-empty">暂无符合条件的会话</p>;
  const total = sessionTotals(active);
  const requests = active.requests.slice(-32);
  const peak = Math.max(1, ...requests.map((r) => r.input + r.output));
  const points = requests
    .map(
      (r, i) =>
        `${(i / Math.max(1, requests.length - 1)) * 280},${52 - ((r.input + r.output) / peak) * 46}`,
    )
    .join(" ");
  const move = (step: number) => {
    setDirection(step);
    setSelectedId(
      sessions[(index + step + sessions.length) % sessions.length].id,
    );
  };
  return (
    <div className="session-stack" data-region="叠放会话卡片">
      <div className="stack-stage">
        {[2, 1].map((depth) => (
          <div
            key={depth}
            aria-hidden="true"
            className={`stack-back stack-back-${depth}`}
          />
        ))}
        <motion.article
          className="stack-front"
          key={active.id}
          initial={{ opacity: 0, x: direction * 28, rotate: direction * 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 27 }}
        >
          <div className="stack-card-top">
            <ProviderBadge provider={active.provider} />
            <span>
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(sessions.length).padStart(2, "0")}
            </span>
          </div>
          <h3 title={active.title}>{active.title}</h3>
          <p className="stack-project">{active.project}</p>
          <div className="stack-stats">
            <div>
              <span>Token 用量</span>
              <strong>{compact(total.total)}</strong>
            </div>
            <div>
              <span>请求</span>
              <strong>{active.requests.length}</strong>
            </div>
            <div>
              <span>缓存命中</span>
              <strong>
                {percent(
                  total.cacheKnownInput
                    ? total.cache / total.cacheKnownInput
                    : null,
                )}
              </strong>
            </div>
          </div>
          <div
            className="stack-spark"
            role="img"
            aria-label={`最近 ${requests.length} 次请求的 Token 用量轨迹`}
          >
            <svg
              viewBox="0 0 280 58"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {[18, 36, 54].map((y) => (
                <path
                  key={y}
                  d={`M0 ${y}H280`}
                  stroke="#e4e8f2"
                  strokeDasharray="2 4"
                />
              ))}
              {requests.length > 1 ? (
                <polyline
                  points={points}
                  fill="none"
                  stroke="#4656d8"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              ) : requests.length === 1 ? (
                <circle
                  cx="140"
                  cy={
                    52 - ((requests[0].input + requests[0].output) / peak) * 46
                  }
                  r="3"
                  fill="#4656d8"
                />
              ) : null}
            </svg>
            <span>最近 {requests.length} 次请求</span>
          </div>
          <div className="stack-actions">
            <button
              className="icon-button"
              aria-label={compare.includes(active.id) ? "移出对比" : "加入对比"}
              aria-pressed={compare.includes(active.id)}
              onClick={() => toggleCompare(active.id)}
            >
              <GitCompareArrows size={19} />
            </button>
            <button
              className="button primary"
              onClick={() =>
                setParams((p) => {
                  const next = new URLSearchParams(p);
                  next.set("session", active.id);
                  return next;
                })
              }
            >
              查看会话
              <ArrowUpRight size={17} />
            </button>
          </div>
        </motion.article>
      </div>
      <div className="stack-navigation">
        <span>最近 {sessions.length} 个会话</span>
        <div>
          <button
            className="icon-button"
            aria-label="上一个会话"
            disabled={sessions.length < 2}
            onClick={() => move(-1)}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            className="icon-button"
            aria-label="下一个会话"
            disabled={sessions.length < 2}
            onClick={() => move(1)}
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
