import { useEffect, useMemo, useState } from "react";
import { contextRows } from "../../shared/comparison";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
  ReferenceLine,
} from "recharts";
import { compact, integer } from "../lib/format";
import type { Analytics } from "../../shared/analytics";
import { type Session } from "../../shared/schema";
const chartTheme = {
  backgroundColor: "var(--panel)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  color: "var(--ink)",
  fontSize: 15,
};
export function UsageChart({
  data,
  metric = "total",
  onDay,
}: {
  data: Analytics["daily"];
  metric?: "total" | "input" | "output" | "cache";
  onDay?: (date: string) => void;
}) {
  const [range, setRange] = useState([0, data.length - 1]);
  useEffect(() => setRange([0, data.length - 1]), [data.length]);
  const visible = data.slice(range[0], range[1] + 1);
  return (
    <>
      <div
        className="chart"
        role="img"
        aria-label="每日 Token 用量趋势；下方滑块可缩放时间范围"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={visible}
            margin={{ top: 12, right: 12, left: -10, bottom: 5 }}
            onClick={(state) => {
              if (
                state.activeTooltipIndex !== null &&
                state.activeTooltipIndex !== undefined
              ) {
                const d = visible[Number(state.activeTooltipIndex)];
                if (d) onDay?.(d.date);
              }
            }}
          >
            <defs>
              <linearGradient id="usage-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d0ac82" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d0ac82" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="var(--line)"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: "var(--muted)" }}
              minTickGap={25}
            />
            <YAxis
              tickFormatter={compact}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 14, fill: "var(--muted)" }}
            />
            <Tooltip
              contentStyle={chartTheme}
              formatter={(v) => [integer(Number(v)), "Tokens"]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#d0ac82"
              strokeWidth={3}
              fill="url(#usage-fill)"
              animationDuration={550}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-range">
        <span>{data[range[0]]?.label}</span>
        <input
          type="range"
          aria-label="趋势开始日期"
          aria-valuetext={data[range[0]]?.label}
          min={0}
          max={data.length - 1}
          value={range[0]}
          onChange={(e) =>
            setRange([Math.min(Number(e.target.value), range[1]), range[1]])
          }
        />
        <input
          type="range"
          aria-label="趋势结束日期"
          aria-valuetext={data[range[1]]?.label}
          min={0}
          max={data.length - 1}
          value={range[1]}
          onChange={(e) =>
            setRange([range[0], Math.max(Number(e.target.value), range[0])])
          }
        />
        <span>{data[range[1]]?.label}</span>
      </div>
      <div className="chart-day-shortcuts" aria-label="选择日期查看会话">
        {visible.map((d) => (
          <button
            key={d.date}
            onClick={() => onDay?.(d.date)}
            aria-label={`查看 ${d.label} 的会话`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </>
  );
}
export function ContextChart({
  sessions,
  normalized = false,
  syncId,
  selectedStep,
  onStep,
  alignment = "step",
}: {
  sessions: Session[];
  normalized?: boolean;
  syncId?: string;
  selectedStep?: number;
  onStep?: (step: number) => void;
  alignment?: "step" | "progress";
}) {
  const size = Math.max(0, ...sessions.map((s) => s.requests.length));
  const data = useMemo(
    () => contextRows(sessions, normalized, alignment),
    [sessions, normalized, alignment],
  );
  return (
    <div
      className="chart context-chart"
      role="img"
      aria-label={
        alignment === "progress"
          ? "按会话进度绘制输入上下文大小"
          : "按请求序号绘制输入上下文大小"
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          syncId={syncId}
          onClick={(state) => {
            if (
              state.activeTooltipIndex !== null &&
              state.activeTooltipIndex !== undefined
            )
              onStep?.(
                alignment === "progress"
                  ? Math.floor(
                      (Number(state.activeTooltipIndex) / 100) *
                        Math.max(0, size - 1),
                    ) + 1
                  : Number(state.activeTooltipIndex) + 1,
              );
          }}
          margin={{ top: 15, left: -15, right: 20 }}
        >
          <CartesianGrid
            stroke="var(--line)"
            vertical={false}
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="step"
            tickFormatter={(v) =>
              alignment === "progress" ? `${v}%` : String(v)
            }
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 14, fill: "var(--muted)" }}
          />
          <YAxis
            tickFormatter={(v) => (normalized ? `${v}%` : compact(v))}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 14, fill: "var(--muted)" }}
          />
          <Tooltip
            contentStyle={chartTheme}
            labelFormatter={(v) =>
              alignment === "progress" ? `会话进度 ${v}%` : `第 ${v} 次模型请求`
            }
            formatter={(v) =>
              normalized ? `${Number(v).toFixed(1)}%` : integer(Number(v))
            }
          />
          <Legend wrapperStyle={{ fontSize: 14, paddingTop: 8 }} />
          {selectedStep && (
            <ReferenceLine
              x={selectedStep}
              stroke="#d0ac82"
              strokeDasharray="4 4"
            />
          )}
          {sessions.map((s, index) => (
            <Line
              key={s.id}
              dataKey={`series${index}`}
              name={`${s.project} · ${s.id.slice(-5)}`}
              stroke={["#d0ac82", "#9cbe9b", "#8aa9bd"][index % 3]}
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              isAnimationActive={size < 500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
