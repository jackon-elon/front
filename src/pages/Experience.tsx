import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  GitCompareArrows,
  Layers,
  List,
  Pause,
  Play,
  Search,
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
import "../experience.css";

const providers: Provider[] = ["codex", "claude", "workbuddy"];
const number = (value: number) => String(value).padStart(2, "0");

function Playback({
  session,
  index,
  onIndex,
}: {
  session: Session;
  index: number;
  onIndex: (index: number) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const request =
    session.requests[Math.min(index, session.requests.length - 1)];
  const peak = useMemo(
    () =>
      session.requests.reduce(
        (largest, r) => Math.max(largest, r.input, r.output),
        1,
      ),
    [session.requests],
  );
  useEffect(() => {
    setPlaying(false);
  }, [session.id]);
  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => {
      if (index >= session.requests.length - 1) setPlaying(false);
      else onIndex(index + 1);
    }, 900);
    return () => window.clearInterval(interval);
  }, [playing, index, session.requests.length, onIndex]);
  return (
    <section
      className="x-breakdown"
      id="breakdown"
      data-region="请求回放与数据拆解"
    >
      <div className="x-section-label">
        <span>03 / UNDER THE SURFACE</span>
        <span>REQUEST PLAYBACK</span>
      </div>
      <div className="x-breakdown-grid">
        <div className="x-breakdown-copy">
          <h2>
            一次调用，
            <br />
            拆开来看<span>↘</span>
          </h2>
          <p>输入、输出、缓存。沿时间轴回放，观察每一步到底发生了什么。</p>
          <div className="x-playback-meta">
            <span>{providerNames[session.provider]}</span>
            <strong>{session.title}</strong>
            <small>
              {request ? time(request.time) : "暂无请求"} ·{" "}
              {request?.model ?? "—"}
            </small>
          </div>
          <Link
            className="x-text-link"
            to={`/?session=${encodeURIComponent(session.id)}`}
          >
            展开完整请求记录 <ArrowUpRight />
          </Link>
        </div>
        <div
          className="x-bar-scene"
          role="img"
          aria-label={
            request
              ? `请求 ${index + 1}：输入 ${request.input}，输出 ${request.output}，缓存读取 ${request.cacheRead ?? "未知"}`
              : "暂无请求"
          }
        >
          {[
            {
              name: "INPUT",
              label: "输入",
              value: request?.input,
              color: "#f95735",
            },
            {
              name: "OUTPUT",
              label: "输出",
              value: request?.output,
              color: "#f1ebde",
            },
            {
              name: "CACHE READ",
              label: "缓存读取",
              value: request?.cacheRead,
              color: "#777d6b",
            },
          ].map((item) => (
            <div className="x-tower" key={item.name}>
              <strong>{item.value == null ? "—" : compact(item.value)}</strong>
              <div className="x-tower-track">
                <motion.div
                  style={{ backgroundColor: item.color }}
                  animate={{
                    height: `${item.value == null || item.value === 0 ? 0 : Math.max(1, Math.min(100, (item.value / peak) * 100))}%`,
                  }}
                  transition={{ type: "spring", stiffness: 110, damping: 25 }}
                >
                  <i />
                  <i />
                  <i />
                </motion.div>
              </div>
              <span>
                {item.name}
                <small>{item.label}</small>
              </span>
            </div>
          ))}
          <span className="x-cache-note">
            缓存读取是输入的一部分，未额外计入 Token 总量。
          </span>
        </div>
      </div>
      <div className="x-player">
        <button
          aria-label={playing ? "暂停回放" : "播放请求回放"}
          disabled={!session.requests.length}
          onClick={() => {
            if (!playing && index >= session.requests.length - 1) onIndex(0);
            setPlaying((v) => !v);
          }}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <span>
          {number(index + 1)}
          <small> / {number(session.requests.length)}</small>
        </span>
        <input
          type="range"
          aria-label="回放请求"
          min="0"
          max={Math.max(0, session.requests.length - 1)}
          value={index}
          disabled={!session.requests.length}
          onChange={(e) => {
            setPlaying(false);
            onIndex(Number(e.target.value));
          }}
        />
        <span className="x-player-status">
          {playing ? "PLAYING" : "SCRUB TO EXPLORE"}
        </span>
      </div>
    </section>
  );
}

