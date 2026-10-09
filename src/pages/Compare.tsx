import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  GitCompareArrows,
  Plus,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useApp } from "../state/AppContext";
import { PageTitle, Panel, ProviderBadge, Empty } from "../components/UI";
import { ContextChart } from "../components/Charts";
import { compact, percent, time } from "../lib/format";
import {
  metricDifference,
  recentProjectPair,
  usageProfile,
} from "../../shared/comparison";
import type { Session } from "../../shared/schema";
import "../change.css";

const metrics = [
  { key: "total", name: "累计用量", unit: "token" },
  { key: "avgInput", name: "每次请求 · 平均输入", unit: "token" },
  { key: "avgOutput", name: "每次请求 · 平均输出", unit: "token" },
  { key: "peakInput", name: "输入上下文峰值", unit: "token" },
  { key: "cacheRate", name: "输入缓存命中率", unit: "rate" },
  { key: "requests", name: "模型请求数", unit: "count" },
  { key: "compactions", name: "记录到的上下文压缩", unit: "count" },
  { key: "errors", name: "记录到的错误请求", unit: "count" },
] as const;
const format = (value: number | null, unit: string) =>
  value === null
    ? "未知"
    : unit === "rate"
      ? percent(value)
      : unit === "token"
        ? compact(value)
        : String(value);
const change = (value: number | null, base: number | null, unit: string) => {
  const diff = metricDifference(value, base);
  if (!diff) return "数据不足";
  if (diff.absolute === 0) return "无变化";
  const sign = diff.absolute > 0 ? "+" : "−";
  if (unit === "rate")
    return sign + Math.abs(diff.absolute * 100).toFixed(1) + " 个百分点";
  if (diff.relative === null)
    return sign + format(Math.abs(diff.absolute), unit) + " · 基准为 0";
  return sign + (Math.abs(diff.relative) * 100).toFixed(1) + "%";
};

