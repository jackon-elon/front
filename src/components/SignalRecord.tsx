import { memo, useId, useMemo } from "react";
import type { UsageRequest } from "../../shared/schema";
import { recordBins, recordSector } from "../../shared/experience";

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
  const paths = useMemo(
    () =>
      Array.from({ length: miniature ? 15 : 32 }, (_, ring) => {
        const radius = 72 + ring * (miniature ? 10 : 5);
        const points = Array.from({ length: 257 }, (_, step) => {
          const angle = (step / 256) * Math.PI * 2 - Math.PI / 2;
          const bin =
            bins[
              Math.min(bins.length - 1, Math.floor((step / 257) * bins.length))
            ];
          const value = bin ? Math.sqrt((bin.input + bin.output) / peak) : 0;
          const r =
            radius +
            value * 29 * Math.sin((ring / (miniature ? 14 : 31)) * Math.PI);
          return `${step ? "L" : "M"}${(260 + Math.cos(angle) * r).toFixed(2)} ${(260 + Math.sin(angle) * r).toFixed(2)}`;
        });
        return points.join(" ") + "Z";
      }),
    [bins, peak, miniature],
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
          ? "按时间排列的请求唱片，点击扇区定位请求；也可使用下方请求滑块"
          : undefined
      }
      onClick={
        onSelect
          ? (e) => {
              // Convert screen coordinates through the SVG matrix, including parent tilt/rotation.
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
              const bin = sector === null ? undefined : bins[sector];
              if (bin) onSelect(bin.first);
            }
          : undefined
      }
    >
      <defs>
        <radialGradient id={`${id}-ink`}>
          <stop stopColor="#33251e" />
          <stop offset="1" stopColor="#111110" />
        </radialGradient>
      </defs>
      <circle cx="260" cy="260" r="242" fill={`url(#${id}-ink)`} />
      <circle
        cx="260"
        cy="260"
        r="243"
        fill="none"
        stroke="#f95735"
        strokeWidth="1"
        opacity=".35"
      />
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={i % 7 === 0 ? "#ffd3b5" : "#f95735"}
          strokeWidth={miniature ? 3 : 2.4}
          opacity={i % 7 === 0 ? 0.75 : 0.48 + (i / paths.length) * 0.5}
        />
      ))}
      {!miniature &&
        bins.map((bin, i) => {
          const a = (i / bins.length) * Math.PI * 2 - Math.PI / 2;
          const length = 10 + Math.sqrt(bin.output / peak) * 28;
          return (
            <path
              key={i}
              d={`M${260 + Math.cos(a) * 246} ${260 + Math.sin(a) * 246}L${260 + Math.cos(a) * (246 + length)} ${260 + Math.sin(a) * (246 + length)}`}
              stroke={i === activeBin ? "#f7eddb" : "#ed5b36"}
              strokeWidth={i === activeBin ? 3 : 1}
              opacity={i === activeBin ? 1 : 0.4}
            />
          );
        })}
      <circle cx="260" cy="260" r="60" fill="#f95735" />
      <circle cx="260" cy="260" r="9" fill="#161411" />
      <text
        x="260"
        y="238"
        textAnchor="middle"
        fill="#171510"
        fontSize="12"
        fontWeight="700"
        letterSpacing="2"
      >
        AGENTLENS
      </text>
      <text
        x="260"
        y="290"
        textAnchor="middle"
        fill="#171510"
        fontSize="11"
        letterSpacing="2"
      >
        SESSION RECORD
      </text>
      {!miniature && !!bins.length && (
        <g>
          <path
            d={`M260 260L${260 + Math.cos(angle) * 243} ${260 + Math.sin(angle) * 243}`}
            stroke="#f7eddb"
            strokeWidth="1"
            opacity=".8"
          />
          <circle
            cx={260 + Math.cos(angle) * 243}
            cy={260 + Math.sin(angle) * 243}
            r="5"
            fill="#f7eddb"
          />
        </g>
      )}
    </svg>
  );
});
