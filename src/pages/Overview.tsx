import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  Radio,
  Pause,
  Play,
  X,
  Filter,
  ArrowDownRight,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { useAnalytics, useFilters } from "../lib/useAnalytics";
import { compact, percent, integer } from "../lib/format";
import { Metric, Panel, ProviderBadge, Skeleton } from "../components/UI";
import { UsageChart } from "../components/Charts";
import { LiveTrace } from "../components/LiveTrace";
import { SessionDeck } from "../components/SessionDeck";
import { SplitView } from "../components/SplitView";
import {
  providerNames,
  type Provider,
  type Session,
} from "../../shared/schema";

export default function Overview() {
  const { snapshot, mode, connected, checkedAt, events, eventCount } = useApp();
  const { filters, update } = useFilters();
  const [, setParams] = useSearchParams();
  const [now, setNow] = useState(Date.now());
  const [minutes, setMinutes] = useState(60);
  const [held, setHeld] = useState<{
    sessions: Session[];
    end: number;
    count: number;
  } | null>(null);
  const [drill, setDrill] = useState<string[] | null>(null);
  const [metric, setMetric] = useState<"total" | "input" | "output" | "cache">(
    "total",
  );
  const sessions = useMemo(() => snapshot?.sessions ?? [], [snapshot]);
  const { result: a, pending } = useAnalytics(sessions, filters);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setHeld(null);
    setDrill(null);
  }, [mode]);
  const selected = useMemo(
    () =>
      (held?.sessions ?? sessions).filter(
        (s) =>
          (filters.provider === "all" || s.provider === filters.provider) &&
          (!filters.project || filters.project === s.project),
      ),
    [sessions, held, filters.provider, filters.project],
  );
  const historicalEnd = useMemo(
    () =>
      selected.reduce(
        (end, s) =>
          s.requests.reduce(
            (latest, r) => Math.max(latest, Date.parse(r.time)),
            end,
          ),
        0,
      ),
    [selected],
  );
  const end = held?.end ?? (mode === "local" ? now : historicalEnd || now);
  const clock = (t: number | string) =>
    new Date(t).toLocaleTimeString("zh-CN", { hour12: false });
  const age = checkedAt
    ? Math.max(0, Math.floor((now - Date.parse(checkedAt)) / 1000))
    : null;
  const recent = useMemo(
    () =>
      [...selected]
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
        .filter((s) => !drill || drill.includes(s.id)),
    [selected, drill],
  );
  const records = useMemo(
    () =>
      selected
        .flatMap((s) => s.requests.map((r) => ({ session: s, request: r })))
        .sort((a, b) => Date.parse(b.request.time) - Date.parse(a.request.time))
        .slice(0, 7),
    [selected],
  );
  const projects = [...new Set(sessions.map((s) => s.project))];
  const open = (id: string) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set("session", id);
      return next;
    });
  if (!a) return <Skeleton />;
  return (
    <div className="control-room">
      <div className="room-heading">
        <div>
          <span className="eyebrow">YOUR AGENTS, IN FOCUS</span>
          <h1>
            看清每一次调用<span className="title-dot">.</span>
          </h1>
          <p>从整体投入，到每一条请求。你的 AI 工作，一目了然。</p>
        </div>
        <div className="room-clock">
          <strong>{clock(now)}</strong>
          <span>
            {new Date(now).toLocaleDateString("zh-CN", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </span>
        </div>
      </div>
      <div
        className={`connection-strip ${mode === "local" && connected ? "connected" : ""}`}
      >
        <span className="signal-dot" />
        <strong>
          {mode === "local"
            ? connected
              ? "本机日志 · 正在监听"
              : "本机日志 · 连接中断"
            : mode === "demo"
              ? "在线展示 · 虚构数据"
              : "导入记录 · 历史回放"}
        </strong>
        <span>
          {mode === "local"
            ? `每 3 秒检查文件 · 最近检查 ${age === null ? "—" : `${age} 秒前`}`
            : "此页面不会实时读取电脑日志"}
        </span>
        <Link to="/sources">
          连接管理
          <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="room-filter">
        <div className="provider-tabs" role="group" aria-label="筛选 Agent">
          {(["all", "codex", "claude", "workbuddy"] as const).map((p) => (
            <button
              key={p}
              aria-pressed={filters.provider === p}
              className={filters.provider === p ? "active" : ""}
              onClick={() => {
                update("source", p);
                setDrill(null);
              }}
            >
              {p === "all" ? "全部 Agent" : providerNames[p]}
              <span>
                {p === "all"
                  ? sessions.length
                  : sessions.filter((s) => s.provider === p).length}
              </span>
            </button>
          ))}
        </div>
        <div className="overview-filters">
          <select
            aria-label="统计时间范围"
            value={filters.days}
            onChange={(e) => update("days", e.target.value)}
          >
            {[7, 14, 28].map((d) => (
              <option key={d} value={d}>
                最近 {d} 天
              </option>
            ))}
          </select>
          <select
            aria-label="按项目筛选"
            value={filters.project}
            onChange={(e) => update("project", e.target.value)}
          >
            <option value="">所有工作区</option>
            {projects.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <SplitView>
        <Panel
          title="调用正在发生"
          eyebrow="01 / LIVE ACTIVITY"
          className="pulse-panel"
          action={
            <div className="pulse-actions">
              <div className="segment">
                {[15, 60, 360].map((m) => (
                  <button
                    key={m}
                    aria-pressed={minutes === m}
                    className={minutes === m ? "active" : ""}
                    onClick={() => {
                      setMinutes(m);
                      setDrill(null);
                    }}
                  >
                    {m === 360 ? "6h" : `${m}m`}
                  </button>
                ))}
              </div>
              <button
                className={`icon-button ${held ? "selected" : ""}`}
                aria-label={held ? "恢复时间线" : "暂停时间线"}
                onClick={() =>
                  setHeld(held ? null : { sessions, end, count: eventCount })
                }
              >
                {held ? <Play size={17} /> : <Pause size={17} />}
              </button>
            </div>
          }
        >
          <LiveTrace
            sessions={selected}
            end={end}
            minutes={minutes}
            onSelect={setDrill}
          />
          <div className="pulse-status">
            <span>
              <Radio size={14} />
              {held
                ? `画面暂停 · ${Math.max(0, eventCount - held.count)} 条新记录待查看`
                : mode === "local"
                  ? "随日志自动更新"
                  : "基于已有记录回放"}
            </span>
            <span>
              {mode === "local"
                ? `${eventCount} 条新增 / 本次打开后`
                : "历史记录"}
            </span>
          </div>
        </Panel>
        <Panel
          title="最近的工作"
          eyebrow="02 / RECENT SESSIONS"
          className="deck-panel"
          action={
            <Link className="text-link" to="/sessions">
              全部
              <ArrowUpRight size={15} />
            </Link>
          }
        >
          {drill && (
            <button className="drill-clear" onClick={() => setDrill(null)}>
              <Filter size={13} />
              {drill.length} 个会话 · 清除
              <X size={13} />
            </button>
          )}
          <SessionDeck sessions={recent} />
          <Link className="deck-compare-link" to="/compare">
            进入对比工作台 <ArrowUpRight size={16} />
          </Link>
        </Panel>
      </SplitView>
      <div className="overview-summary" aria-busy={pending}>
        <Metric
          label="Token 用量"
          value={compact(a.total)}
          sub={`输入 ${compact(a.input)} · 输出 ${compact(a.output)}`}
          index={0}
          accent
        />
        <Metric
          label="模型请求"
          value={integer(a.requests)}
          sub={`${a.activeSessions.length} 个会话产生了记录`}
          index={1}
        />
        <Metric
          label="缓存命中率"
          value={percent(a.cacheRate)}
          sub={`${compact(a.cache)} 已缓存 / ${compact(a.knownCacheInput)} 已知输入`}
          index={2}
        >
          <div className="mini-progress">
            <i style={{ width: `${(a.cacheRate ?? 0) * 100}%` }} />
          </div>
        </Metric>
        <Metric
          label="最大上下文占用"
          value={a.contextKnown ? percent(a.maxContext) : "—"}
          sub={
            a.contextKnown
              ? `${a.contextKnown} 次请求记录了上限`
              : "日志未提供上下文上限"
          }
          index={3}
        />
      </div>
      <div className="section-divider">
        <span>把工作看得更深入</span>
        <span className="divider-line" />
        <span className="eyebrow">HISTORY & INSIGHTS</span>
      </div>
      <div className="history-grid">
        <Panel
          title="用量趋势"
          eyebrow="03 / USAGE HISTORY"
          className="trend-panel"
          action={
            <div className="segment">
              {(
                [
                  ["total", "总量"],
                  ["input", "输入"],
                  ["output", "输出"],
                  ["cache", "缓存"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  aria-pressed={metric === v}
                  className={metric === v ? "active" : ""}
                  onClick={() => setMetric(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        >
          <UsageChart
            data={a.daily}
            metric={metric}
            onDay={(day) => {
              const ids = selected
                .filter((s) =>
                  s.requests.some((r) => {
                    const d = new Date(r.time);
                    return (
                      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` ===
                      day
                    );
                  }),
                )
                .map((s) => s.id);
              setDrill(ids);
              document
                .querySelector(".deck-panel")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        </Panel>
        <Panel
          title="请求记录"
          eyebrow="04 / REQUEST FEED"
          className="feed-panel"
          action={<span className="feed-count">{records.length} RECENT</span>}
        >
          <AnimatePresence initial={false}>
            {records.map(({ session: s, request: r }) => (
              <motion.button
                layout
                key={`${s.id}/${r.id}`}
                className="feed-row"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => open(s.id)}
              >
                <span className="feed-time">{clock(r.time).slice(0, 5)}</span>
                <div>
                  <ProviderBadge provider={s.provider} />
                  <strong>{r.model}</strong>
                  <small>
                    {s.project} ·{" "}
                    {r.kind === "compaction" ? "上下文压缩" : "用量记录"}
                  </small>
                </div>
                <span className="feed-amount">
                  {compact(r.input + r.output)}
                  <ArrowDownRight size={12} />
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
          {!records.length && <p className="deck-empty">等待第一条记录</p>}
        </Panel>
      </div>
      <div className="source-meters">
        {(["codex", "claude", "workbuddy"] as Provider[]).map((p) => {
          const s = snapshot?.sources.find((s) => s.provider === p);
          const b = a.breakdown.find((b) => b.provider === p)!;
          return (
            <button
              key={p}
              onClick={() =>
                update("source", filters.provider === p ? "all" : p)
              }
            >
              <ProviderBadge provider={p} />
              <strong>{compact(b.total)}</strong>
              <span>
                {s?.status === "missing"
                  ? "未发现日志"
                  : `${b.requests} 次请求`}
              </span>
            </button>
          );
        })}
      </div>
      {events.length > 0 && mode === "local" && (
        <div className="last-event" role="status">
          最新增量：{events[0].project} · +
          {compact(events[0].input + events[0].output)} tokens
        </div>
      )}
      <p className="page-note">
        统计来自日志中已写入的记录；不是正在生成中的逐 token
        流。未知指标保留为空，不补造数字。
      </p>
    </div>
  );
}
