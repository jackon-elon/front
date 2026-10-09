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
import { ArrowDown, ArrowUpRight, Layers, List, Search } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  providerNames,
  sessionTotals,
  type Provider,
  type Session,
} from "../../shared/schema";
import { useApp } from "../state/AppContext";
import { compact } from "../lib/format";
import { SignalRecord } from "../components/SignalRecord";
import { SessionGallery } from "../components/SessionGallery";
import { RequestPlayback } from "../components/RequestPlayback";

const emptySessions: Session[] = [];
const providers: Provider[] = ["codex", "claude", "workbuddy"];
const number = (value: number) => String(value).padStart(2, "0");

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
  const titleX = useTransform(scrollYProgress, [0, 0.7], ["0%", "-15%"]);
  const recordRotate = useTransform(scrollYProgress, [0, 1], [-18, 35]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.5, 0.85], [1, 1, 0]);
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
  const selectSession = useCallback((id: string) => setSelectedId(id), []);
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
      setSelectedId(
        sessions[(index + step + sessions.length) % sessions.length].id,
      );
    },
    [index, sessions],
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
            <span>AGENT ACTIVITY, IN A DIFFERENT FORM.</span>
            <span>OPEN SOURCE / EST. 2026</span>
          </div>
          <motion.div
            className="x-hero-title"
            style={reduced ? {} : { x: titleX, opacity: titleOpacity }}
          >
            <h1>
              BEHIND
              <br />
              <span>EVERY</span>
              <br />
              PROMPT<span className="x-star">✳</span>
            </h1>
            <p>
              看见 AI 工作的另一面。
              <br />
              从一次调用，到完整的工作轨迹。
            </p>
            <button className="x-round-link" onClick={() => jump("archive")}>
              进入会话展册 <ArrowDown size={22} />
            </button>
          </motion.div>
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
            <span className="x-cross">+</span>
            <span>
              {active?.requests.length
                ? `01—${number(active.requests.length)}`
                : "NO REQUESTS"}{" "}
              / SIGNAL RECORD
            </span>
            <strong>
              {active ? providerNames[active.provider] : "NO SIGNAL"}
            </strong>
            <p>
              {active?.title ?? "当前数据源没有会话"}
              <br />
              {request
                ? `#${number(safeRequestIndex + 1)} · ${compact(request.input + request.output)} TOKENS`
                : "连接日志后生成请求图形"}
            </p>
          </div>
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
                  : "当前唱片由会话 Token 记录生成"}
              </small>
            </div>
            <span>
              SCROLL TO CHANGE THE SCENE <ArrowDown size={17} />
            </span>
          </div>
        </div>
      </section>
      <div className="x-ticker" aria-hidden="true">
        <span>CODEX</span>
        <i>↗</i>
        <span>CLAUDE CODE</span>
        <i>↗</i>
        <span>WORKBUDDY</span>
        <i>↗</i>
        <span>BEHIND EVERY PROMPT</span>
        <i>↗</i>
      </div>
      <section className="x-archive" id="archive" data-region="交互会话展册">
        <div className="x-section-label">
          <span>02 / SELECTED SESSIONS</span>
          <span>
            {number(sessions.length)} RECORDS — {compact(total)} TOKENS
          </span>
        </div>
        <div className="x-archive-heading">
          <h2>
            工作，
            <br />
            <em>有迹可循。</em>
          </h2>
          <p>
            每张唱片，对应一段会话记录。
            <br />
            切换、展开、拖动，走进其中一段。
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
      <section className="x-finale" data-region="全功能工作区入口">
        <span>KEEP EXPLORING / 04</span>
        <Link to="/sessions">
          深入
          <br />
          工作现场。
          <ArrowUpRight />
        </Link>
        <div>
          <p>
            检索会话、联动图表、比较 Agent、标注记录。
            <br />
            所有操作，都连接同一份数据。
          </p>
          <Link to="/workspace">
            打开实时工作台 <ArrowUpRight />
          </Link>
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
