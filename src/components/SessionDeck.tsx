import { memo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, GitCompareArrows } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { sessionTotals, type Session } from "../../shared/schema";
import { compact, percent, time } from "../lib/format";
import { ProviderBadge } from "./UI";
import { useApp } from "../state/AppContext";

export const SessionDeck = memo(function SessionDeck({
  sessions,
}: {
  sessions: Session[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, setParams] = useSearchParams();
  const { compare, toggleCompare } = useApp();
  return (
    <div className="session-deck" data-region="可展开会话卡片">
      <AnimatePresence initial={false}>
        {sessions.slice(0, 4).map((s, i) => {
          const totals = sessionTotals(s);
          const open = expanded === s.id;
          return (
            <motion.article
              layout
              key={s.id}
              className={`deck-card ${open ? "expanded" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 35 }}
            >
              <button
                className="deck-trigger"
                aria-expanded={open}
                onClick={() => setExpanded(open ? null : s.id)}
              >
                <span className="deck-number">0{i + 1}</span>
                <div>
                  <ProviderBadge provider={s.provider} />
                  <h3>{s.title}</h3>
                  <p>
                    {s.project} <span>· {time(s.updatedAt)}</span>
                  </p>
                </div>
                <ChevronDown size={17} className={open ? "turned" : ""} />
              </button>
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    className="deck-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="deck-stats">
                      <div>
                        <span>TOKENS</span>
                        <strong>{compact(totals.total)}</strong>
                      </div>
                      <div>
                        <span>请求</span>
                        <strong>{s.requests.length}</strong>
                      </div>
                      <div>
                        <span>缓存命中</span>
                        <strong>
                          {percent(
                            totals.cacheKnownInput
                              ? totals.cache / totals.cacheKnownInput
                              : null,
                          )}
                        </strong>
                      </div>
                    </div>
                    <div className="deck-actions">
                      <button
                        className="text-button"
                        aria-pressed={compare.includes(s.id)}
                        onClick={() => toggleCompare(s.id)}
                      >
                        <GitCompareArrows size={14} />
                        {compare.includes(s.id) ? "移出对比" : "加入对比"}
                      </button>
                      <button
                        className="button small"
                        onClick={() =>
                          setParams((p) => {
                            p.set("session", s.id);
                            return p;
                          })
                        }
                      >
                        打开请求详情
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </AnimatePresence>
      {!sessions.length && <p className="deck-empty">暂无符合条件的会话</p>}
    </div>
  );
});
