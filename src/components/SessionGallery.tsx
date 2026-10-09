import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  GitCompareArrows,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  providerNames,
  type Session,
  type sessionTotals,
} from "../../shared/schema";
import { galleryEntries } from "../../shared/experience";
import { useApp } from "../state/AppContext";
import { compact, time } from "../lib/format";
import { SignalRecord } from "./SignalRecord";
const number = (value: number) => String(value).padStart(2, "0");

export const SessionGallery = memo(function SessionGallery({
  sessions,
  active,
  index,
  spread,
  direction,
  totalsById,
  onMove,
  onSelect,
  onOpen,
}: {
  sessions: Session[];
  active: Session;
  index: number;
  spread: boolean;
  direction: number;
  totalsById: ReadonlyMap<string, ReturnType<typeof sessionTotals>>;
  onMove: (step: number) => void;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const { compare, toggleCompare } = useApp();
  const entries = useMemo(
    () => galleryEntries(sessions, index, spread),
    [sessions, index, spread],
  );
  return (
    <>
      <div
        className={`x-gallery ${spread ? "is-spread" : ""}`}
        data-region="会话唱片牌组"
        tabIndex={0}
        role="region"
        aria-label="会话唱片展册，方向键切换"
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            onMove(e.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        <div className="x-gallery-floor" aria-hidden="true" />
        <AnimatePresence initial={false} mode="popLayout">
          {entries.map(({ session: s, offset, ordinal }, i) => {
            const selected = s.id === active.id;
            const totals = totalsById.get(s.id)!;
            return (
              <motion.article
                className={`x-vinyl-card ${selected ? "selected" : ""}`}
                data-region="唱片卡片"
                key={s.id}
                style={{ zIndex: selected ? 10 : i + 1 }}
                initial={{ opacity: 0, x: direction * 100, y: 30 }}
                animate={{
                  opacity: 1,
                  x: spread ? offset * 285 : offset * 155,
                  y: spread ? Math.abs(offset) * 22 : selected ? 0 : 35,
                  rotate: spread ? offset * 4 : offset * 12,
                  scale: spread && !selected ? 0.9 : selected ? 1 : 0.92,
                }}
                exit={{
                  opacity: 0,
                  x: -direction * 160,
                  rotate: -direction * 18,
                }}
                transition={{
                  type: "spring",
                  stiffness: 170,
                  damping: 24,
                }}
                drag={selected && !spread ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.45}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 65)
                    onMove(info.offset.x < 0 ? 1 : -1);
                }}
              >
                <button
                  className="x-card-select"
                  aria-label={`${selected ? "查看" : "选择"}会话：${s.title}`}
                  onClick={() => (selected ? onOpen(s.id) : onSelect(s.id))}
                >
                  <div className="x-card-top">
                    <span>{providerNames[s.provider]}</span>
                    <span>REC. {number(ordinal)}</span>
                  </div>
                  <div className="x-card-record">
                    <SignalRecord requests={s.requests} miniature />
                    <span>
                      {compact(totals.total)}
                      <small>TOKENS</small>
                    </span>
                  </div>
                  <h3>{s.title}</h3>
                  <p title={s.project}>{s.project}</p>
                  <div className="x-card-bottom">
                    <span>{s.requests.length} 次请求</span>
                    <span>{time(s.updatedAt)}</span>
                    <ArrowUpRight size={22} />
                  </div>
                </button>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="x-gallery-footer">
        <span className="x-gallery-hint">
          {spread ? "点击一张唱片，选择会话" : "拖动前景唱片，或使用方向键切换"}
        </span>
        <div>
          <button aria-label="上一张唱片" onClick={() => onMove(-1)}>
            <ArrowLeft />
          </button>
          <strong>
            <small>会话 </small>
            {index + 1}
            <small> / 共 {sessions.length} 段</small>
          </strong>
          <button aria-label="下一张唱片" onClick={() => onMove(1)}>
            <ArrowRight />
          </button>
        </div>
        <button
          className="x-compare-action"
          aria-pressed={compare.includes(active.id)}
          onClick={() => toggleCompare(active.id)}
        >
          {compare.includes(active.id) ? (
            <Check size={19} />
          ) : (
            <GitCompareArrows size={19} />
          )}{" "}
          {compare.includes(active.id) ? "已加入对比" : "加入对比"}
        </button>
      </div>
      {compare.length > 0 && (
        <Link className="x-comparison-link" to="/compare">
          打开对比工作台 · 已选择 {compare.length} 段会话{" "}
          <ArrowUpRight size={19} />
        </Link>
      )}
    </>
  );
});
