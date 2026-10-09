import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUpRight,
  ChevronRight,
  Layers,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { useAnalytics, useFilters } from "../lib/useAnalytics";
import { compact, percent, time } from "../lib/format";
import {
  Metric,
  PageTitle,
  Panel,
  ProviderBadge,
  Empty,
  Skeleton,
} from "../components/UI";
import { UsageChart } from "../components/Charts";
import {
  providerColors,
  providerNames,
  sessionTotals,
} from "../../shared/schema";

function FlowArtwork() {
  return (
    <div className="flow-art" aria-hidden="true">
      <svg viewBox="0 0 700 240" fill="none">
        <defs>
          <linearGradient id="ribbon">
            <stop stopColor="#aa94ff" />
            <stop offset=".45" stopColor="#f0cbdc" />
            <stop offset="1" stopColor="#b9e8d2" />
          </linearGradient>
          <linearGradient id="ribbon-shade" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#c1b0ff" stopOpacity=".7" />
            <stop offset="1" stopColor="#c1b0ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: 24 }, (_, i) => (
          <path
            key={i}
            className="flow-line"
            style={{ animationDelay: `${i * -0.2}s` }}
            d={`M -20 ${100 + i * 3} C 110 ${210 - i * 4}, 160 ${-100 + i * 7}, 300 ${80 + i * 3} S 470 ${300 - i * 6}, 720 ${20 + i * 4}`}
            stroke="url(#ribbon)"
            strokeWidth="1"
            opacity={0.15 + i / 70}
          />
        ))}
        <path
          d="M-20 135 C110 240 160 -25 300 110 S470 220 720 85 L720 245 L-20 245Z"
          fill="url(#ribbon-shade)"
          opacity=".16"
        />
      </svg>
      <div className="flow-label one">● Codex</div>
      <div className="flow-label two">✳ Claude Code</div>
      <div className="flow-label three">↗ WorkBuddy</div>
    </div>
  );
}
export default function Overview() {
  const { snapshot, mode } = useApp();
  const sessions = snapshot?.sessions ?? [];
  const { filters, update } = useFilters();
  const [, setParams] = useSearchParams();
  const { result: a, pending } = useAnalytics(sessions, filters);
  const [metric, setMetric] = useState<"total" | "input" | "output" | "cache">(
    "total",
  );
  const [selectedDay, setDay] = useState<string | null>(null);
  const [activityDay, setActivityDay] = useState<number | null>(null);
  useEffect(() => {
    setDay(null);
    setActivityDay(null);
  }, [filters.days, filters.provider, filters.project]);
  if (!a) return <Skeleton />;
  const active = sessions.filter((s) => a.activeSessions.includes(s.id));
  const visible = active.filter(
    (s) =>
      (!selectedDay ||
        s.requests.some((r) => {
          const d = new Date(r.time);
          return (
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` ===
            selectedDay
          );
        })) &&
      (activityDay === null ||
        s.requests.some(
          (r) => (new Date(r.time).getDay() + 6) % 7 === activityDay,
        )),
  );
  const open = (id: string) =>
    setParams((previous) => {
      const p = new URLSearchParams(previous);
      p.set("session", id);
      return p;
    });
  const projects = [...new Set(sessions.map((s) => s.project))];
  const topProjects = projects
    .map((name) => ({
      name,
      total: active
        .filter((s) => s.project === name)
        .reduce((sum, s) => sum + sessionTotals(s).total, 0),
    }))
    .filter((x) => x.total)
    .sort((x, y) => y.total - x.total)
    .slice(0, 4);
  const top = a.breakdown
    .filter((b) => b.total > 0)
    .sort((x, y) => y.total - x.total);
  let accumulated = 0;
  const conic = top
    .map((b) => {
      const start = accumulated;
      accumulated += (b.total / a.total) * 100;
      return `${providerColors[b.provider]} ${start}% ${accumulated}%`;
    })
    .join(",");
  return (
    <>
      <PageTitle
        kicker="WORKSPACE / OVERVIEW"
        title="看清每一份投入"
        description="把分散的 Agent 使用记录，变成一张清晰的工作地图。"
      >
        <div className="filter-controls">
          <SlidersHorizontal size={16} />
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
        </div>
      </PageTitle>
      <section className="overview-hero" data-region="总览主视觉">
        <div className="hero-copy">
          <span className="eyebrow">YOUR AGENTS. ONE CLEAR PICTURE.</span>
          <h2>让数据，有迹可循。</h2>
          <p>
            {mode === "demo"
              ? "正在探索演示工作区 · 所有记录均为虚构示例"
              : mode === "import"
                ? "已导入的使用记录 · 数据保存在当前浏览器"
                : "你的本地使用记录 · 仅提取统计元数据"}
          </p>
          <Link className="hero-link" to="/sessions">
            探索会话 <ArrowUpRight size={17} />
          </Link>
        </div>
        <FlowArtwork />
        <span className="hero-index">01 / OBSERVABILITY</span>
      </section>
      <div className="metric-grid" aria-busy={pending}>
        <Metric
          label="总 Token 用量"
          value={compact(a.total)}
          sub={`输入 ${compact(a.input)} / 输出 ${compact(a.output)}`}
          index={0}
          accent
        >
          <span className="metric-decoration">↗</span>
        </Metric>
        <Metric
          label="模型请求"
          value={compact(a.requests)}
          sub={`${a.activeSessions.length} 个有用量的会话`}
          index={1}
        />
        <Metric
          label="输入缓存命中"
          value={percent(a.cacheRate)}
          sub={`${compact(a.cache)} 已缓存 / 已知输入 ${compact(a.knownCacheInput)}`}
          index={2}
        >
          <div className="mini-progress">
            <i style={{ width: `${(a.cacheRate ?? 0) * 100}%` }} />
          </div>
        </Metric>
        <Metric
          label="最高上下文占用"
          value={a.contextKnown ? percent(a.maxContext) : "—"}
          sub={
            a.contextKnown
              ? `${a.contextKnown} 次请求记录了上下文上限`
              : "日志未提供模型上下文上限"
          }
          index={3}
        />
      </div>
      <div className="analytics-grid">
        <Panel
          title="投入的节奏"
          eyebrow="TOKEN ACTIVITY"
          className="trend-panel"
          action={
            <div className="segment" aria-label="趋势指标">
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
          <div className="chart-caption">
            <strong>{compact(a[metric])}</strong>
            <span>最近 {filters.days} 天 · 点击曲线查看当日会话</span>
          </div>
          <UsageChart data={a.daily} metric={metric} onDay={setDay} />
        </Panel>
        <Panel title="你的 Agent 组合" eyebrow="SOURCE MIX">
          <div className="donut-wrap">
            <div
              className="donut"
              style={{
                background: a.total ? `conic-gradient(${conic})` : "#e5e2ee",
              }}
            >
              <div>
                <span>{top.length}</span>
                <small>活跃数据源</small>
              </div>
            </div>
            <span className="donut-caption">按 Token 用量分布</span>
          </div>
          <div className="source-list">
            {a.breakdown.map((b) => (
              <button
                key={b.provider}
                className={`source-line ${filters.provider === b.provider ? "selected" : ""}`}
                onClick={() =>
                  update(
                    "source",
                    filters.provider === b.provider ? "all" : b.provider,
                  )
                }
              >
                <ProviderBadge provider={b.provider} />
                <strong>{a.total ? percent(b.total / a.total) : "—"}</strong>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
          {filters.provider !== "all" && (
            <button
              className="text-button"
              onClick={() => update("source", "all")}
            >
              清除数据源筛选 <X size={12} />
            </button>
          )}
        </Panel>
      </div>
      <div className="lower-grid">
        <Panel
          title="最近的工作轨迹"
          eyebrow="SESSION EXPLORER"
          action={
            <Link className="text-link" to="/sessions">
              全部会话 <ArrowUpRight size={16} />
            </Link>
          }
        >
          <AnimatePresence>
            {(selectedDay || activityDay !== null) && (
              <motion.div
                className="drilldown"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                正在查看{" "}
                {selectedDay ??
                  ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][
                    activityDay!
                  ]}{" "}
                · {visible.length} 个会话
                <button
                  className="icon-button"
                  aria-label="清除图表联动筛选"
                  onClick={() => {
                    setDay(null);
                    setActivityDay(null);
                  }}
                >
                  <X size={15} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {visible.length ? (
            <div className="recent-list">
              {visible.slice(0, 5).map((s, i) => (
                <motion.button
                  className="recent-session"
                  key={s.id}
                  layout
                  onClick={() => open(s.id)}
                  whileHover={{ x: 5 }}
                >
                  <span className="session-number">0{i + 1}</span>
                  <div className="session-caption">
                    <strong>{s.title}</strong>
                    <span>
                      {s.project} · {time(s.updatedAt)}
                    </span>
                  </div>
                  <ProviderBadge provider={s.provider} short />
                  <span className="recent-total">
                    {compact(sessionTotals(s).total)}
                  </span>
                  <ArrowUpRight size={17} />
                </motion.button>
              ))}
            </div>
          ) : (
            <Empty
              title="这段时间还没有记录"
              message="试试切换时间范围或清除筛选。"
            />
          )}
        </Panel>
        <Panel title="工作区分布" eyebrow="WHERE IT HAPPENS">
          <div className="project-list">
            {topProjects.map((p, i) => (
              <button
                key={p.name}
                onClick={() =>
                  update("project", filters.project === p.name ? "" : p.name)
                }
              >
                <span className="project-icon">
                  <Layers size={17} />
                </span>
                <div>
                  <strong>{p.name}</strong>
                  <div className="project-bar">
                    <motion.i
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(p.total / topProjects[0].total) * 100}%`,
                      }}
                      transition={{ duration: 0.65, delay: i * 0.05 }}
                    />
                  </div>
                </div>
                <span>{compact(p.total)}</span>
              </button>
            ))}
          </div>
          <p className="panel-footnote">工作区用量为筛选会话的全部请求合计。</p>
        </Panel>
      </div>
      <Panel
        title="哪一刻最专注"
        eyebrow="ACTIVITY MAP"
        action={<span className="muted small">点击星期，联动上方会话</span>}
      >
        <div className="heatmap">
          <div className="heat-hours">
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h}>{h % 4 === 0 ? `${h}:00` : ""}</span>
            ))}
          </div>
          {a.heatmap.map((hours, day) => (
            <div className="heat-row" key={day}>
              <button
                className={activityDay === day ? "active" : ""}
                onClick={() => setActivityDay(activityDay === day ? null : day)}
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day]}
              </button>
              {hours.map((v, h) => (
                <div
                  key={h}
                  title={`${["周一", "周二", "周三", "周四", "周五", "周六", "周日"][day]} ${h}:00 · ${v} 次请求`}
                  style={{
                    background: v
                      ? `rgba(130, 107, 214, ${Math.min(0.95, 0.15 + (v / Math.max(1, ...a.heatmap.flat())) * 0.8)})`
                      : "#f0eef5",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="heat-legend">
          <span>按浏览器本地时区</span>
          <span>
            少 <i />
            <i />
            <i />
            <i /> 多
          </span>
        </div>
      </Panel>
      <div className="page-note">
        {providerNames.codex} / Claude Code / WorkBuddy ·
        数据来自日志，统计不能替代服务商账单。
      </div>
    </>
  );
}
