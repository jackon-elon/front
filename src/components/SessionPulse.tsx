import { memo, useMemo } from "react";
import { recordBins } from "../../shared/experience";
import type { UsageRequest } from "../../shared/schema";
import { compact } from "../lib/format";

export const SessionPulse = memo(function SessionPulse({
  requests,
  active,
  onSelect,
}: {
  requests: UsageRequest[];
  active: number;
  onSelect: (index: number) => void;
}) {
  const bins = useMemo(() => recordBins(requests, 48), [requests]);
  const peak = Math.max(1, ...bins.map((b) => b.input + b.output));
  return (
    <div className="x-pulse" data-region="会话用量轨迹">
      <div className="x-pulse-heading">
        <span>会话用量轨迹</span>
        <span>
          每段 {requests.length > 48 ? "聚合请求" : "一次请求"} · 输入 + 输出
        </span>
      </div>
      <div className="x-pulse-bars">
        {bins.map((b, i) => (
          <button
            key={i}
            className={active >= b.first && active <= b.last ? "active" : ""}
            aria-label={`查看第 ${b.first + 1}${b.last > b.first ? ` 至 ${b.last + 1}` : ""} 次请求，用量 ${compact(b.input + b.output)} Token`}
            aria-pressed={active >= b.first && active <= b.last}
            onClick={() => onSelect(b.first)}
            title={`请求 ${b.first + 1}–${b.last + 1} · ${compact(b.input + b.output)} Token`}
          >
            <i
              style={{
                height: `${Math.max(8, ((b.input + b.output) / peak) * 100)}%`,
              }}
            />
          </button>
        ))}
        {!bins.length && <span>尚无请求记录</span>}
      </div>
      <div className="x-pulse-caption">
        <span>会话开始</span>
        <span>最近一次调用</span>
      </div>
    </div>
  );
});