export default function Experience({
  animations = true,
}: {
  animations?: boolean;
}) {
  const {
    snapshot,
    mode,
    connected,
    checkedAt,
    compare,
    toggleCompare,
    eventCount,
  } = useApp();
  const [, setParams] = useSearchParams();
  const [provider, setProvider] = useState<Provider | "all">("all");
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [requestIndex, setRequestIndex] = useState(0);
  const [spread, setSpread] = useState(false);
  const [direction, setDirection] = useState(1);
  const hero = useRef<HTMLElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
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
  const sessions = useMemo(
    () =>
      (snapshot?.sessions ?? [])
        .filter(
          (s) =>
            (provider === "all" || s.provider === provider) &&
            `${s.title} ${s.project}`
              .toLowerCase()
              .includes(deferred.toLowerCase()),
        )
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [snapshot, provider, deferred],
  );
  const index = Math.max(
    0,
    sessions.findIndex((s) => s.id === selectedId),
  );
  const active = sessions[index];
  const activeId = active?.id;
  useEffect(() => {
    setRequestIndex(0);
  }, [activeId]);
  const safeRequestIndex = Math.min(
    requestIndex,
    Math.max(0, (active?.requests.length ?? 1) - 1),
  );
  const total = useMemo(
    () => sessions.reduce((sum, s) => sum + sessionTotals(s).total, 0),
    [sessions],
  );
  const request = active?.requests[safeRequestIndex];
  const move = (step: number) => {
    if (!sessions.length) return;
    setDirection(step);
    setSelectedId(
      sessions[(index + step + sessions.length) % sessions.length].id,
    );
  };
  const jump = (id: string) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  const open = (id: string) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      next.set("session", id);
      return next;
    });
  const gallerySessions = sessions.slice(
    Math.max(0, index - 2),
    Math.max(0, index - 2) + 6,
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
              onSelect={setRequestIndex}
            />
          </motion.div>
          <div className="x-record-label">
            <span className="x-cross">+</span>
            <span>
              01—{number(active?.requests.length ?? 0)} / SIGNAL RECORD
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
                  {p === "all"
                    ? (snapshot?.sessions.length ?? 0)
                    : (snapshot?.sessions.filter((s) => s.provider === p)
                        .length ?? 0)}
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
          <>
            <div
              ref={gallery}
              className={`x-gallery ${spread ? "is-spread" : ""}`}
              tabIndex={0}
              role="region"
              aria-label="会话唱片展册，方向键切换"
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  move(e.key === "ArrowRight" ? 1 : -1);
                }
              }}
            >
              <div className="x-gallery-floor" aria-hidden="true" />
              <AnimatePresence initial={false} mode="popLayout">
                {(spread
                  ? gallerySessions
                  : [
                      sessions[(index + 2) % sessions.length],
                      sessions[(index + 1) % sessions.length],
                      active,
                    ].filter(
                      (s, i, a) => a.findIndex((v) => v.id === s.id) === i,
                    )
                ).map((s, i) => {
                  const selected = s.id === active.id;
                  const totals = sessionTotals(s);
                  const offset = spread
                    ? i - gallerySessions.findIndex((s) => s.id === active.id)
                    : selected
                      ? 0
                      : i === 0
                        ? -1
                        : 1;
                  return (
                    <motion.article
                      className={`x-vinyl-card ${selected ? "selected" : ""}`}
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
                          move(info.offset.x < 0 ? 1 : -1);
                      }}
                    >
                      <button
                        className="x-card-select"
                        aria-label={`${selected ? "查看" : "选择"}会话：${s.title}`}
                        onClick={() =>
                          selected ? open(s.id) : setSelectedId(s.id)
                        }
                      >
                        <div className="x-card-top">
                          <span>{providerNames[s.provider]}</span>
                          <span>
                            REC.{" "}
                            {number(
                              sessions.findIndex((v) => v.id === s.id) + 1,
                            )}
                          </span>
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
                {spread
                  ? "点击一张唱片，选择会话"
                  : "拖动前景唱片，或使用方向键切换"}
              </span>
              <div>
                <button aria-label="上一张唱片" onClick={() => move(-1)}>
                  <ArrowLeft />
                </button>
                <strong>
                  {number(index + 1)}
                  <small> / {number(sessions.length)}</small>
                </strong>
                <button aria-label="下一张唱片" onClick={() => move(1)}>
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
        <Playback
          session={active}
          index={safeRequestIndex}
          onIndex={setRequestIndex}
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
        当前选择：{active?.title ?? "无会话"}，请求 {safeRequestIndex + 1}
      </span>
    </div>
  );
}
