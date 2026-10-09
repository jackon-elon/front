import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { providerNames, type Session } from "../../shared/schema";
import { compact, time } from "../lib/format";

export function RequestPlayback({
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
        <span>REQUEST REPLAY / 请求回放</span>
        <span>一次模型调用，三个指标</span>
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
              color: "#c9a47b",
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
              color: "#91aba7",
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
            if (!playing)
              onIndex(index >= session.requests.length - 1 ? 0 : index);
            setPlaying((v) => !v);
          }}
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <span>
          <small>模型请求</small> {request ? index + 1 : 0}
          <small> / 共 {session.requests.length} 次</small>
        </span>
        <input
          type="range"
          aria-label="回放请求"
          min="0"
          max={Math.max(0, session.requests.length - 1)}
          value={index}
          aria-valuetext={`第 ${request ? index + 1 : 0} 次模型请求，共 ${session.requests.length} 次`}
          disabled={!session.requests.length}
          onChange={(e) => {
            setPlaying(false);
            onIndex(Number(e.target.value));
          }}
        />
        <span className="x-player-status">
          {playing ? "自动回放中" : "拖动查看每次调用"}
        </span>
      </div>
    </section>
  );
}
