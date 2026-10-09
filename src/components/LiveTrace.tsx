import { useId, useState } from "react";
import { compact, integer } from "../lib/format";
import { requestTimeline } from "../../shared/live";
import type { Session } from "../../shared/schema";

export function LiveTrace({
  sessions,
  end,
  minutes,
  onSelect,
}: {
  sessions: Session[];
  end: number;
  minutes: number;
  onSelect: (ids: string[]) => void;
}) {
  const bins = requestTimeline(sessions, end, minutes);
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const peak = Math.max(1, ...bins.map((b) => b.input + b.output));
  const total = bins.reduce((sum, b) => sum + b.input + b.output, 0);
  const count = bins.reduce((sum, b) => sum + b.count, 0);
  const selected = hover === null ? null : bins[hover];
  const points = bins.map((b, i) => [
    i * 20 + 9,
    205 - ((b.input + b.output) / peak) * 166,
  ]);
  // Quadratic midpoint interpolation stays between adjacent real bucket values.
  const curve =
    points.reduce((path, p, i) => {
      if (!i) return `M${p[0]} ${p[1]}`;
      const previous = points[i - 1];
      return `${path} Q${previous[0]} ${previous[1]} ${(previous[0] + p[0]) / 2} ${(previous[1] + p[1]) / 2}`;
    }, "") + ` L${points.at(-1)![0]} ${points.at(-1)![1]}`;
  const clock = (t: number) =>
    new Date(t).toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <div className="trace-viz" data-region="实时请求时间线">
      <div className="trace-readout">
        <strong>
          {compact(selected ? selected.input + selected.output : total)}
          <small> TOKENS</small>
        </strong>
        <span>
          {selected
            ? `${clock(selected.time)} · ${selected.count} 次请求`
            : `最近 ${minutes} 分钟 · ${count} 次请求`}
        </span>
      </div>
      <div className="trace-canvas">
        <svg
          viewBox="0 0 960 220"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`trace-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#8199ff" stopOpacity=".85" />
              <stop offset="1" stopColor="#8199ff" stopOpacity=".05" />
            </linearGradient>
          </defs>
          {[40, 95, 150, 205].map((y) => (
            <path
              key={y}
              d={`M0 ${y}H960`}
              stroke="#303850"
              strokeDasharray="2 5"
            />
          ))}
          {!!count && (
            <path
              d={`${curve} L949 205 L9 205 Z`}
              fill={`url(#trace-${id})`}
              opacity=".35"
            />
          )}
          {!!count && (
            <path
              d={curve}
              stroke="#b2c1ff"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          )}
          {bins.map((b, i) => {
            const height = Math.max(
              b.count ? 4 : 1,
              ((b.input + b.output) / peak) * 166,
            );
            const outputHeight = (b.output / peak) * 166;
            return (
              <g
                key={b.time}
                opacity={hover === null || hover === i ? 1 : 0.35}
              >
                <rect
                  x={i * 20 + 3}
                  y={205 - height}
                  width="12"
                  height={height}
                  rx="2"
                  fill="#8199ff"
                  opacity=".5"
                />
                {!!b.output && (
                  <rect
                    x={i * 20 + 3}
                    y={205 - outputHeight}
                    width="12"
                    height={Math.max(2, outputHeight)}
                    rx="1"
                    fill="#d1ee91"
                  />
                )}
              </g>
            );
          })}
          {hover !== null && (
            <path
              d={`M${hover * 20 + 9} 12V210`}
              stroke="#d1ee91"
              strokeDasharray="3 5"
            />
          )}
        </svg>
        <span className="trace-peak">{count ? compact(peak) : "—"} / 桶</span>
        <div className="trace-hit-grid" onMouseLeave={() => setHover(null)}>
          {bins.map((b, i) => (
            <button
              key={b.time}
              aria-label={`${clock(b.time)}，${b.count} 次请求，${integer(b.input + b.output)} tokens`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect(b.sessionIds)}
            />
          ))}
        </div>
        {!count && (
          <div className="trace-empty">
            这个时间段没有新增用量记录
            <span>连接保持开启，等待 Agent 写入下一条日志。</span>
          </div>
        )}
      </div>
      <div className="trace-axis">
        <span>{clock(end - minutes * 60_000)}</span>
        <span>{clock(end - minutes * 30_000)}</span>
        <span>{clock(end)}</span>
      </div>
      <div className="trace-legend">
        <span>
          <i />
          输入
        </span>
        <span>
          <i />
          输出
        </span>
        <small>曲线为总量 · 点击筛选会话</small>
      </div>
    </div>
  );
}
