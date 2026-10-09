import {
  useCallback,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowUpRight,
  Layers,
  List,
  Search,
  Activity,
  GitCompareArrows,
  SlidersHorizontal,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  providerNames,
  sessionTotals,
  type Provider,
  type Session,
} from "../../shared/schema";
import { useApp } from "../state/AppContext";
import { compact, time } from "../lib/format";
import { SignalRecord } from "../components/SignalRecord";
import { SessionGallery } from "../components/SessionGallery";
import { RequestPlayback } from "../components/RequestPlayback";
import { SessionPulse } from "../components/SessionPulse";

const emptySessions: Session[] = [];
const providers: Provider[] = ["codex", "claude", "workbuddy"];

export default function Experience({
  animations = true,
}: {
  animations?: boolean;
}) {
  const { snapshot, mode, connected, checkedAt, eventCount } = useApp();
  const [, setParams] = useSearchParams();
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<{
    sessionId: string | null;
    index: number;
  }>({ sessionId: null, index: 0 });
  const [spread, setSpread] = useState(false);
  const [direction, setDirection] = useState(1);
  const hero = useRef<HTMLElement>(null);
  const systemReduced = useReducedMotion();
  const reduced = systemReduced || !animations;
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const recordRotate = useTransform(scrollYProgress, [0, 1], [-8, 16]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const tiltX = useSpring(my, { stiffness: 100, damping: 22 });
  const tiltY = useSpring(mx, { stiffness: 100, damping: 22 });
  const sourceSessions = snapshot?.sessions ?? emptySessions;
  const catalog = useMemo(() => {
    const totals = new Map<string, ReturnType<typeof sessionTotals>>();
    const counts: Record<Provider, number> = {
      codex: 0,
      claude: 0,
      workbuddy: 0,
    };
    for (const session of sourceSessions) {
      totals.set(session.id, sessionTotals(session));
      counts[session.provider]++;
    }
    return { totals, counts };
  }, [sourceSessions]);
  const searchText = deferred.trim().toLowerCase();
  const sessions = useMemo(
    () =>
      sourceSessions
        .filter(
          (s) =>
            (provider === "all" || s.provider === provider) &&
            `${s.title} ${s.project}`.toLowerCase().includes(searchText),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [sourceSessions, provider, searchText],
  );
  const index = Math.max(
    0,
    sessions.findIndex((s) => s.id === selectedId),
  );
  const active = sessions[index];
  const activeId = active?.id;
  const safeRequestIndex = Math.min(
    cursor.sessionId === activeId ? cursor.index : 0,
    Math.max(0, (active?.requests.length ?? 1) - 1),
  );
  const total = useMemo(
    () =>
      sessions.reduce(
        (sum, s) => sum + (catalog.totals.get(s.id)?.total ?? 0),
        0,
      ),
    [sessions, catalog],
  );
  const request = active?.requests[safeRequestIndex];
  const requestCount = useMemo(
    () => sessions.reduce((sum, s) => sum + s.requests.length, 0),
    [sessions],
  );
  const selectSession = useCallback((id: string) => {
    setSelectedId(id);
    setCursor({ sessionId: id, index: 0 });
  }, []);
  const selectRequest = useCallback(
    (nextIndex: number) => {
      if (!activeId) return;
      setSelectedId(activeId);
      setCursor({ sessionId: activeId, index: nextIndex });
    },
    [activeId],
  );
  const move = useCallback(
    (step: number) => {
      if (!sessions.length) return;
      setDirection(step);
      selectSession(
        sessions[(index + step + sessions.length) % sessions.length].id,
      );
    },
    [index, sessions, selectSession],
  );
  const jump = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  const open = useCallback(
    (id: string) =>
      setParams((p) => {
        const next = new URLSearchParams(p);
        next.set("session", id);
        return next;
      }),
    [setParams],
  );
  return (
    <div className="experience">
      <nav className="x-chapters" aria-label="体验章节">
        <button onClick={() => jump("signal")}>
          01<span>信号</span>
        </button>
        <button onClick={() => jump("archive")}>
          02<span>展册</span>
        </button>
        <button disabled={!active} onClick={() => jump("breakdown")}>
          03<span>拆解</span>
        </button>
      </nav>
      <section
        ref={hero}
        className="x-hero"
        id="signal"
        data-region="首屏信号唱片"
      >
        <div className="x-hero-sticky">
          <div className="x-hero-kicker">
            <span>AGENTLENS / ACTIVITY ARCHIVE</span>
            <span>CODEX · CLAUDE CODE · WORKBUDDY</span>
          </div>
          <div className="x-hero-grid">
            <motion.div className="x-hero-title">
              <span className="x-eyebrow">THE WORK BEHIND THE WINDOW</span>
              <h1>
                BEHIND
                <br />
                <span>THE PROMPT.</span>
              </h1>
              <p>
                每一次调用，都留下自己的纹路。
                <br />
                从上下文增长到缓存复用，看见智能协作的全貌。
              </p>
              <div className="x-hero-actions">
                <button
                  className="x-round-link"
                  onClick={() => jump("archive")}
                >
                  探索会话 <ArrowDown size={20} />
                </button>
                <Link className="x-text-link" to="/workspace">
                  实时工作台 <ArrowUpRight size={19} />
                </Link>
              </div>
              <div className="x-hero-stats" data-region="已记录用量概览">
                <div>
                  <strong>{compact(sessions.length)}</strong>
                  <span>已记录会话</span>
                </div>
                <div>
                  <strong>{compact(requestCount)}</strong>
                  <span>模型调用</span>
                </div>
                <div>
                  <strong>{compact(total)}</strong>
                  <span>累计 Token</span>
                </div>
              </div>
            </motion.div>
            <div className="x-record-composition">
              <span className="x-record-caption">
                THE SESSION, PRESSED IN DATA.
              </span>
              <motion.div
                className="x-record-stage"
                data-region="可交互信号唱片"
                style={
                  reduced
                    ? {}
                    : { rotate: recordRotate, rotateX: tiltX, rotateY: tiltY }
                }
                onPointerMove={(e) => {
                  if (reduced || e.pointerType !== "mouse") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  mx.set(((e.clientX - r.left) / r.width) * 10 - 5);
                  my.set(5 - ((e.clientY - r.top) / r.height) * 10);
                }}
                onPointerLeave={() => {
                  mx.set(0);
                  my.set(0);
                }}
              >
                <SignalRecord
                  requests={active?.requests ?? []}
                  active={safeRequestIndex}
                  onSelect={active?.requests.length ? selectRequest : undefined}
                />
              </motion.div>
              <div className="x-record-label">
                <span>
                  {active ? providerNames[active.provider] : "等待连接"}{" "}
                  <i>正在查看</i>
                </span>
                <strong>{active?.title ?? "当前数据源没有会话"}</strong>
                <p>
                  {request
                    ? `第 ${safeRequestIndex + 1} 次模型请求 · 共 ${active.requests.length} 次`
                    : "连接日志后生成请求图形"}
                </p>
                <div>
                  <span>{request ? time(request.time) : "—"}</span>
                  <b>
                    {request ? compact(request.input + request.output) : "—"}{" "}
                    <small>Token</small>
                  </b>
                </div>
                {active && (
                  <button onClick={() => open(active.id)}>
                    查看会话明细 <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          {active && (
            <SessionPulse
              requests={active.requests}
              active={safeRequestIndex}
              onSelect={selectRequest}
            />
          )}
          <div className="x-hero-bottom">
            <div>
              <span className={`x-live-dot ${connected ? "connected" : ""}`} />
              {mode === "local"
                ? connected
                  ? "本机实时监听"
                  : "本机等待连接"
                : mode === "demo"
                  ? "演示 · 虚构数据"
                  : "导入 · 历史记录"}
              <small>
                {mode === "local"
                  ? `新增 ${eventCount} 条 · ${checkedAt ? new Date(checkedAt).toLocaleTimeString("zh-CN") : "等待扫描"}`
                  : "所有指标来自当前数据源"}
              </small>
            </div>
            <span>
              探索更多记录 <ArrowDown size={17} />
            </span>
          </div>
        </div>
      </section>
      <section className="x-archive" id="archive" data-region="交互会话展册">
        <div className="x-section-label">
          <span>SESSION COLLECTION / 会话收藏馆</span>
          <span>
            {sessions.length} 段会话 · {compact(total)} Token
          </span>
        </div>
        <div className="x-archive-heading">
          <h2>
            每一段工作，<em>都有迹可循。</em>
          </h2>
          <p>
            拾起一张唱片，回看一次协作。
            <br />
            展开、筛选，或沿时间轴逐次回放。
          </p>
          <Link
            to="/sessions"
            className="x-circle-button"
            aria-label="检索所有会话"
          >
            <ArrowUpRight size={32} />
          </Link>
        </div>
        <div className="x-gallery-controls">
          <div role="group" aria-label="筛选 Agent">
            {(["all", ...providers] as const).map((p) => (
              <button
                key={p}
                aria-pressed={provider === p}
                onClick={() => {
                  setProvider(p);
                  setSelectedId(null);
                }}
              >
                {p === "all" ? "全部" : providerNames[p]}
                <small>
                  {p === "all" ? sourceSessions.length : catalog.counts[p]}
                </small>
              </button>
            ))}
          </div>
          <label>
            <Search size={19} />
            <input
              aria-label="筛选展册会话"
              placeholder="搜索会话或项目"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className="x-spread-toggle"
            aria-pressed={spread}
            onClick={() => setSpread((v) => !v)}
          >
            {spread ? <Layers size={20} /> : <List size={20} />}{" "}
            {spread ? "叠放" : "展开"}
          </button>
        </div>
        {active ? (
          <SessionGallery
            sessions={sessions}
            active={active}
            index={index}
            spread={spread}
            direction={direction}
            totalsById={catalog.totals}
            onMove={move}
            onSelect={selectSession}
            onOpen={open}
          />
        ) : (
          <div className="x-no-signal">
            <h3>这里还没有唱片。</h3>
            <p>试试其他 Agent，或在数据源页面连接本机日志。</p>
            <Link to="/sources">
              管理数据源 <ArrowUpRight />
            </Link>
          </div>
        )}
      </section>
      {active && (
        <RequestPlayback
          key={active.id}
          session={active}
          index={safeRequestIndex}
          onIndex={selectRequest}
        />
      )}
      <section className="x-finale" data-region="深入分析入口">
        <div className="x-section-label">
          <span>THE NEXT LAYER / 深入分析</span>
          <span>同一份记录，三种视角</span>
        </div>
        <div className="x-finale-heading">
          <h2>从看见，到理解。</h2>
          <p>追踪用量、找出变化，把记录变成可操作的线索。</p>
        </div>
        <div className="x-destinations">
          {[
            {
              to: "/workspace",
              icon: Activity,
              kicker: "LIVE OBSERVATORY",
              title: "实时观测",
              copy: "查看每日用量、时间桶与 Agent 分布，定位一次用量高峰。",
            },
            {
              to: "/sessions",
              icon: SlidersHorizontal,
              kicker: "SESSION LIBRARY",
              title: "记录检索",
              copy: "搜索模型、项目和标签，保存筛选视图，展开原始请求指标。",
            },
            {
              to: "/compare",
              icon: GitCompareArrows,
              kicker: "CHANGE ANALYSIS",
              title: "变化分析",
              copy: "以一段会话为基准，比较每次请求用量、缓存命中与上下文增长。",
            },
          ].map((item) => (
            <Link to={item.to} key={item.to}>
              <item.icon size={26} />
              <span>{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
              <ArrowUpRight className="x-destination-arrow" size={24} />
            </Link>
          ))}
        </div>
      </section>
      <footer className="x-footer">
        <strong>
          agentlens<span>®</span>
        </strong>
        <span>REACT / LOCAL FIRST / OPEN SOURCE</span>
        <a
          href="https://github.com/jackon-elon/front"
          target="_blank"
          rel="noreferrer"
        >
          SOURCE CODE <ArrowUpRight size={18} />
        </a>
      </footer>
      <span className="sr-only" aria-live="polite">
        当前选择：{active?.title ?? "无会话"}，请求{" "}
        {request ? safeRequestIndex + 1 : 0}
      </span>
    </div>
  );
}
