import { memo, useId, useMemo } from "react";
import type { UsageRequest } from "../../shared/schema";
import { recordBins, recordSector } from "../../shared/experience";

/** Layered vinyl material; the outer marks encode chronological request bins. */
export const SignalRecord = memo(function SignalRecord({
  requests,
  active = 0,
  onSelect,
  miniature = false,
}: {
  requests: UsageRequest[];
  active?: number;
  onSelect?: (index: number) => void;
  miniature?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const bins = useMemo(() => recordBins(requests), [requests]);
  const peak = Math.max(1, ...bins.map((b) => b.input + b.output));
  const grooves = useMemo(
    () =>
      Array.from(
        { length: miniature ? 48 : 86 },
        (_, i) => 75 + i * (miniature ? 3.4 : 1.9),
      ),
    [miniature],
  );
  const activeBin = Math.max(
    0,
    bins.findIndex((b) => active >= b.first && active <= b.last),
  );
  const angle =
    (activeBin / Math.max(1, bins.length)) * Math.PI * 2 - Math.PI / 2;
  return (
    <svg
      className={`signal-record ${miniature ? "miniature" : ""}`}
      viewBox="0 0 520 520"
      aria-hidden={miniature || !onSelect}
      role={onSelect ? "img" : undefined}
      aria-label={
        onSelect
          ? "请求唱片：外圈按时间显示用量，点击圆环定位请求；下方滑块可逐条查看"
          : undefined
      }
      onClick={
        onSelect
          ? (e) => {
              const matrix = e.currentTarget.getScreenCTM();
              if (!matrix) return;
              const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
                matrix.inverse(),
              );
              const sector = recordSector(
                point.x - 260,
                point.y - 260,
                bins.length,
              );
              if (sector !== null) onSelect(bins[sector].first);
            }
          : undefined
      }
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="35%" cy="24%" r="85%">
          <stop stopColor="#393d3c" />
          <stop offset=".4" stopColor="#1a1d1d" />
          <stop offset=".8" stopColor="#070a0b" />
          <stop offset="1" stopColor="#25292a" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ddd6c9" />
          <stop offset=".18" stopColor="#6d7472" />
          <stop offset=".45" stopColor="#101414" />
          <stop offset=".75" stopColor="#929a97" />
          <stop offset="1" stopColor="#282c2c" />
        </linearGradient>
        <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e5e6dd" stopOpacity=".5" />
          <stop offset=".34" stopColor="#9db4be" stopOpacity=".03" />
          <stop offset=".7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#c8b59b" stopOpacity=".38" />
        </linearGradient>
        <radialGradient id={`${id}-label`} cx="30%" cy="20%">
          <stop stopColor="#d3bd99" />
          <stop offset="1" stopColor="#a58b6a" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <circle cx="260" cy="260" r="241" />
        </clipPath>
        {!miniature && (
          <filter id={`${id}-grain`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".85"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>
      <circle cx="260" cy="264" r="247" fill="#050808" />
      <circle cx="260" cy="260" r="246" fill={`url(#${id}-edge)`} />
      <circle cx="260" cy="260" r="242" fill={`url(#${id}-body)`} />
      {grooves.map((r, i) => (
        <circle
          key={i}
          cx="260"
          cy="260"
          r={r}
          fill="none"
          stroke={i % 5 === 0 ? "#98a3a0" : "#6c7876"}
          strokeWidth={i % 5 === 0 ? ".7" : ".45"}
          opacity={i % 5 === 0 ? ".34" : ".25"}
        />
      ))}
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d="M260 260L-50 15Q50 -95 165 -35ZM260 260L545 475Q470 640 355 568Z"
          fill={`url(#${id}-light)`}
        />
        <path
          d="M260 260L-50 65Q-65 0 -5 -45ZM260 260L570 370Q590 470 540 520Z"
          fill="#c8d9d9"
          opacity=".055"
        />
        {!miniature && (
          <rect
            x="12"
            y="12"
            width="496"
            height="496"
            opacity=".035"
            filter={`url(#${id}-grain)`}
          />
        )}
      </g>
      {bins.map((bin, i) => {
        const a = (i / bins.length) * Math.PI * 2 - Math.PI / 2;
        const length = 3 + Math.sqrt((bin.input + bin.output) / peak) * 13;
        return (
          <path
            key={i}
            d={`M${260 + Math.cos(a) * 226} ${260 + Math.sin(a) * 226}L${260 + Math.cos(a) * (226 + length)} ${260 + Math.sin(a) * (226 + length)}`}
            stroke={i === activeBin && !miniature ? "#f3e3c9" : "#c3976c"}
            strokeWidth={miniature ? 1.2 : 1.7}
            opacity={i === activeBin && !miniature ? 1 : 0.45}
          />
        );
      })}
      <circle
        cx="260"
        cy="260"
        r="65"
        fill="#0c1010"
        stroke="#8e9286"
        strokeWidth=".7"
      />
      <circle cx="260" cy="260" r="61" fill={`url(#${id}-label)`} />
      <circle
        cx="260"
        cy="260"
        r="54"
        fill="none"
        stroke="#514b40"
        strokeWidth=".5"
      />
      <path d="M205 258H315" stroke="#574b3a" strokeWidth=".7" />
      <text
        x="260"
        y="237"
        textAnchor="middle"
        fill="#272a24"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
      >
        AGENTLENS
      </text>
      <text
        x="260"
        y="282"
        textAnchor="middle"
        fill="#37372f"
        fontSize="8"
        letterSpacing="1.7"
      >
        ACTIVITY ARCHIVE
      </text>
      <text
        x="260"
        y="296"
        textAnchor="middle"
        fill="#37372f"
        fontSize="7"
        letterSpacing="1.6"
      >
        SIDE A · SESSION
      </text>
      <circle
        cx="260"
        cy="260"
        r="7"
        fill="#080c0c"
        stroke="#d5c09e"
        strokeWidth="2"
      />
      {!miniature && bins.length > 0 && (
        <circle
          cx={260 + Math.cos(angle) * 235}
          cy={260 + Math.sin(angle) * 235}
          r="4"
          fill="#f3e3c9"
        />
      )}
    </svg>
  );
});
