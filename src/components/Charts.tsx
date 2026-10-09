import { useEffect, useState } from "react";
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
import { providerColors, type Session } from "../../shared/schema";
const chartTheme = {
  backgroundColor: "#242730",
  border: "1px solid #40434c",
  borderRadius: 12,
  color: "#fff",
  fontSize: 13,
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
                <stop offset="0%" stopColor="#a9d7b7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a9d7b7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              stroke="#2a3031"
              strokeDasharray="3 5"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8a8995" }}
              minTickGap={25}
            />
            <YAxis
              tickFormatter={compact}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8a8995" }}
            />
            <Tooltip
              contentStyle={chartTheme}
              formatter={(v) => [integer(Number(v)), "Tokens"]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#a9d7b7"
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
}: {
  sessions: Session[];
  normalized?: boolean;
  syncId?: string;
  selectedStep?: number;
  onStep?: (step: number) => void;
}) {
  const size = Math.max(0, ...sessions.map((s) => s.requests.length));
  const data = Array.from({ length: size }, (_, i) =>
    Object.fromEntries([
      ["step", i + 1],
      ...sessions.map((s) => {
        const r = s.requests[i];
        return [
          s.id,
          r
            ? normalized
              ? r.contextLimit
                ? (r.input / r.contextLimit) * 100
                : null
              : r.input
            : null,
        ];
      }),
    ]),
  );
  return (
    <div
      className="chart context-chart"
      role="img"
      aria-label="按请求序号绘制输入上下文大小"
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
              onStep?.(Number(state.activeTooltipIndex) + 1);
          }}
          margin={{ top: 15, left: -15, right: 20 }}
        >
          <CartesianGrid
            stroke="#2a3031"
            vertical={false}
            strokeDasharray="3 5"
          />
          <XAxis
            dataKey="step"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#a5b19e" }}
          />
          <YAxis
            tickFormatter={(v) => (normalized ? `${v}%` : compact(v))}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#a5b19e" }}
          />
          <Tooltip
            contentStyle={chartTheme}
            formatter={(v) =>
              normalized ? `${Number(v).toFixed(1)}%` : integer(Number(v))
            }
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          {selectedStep && (
            <ReferenceLine
              x={selectedStep}
              stroke="#e8a97d"
              strokeDasharray="4 4"
            />
          )}
          {sessions.map((s) => (
            <Line
              key={s.id}
              dataKey={s.id}
              name={`${s.project} · ${s.id.slice(-5)}`}
              stroke={providerColors[s.provider]}
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