export default function Compare() {
  const { compare, toggleCompare, clearCompare, replaceCompare, snapshot } =
    useApp();
  const [, setParams] = useSearchParams();
  const [order, setOrder] = useState<string[]>([]);
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [project, setProject] = useState("");
  const [query, setQuery] = useState("");
  const [normalized, setNormalized] = useState(false);
  const [alignment, setAlignment] = useState<"step" | "progress">("progress");
  const [drag, setDrag] = useState<string | null>(null);
  const source = snapshot?.sessions;
  const sessions = useMemo(() => {
    const ids = [
      ...order.filter((id) => compare.includes(id)),
      ...compare.filter((id) => !order.includes(id)),
    ];
    return ids
      .map((id) => source?.find((s) => s.id === id))
      .filter((s): s is Session => Boolean(s));
  }, [order, compare, source]);
  const profiles = useMemo(
    () => new Map(sessions.map((s) => [s.id, usageProfile(s)])),
    [sessions],
  );
  const baseline = sessions.find((s) => s.id === baselineId) ?? sessions[0];
  const base = baseline ? profiles.get(baseline.id)! : null;
  const projects = useMemo(
    () => [...new Set(source?.map((s) => s.project) ?? [])].sort(),
    [source],
  );
  const suggestedProject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of source ?? [])
      counts.set(s.project, (counts.get(s.project) ?? 0) + 1);
    return [...(source ?? [])]
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .find((s) => (counts.get(s.project) ?? 0) >= 2)?.project;
  }, [source]);
  const chosenProject =
    (projects.includes(project) ? project : "") ||
    baseline?.project ||
    suggestedProject ||
    projects[0] ||
    "";
  const pair = useMemo(
    () => recentProjectPair(source ?? [], chosenProject),
    [source, chosenProject],
  );
  const candidates = useMemo(
    () =>
      (source ?? [])
        .filter(
          (s) =>
            !compare.includes(s.id) &&
            s.project === chosenProject &&
            (s.title + " " + s.id)
              .toLowerCase()
              .includes(query.trim().toLowerCase()),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [source, compare, chosenProject, query],
  );
  const move = (from: number, to: number) => {
    if (to < 0 || to >= sessions.length) return;
    const ids = sessions.map((s) => s.id);
    const [item] = ids.splice(from, 1);
    ids.splice(to, 0, item);
    setOrder(ids);
  };
  const open = (id: string) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set("session", id);
      return next;
    });
  const exportReport = () => {
    const cell = (value: string) =>
      '"' +
      (/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""') +
      '"';
    const rows = [
      ["指标", ...sessions.map((s) => s.title + " · " + s.id)],
      ...metrics.map((m) => [
        m.name,
        ...sessions.map((s) => {
          const value = profiles.get(s.id)![m.key];
          return value === null ? "未知" : String(value);
        }),
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(
        ["\ufeff" + rows.map((row) => row.map(cell).join(",")).join("\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "agentlens-change-analysis.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <PageTitle
        kicker="CHANGE ANALYSIS / 变化分析"
        title="这次工作，哪里变了"
        description="以一段会话为基准，检查单次用量、缓存复用和上下文增长。"
      >
        <button
          className="button"
          disabled={!sessions.length}
          onClick={exportReport}
        >
          <Download size={16} />
          导出分析
        </button>
        <button
          className="button"
          disabled={!sessions.length}
          onClick={clearCompare}
        >
          清空选择
        </button>
      </PageTitle>
      <section className="change-picker" data-region="对比会话选择">
        <div>
          <span className="eyebrow">START WITH A PROJECT</span>
          <h2>同一个项目，回看两次工作。</h2>
          <p>自动选择最近两段记录，以较早的一段作为基准。</p>
        </div>
        <div className="change-picker-actions">
          <label>
            项目
            <select
              aria-label="对比项目"
              value={chosenProject}
              onChange={(e) => setProject(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p} value={p}>
                  {p || "未标记项目"}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button primary"
            disabled={pair.length < 2}
            onClick={() => {
              replaceCompare(pair.map((s) => s.id));
              setOrder([]);
              setBaselineId(pair[0].id);
            }}
          >
            载入最近两次 <ArrowUpRight size={17} />
          </button>
          {pair.length < 2 && <small>这个项目还没有两段可比较的记录</small>}
        </div>
      </section>
      <div className="change-sessions">
        <AnimatePresence mode="popLayout">
          {sessions.map((s, index) => {
            const profile = profiles.get(s.id)!;
            const isBase = s.id === baseline?.id;
            return (
              <motion.article
                layout
                className={`change-session ${isBase ? "is-baseline" : ""} ${drag === s.id ? "is-dragging" : ""}`}
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                draggable
                onDragStartCapture={(e) => {
                  e.dataTransfer.setData("text/plain", s.id);
                  setDrag(s.id);
                }}
                onDragEndCapture={() => setDrag(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = sessions.findIndex(
                    (item) => item.id === e.dataTransfer.getData("text/plain"),
                  );
                  if (from >= 0) move(from, index);
                  setDrag(null);
                }}
              >
                <div className="change-session-top">
                  <ProviderBadge provider={s.provider} />
                  <button
                    className="icon-button"
                    aria-label={`移除对比 ${s.title} ${s.id.slice(-5)}`}
                    onClick={() => toggleCompare(s.id)}
                  >
                    <X size={17} />
                  </button>
                </div>
                <span className="change-session-date">
                  {time(s.updatedAt)} · {s.project}
                </span>
                <h2>{s.title}</h2>
                <div className="change-session-total">
                  <strong>{compact(profile.total)}</strong>
                  <span>累计 Token</span>
                </div>
                <div className="change-session-mini">
                  <span>
                    模型请求 <b>{s.requests.length}</b>
                  </span>
                  <span>
                    缓存命中 <b>{percent(profile.cacheRate)}</b>
                  </span>
                </div>
                <div className="change-session-actions">
                  <button
                    className={
                      isBase ? "baseline-button active" : "baseline-button"
                    }
                    aria-pressed={isBase}
                    onClick={() => setBaselineId(s.id)}
                  >
                    {isBase ? (
                      <Check size={14} />
                    ) : (
                      <GitCompareArrows size={14} />
                    )}{" "}
                    {isBase ? "当前基准" : "设为基准"}
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`将会话 ${s.id.slice(-5)} 左移`}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`将会话 ${s.id.slice(-5)} 右移`}
                    disabled={index === sessions.length - 1}
                    onClick={() => move(index, index + 1)}
                  >
                    <ArrowRight size={15} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label={`打开会话 ${s.title} ${s.id.slice(-5)}`}
                    onClick={() => open(s.id)}
                  >
                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {sessions.length < 3 && (
          <div className="change-add">
            <Plus size={22} />
            <h3>{sessions.length ? "再加入一段记录" : "挑选要分析的记录"}</h3>
            <p>最多三段，可跨 Agent 选择。</p>
            <input
              aria-label="搜索候选会话"
              placeholder="筛选会话标题或 ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              aria-label="加入对比的会话"
              value=""
              onChange={(e) => {
                if (e.target.value) toggleCompare(e.target.value);
              }}
            >
              <option value="">选择 {chosenProject || "项目"} 的记录…</option>
              {candidates.map((s) => (
                <option key={s.id} value={s.id}>
                  {time(s.updatedAt)} · {s.title} · {s.id.slice(-5)}
                </option>
              ))}
            </select>
            {!candidates.length && <small>没有符合筛选的未选记录</small>}
            <Link to="/sessions">
              从完整会话库挑选 <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>
      {sessions.length >= 2 && base && baseline ? (
        <>
          <div className="change-insights" aria-label="相对基准的变化">
            {sessions
              .filter((s) => s.id !== baseline.id)
              .map((s) => {
                const t = profiles.get(s.id)!;
                return (
                  <div key={s.id}>
                    <span>
                      相对基准 · {s.project} / {s.id.slice(-5)}
                    </span>
                    <h3>{s.title}</h3>
                    <div>
                      <p>
                        <small>平均输入用量</small>
                        <strong>
                          {change(t.avgInput, base.avgInput, "token")}
                        </strong>
                      </p>
                      <p>
                        <small>缓存命中变化</small>
                        <strong>
                          {change(t.cacheRate, base.cacheRate, "rate")}
                        </strong>
                      </p>
                    </div>
                    <p className="change-coverage">
                      缓存字段覆盖 {t.cacheKnown} / {t.requests} 次请求；基准{" "}
                      {base.cacheKnown} / {base.requests} 次。
                    </p>
                  </div>
                );
              })}
          </div>
          <Panel
            title="上下文，是怎样增长的"
            eyebrow="CONTEXT SIGNATURE"
            action={
              <div className="change-chart-controls">
                <div className="segment">
                  <button
                    className={alignment === "progress" ? "active" : ""}
                    aria-pressed={alignment === "progress"}
                    onClick={() => setAlignment("progress")}
                  >
                    按会话进度
                  </button>
                  <button
                    className={alignment === "step" ? "active" : ""}
                    aria-pressed={alignment === "step"}
                    onClick={() => setAlignment("step")}
                  >
                    按请求序号
                  </button>
                </div>
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
              </div>
            }
          >
            <ContextChart
              sessions={sessions}
              normalized={normalized}
              alignment={alignment}
            />
            <p className="panel-footnote">
              {alignment === "progress"
                ? "按各自会话的 0%–100% 进度取 101 个位置，读取对应的真实请求，便于比较长短不同的会话。"
                : "按各自第 1、2、3…次请求对齐，短会话结束后不补值。"}{" "}
              未记录上下文上限的请求在比例图中留空。
            </p>
          </Panel>
          <Panel title="规模变化，还是单次用量变化" eyebrow="BASELINE DELTA">
            <div className="change-table-scroll">
              <table className="change-table">
                <thead>
                  <tr>
                    <th>指标</th>
                    {sessions.map((s) => (
                      <th key={s.id}>
                        {s.project}
                        <small>
                          {s.id === baseline.id ? "基准会话" : s.id.slice(-5)}
                        </small>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.key}>
                      <th>{m.name}</th>
                      {sessions.map((s) => {
                        const value = profiles.get(s.id)![m.key];
                        return (
                          <td key={s.id}>
                            <strong>{format(value, m.unit)}</strong>
                            <small>
                              {s.id === baseline.id
                                ? "基准值"
                                : change(value, base[m.key], m.unit)}
                            </small>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="panel-footnote">
              缓存读取属于输入，未重复加进总用量。变化来自记录到的使用结构；不同任务、模型和上下文规模不能作为
              Agent 能力排名。
            </p>
          </Panel>
        </>
      ) : (
        <Empty
          title={
            sessions.length
              ? "再选择一段记录，查看变化"
              : "先选一个项目，开始分析"
          }
          message="载入最近两次工作，或从会话库手动挑选基准和比较对象。"
          action={
            <Link className="button" to="/sessions">
              浏览完整会话库 <ArrowUpRight size={16} />
            </Link>
          }
        />
      )}
    </>
  );
}
