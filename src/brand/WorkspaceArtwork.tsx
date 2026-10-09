import { useId } from "react";

/** Decorative product illustration. All data is a public, fictional design scenario. */
export function WorkspaceArtwork({
  landscape = false,
  annotated = false,
  label,
  className = "",
}: {
  landscape?: boolean;
  annotated?: boolean;
  label?: string;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const width = landscape ? 1200 : 640;
  const height = landscape ? 740 : 820;
  const panelX = landscape ? 218 : 36;
  const panelY = landscape ? 132 : 170;
  const panelWidth = landscape ? 586 : 568;
  const panelHeight = landscape ? 430 : 360;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`workspace-artwork ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
    >
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#eaf0f7" />
        </linearGradient>
        <linearGradient id={`${id}-field`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#e8f3ff" />
          <stop offset="1" stopColor="#ccdfef" />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fafdff" stopOpacity=".95" />
          <stop offset=".42" stopColor="#d4e8fc" stopOpacity=".8" />
          <stop offset="1" stopColor="#7aa9cf" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#a3bad0" />
        </linearGradient>
        <filter
          id={`${id}-shadow`}
          x="-60%"
          y="-60%"
          width="220%"
          height="250%"
        >
          <feDropShadow
            dx="0"
            dy="24"
            stdDeviation="22"
            floodColor="#2d527a"
            floodOpacity=".15"
          />
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        width={width - 4}
        height={height - 4}
        rx="27"
        fill={`url(#${id}-shell)`}
        stroke="#d5dee8"
        strokeWidth="3"
      />
      <path d={`M3 67H${width - 3}`} stroke="#dfe6ef" />
      {["#becad8", "#cbd4df", "#d8dfe7"].map((color, i) => (
        <circle key={color} cx={28 + i * 20} cy="34" r="5" fill={color} />
      ))}
      <text
        x={width / 2}
        y="40"
        textAnchor="middle"
        fill="#7d8da1"
        fontSize="14"
        letterSpacing="2"
      >
        IMAGING CLOUD
      </text>
      <rect
        x={width - 42}
        y="27"
        width="14"
        height="14"
        rx="3"
        stroke="#90a4bb"
      />
      {landscape && (
        <g>
          <path d="M181 68V738" stroke="#dce4ed" />
          <rect x="24" y="108" width="130" height="42" rx="11" fill="#e1ebf7" />
          {["资料空间", "协作任务", "报告框架"].map((text, i) => (
            <g key={text} transform={`translate(40 ${134 + i * 64})`}>
              <rect
                x="0"
                y="-13"
                width="14"
                height="15"
                rx="3"
                stroke={i === 0 ? "#638aba" : "#9daec2"}
              />
              <text
                x="25"
                y="0"
                fill={i === 0 ? "#526f95" : "#92a0b3"}
                fontSize="15"
              >
                {text}
              </text>
            </g>
          ))}
          <text x="41" y="675" fill="#95a5b9" fontSize="11">
            产品设计示意
          </text>
        </g>
      )}
      <text
        x={panelX}
        y={landscape ? 108 : 118}
        fill="#354c69"
        fontSize={landscape ? 24 : 27}
        fontWeight="600"
      >
        云端资料空间
      </text>
      {!landscape && (
        <text x="36" y="145" fill="#94a4b8" fontSize="13">
          连接资料 · 连接专业协作
        </text>
      )}
      <rect
        x={panelX}
        y={panelY}
        width={panelWidth}
        height={panelHeight}
        rx="20"
        fill={`url(#${id}-field)`}
      />
      <g
        transform={`translate(${panelX + panelWidth / 2} ${panelY + panelHeight / 2 - 14})`}
      >
        {[2, 1, 0].map((i) => (
          <g key={i} transform={`translate(${i * 23 - 14} ${-i * 23 + 14})`}>
            <rect
              x="-95"
              y="-95"
              width="190"
              height="190"
              rx="38"
              transform="rotate(-12)"
              fill={`url(#${id}-glass)`}
              stroke={`url(#${id}-edge)`}
              strokeWidth="2"
              opacity={1 - i * 0.2}
              filter={i === 0 ? `url(#${id}-shadow)` : undefined}
            />
            {i === 0 && (
              <g transform="rotate(-12)">
                <path
                  d="M-45 35H43C71 35 73-9 47-15C40-61-29-68-45-20C-82-18-80 35-45 35Z"
                  fill="#f9fcff"
                  fillOpacity=".8"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <path
                  d="M-7-12V17M-21 3H7"
                  stroke="#83a9ce"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>
        ))}
      </g>
      <text
        x={panelX + 24}
        y={panelY + panelHeight - 22}
        fill="#7c97b2"
        fontSize="12"
        letterSpacing="1"
      >
        资料连接 · 可追溯的协作路径
      </text>
      <g
        transform={`translate(${landscape ? 834 : 36} ${landscape ? 150 : 558})`}
      >
        <text x="0" y="0" fill="#7b90aa" fontSize="13">
          {annotated ? "信息已整理" : "协作路径"}
        </text>
        {["影像资料", "报告框架", "专业复核"].map((title, i) => (
          <g
            key={title}
            transform={`translate(0 ${24 + i * (landscape ? 106 : 68)})`}
          >
            <rect
              width={landscape ? 330 : 568}
              height={landscape ? 87 : 57}
              rx="13"
              fill="#fff"
              stroke="#e0e8f1"
            />
            <rect
              x="16"
              y={landscape ? 19 : 11}
              width="35"
              height="35"
              rx="10"
              fill={annotated ? "#e8f3ee" : "#edf3fa"}
            />
            {annotated ? (
              <path
                d={`M26 ${landscape ? 37 : 29}l6 6 10-12`}
                stroke="#78a58d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d={`M29 ${landscape ? 29 : 21}h10v15H29zM32 ${landscape ? 34 : 26}h5M32 ${landscape ? 38 : 30}h5`}
                stroke="#829dbb"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            )}
            <text x="66" y={landscape ? 39 : 25} fontSize="15" fill="#5d738f">
              {title}
            </text>
            <text x="66" y={landscape ? 61 : 44} fontSize="11" fill="#9aa9bc">
              {i === 2
                ? "等待专业人员确认"
                : annotated
                  ? "关联信息清晰可见"
                  : "连接到同一个工作空间"}
            </text>
            <path
              d={`M${landscape ? 297 : 535} ${landscape ? 37 : 24}l5 5-5 5`}
              stroke="#a8b9cc"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>
      {landscape && (
        <g transform="translate(218 590)">
          {["资料归档", "协同阅片", "报告反馈"].map((text, i) => (
            <g key={text} transform={`translate(${i * 319} 0)`}>
              <rect
                width="294"
                height="96"
                rx="15"
                fill="#fff"
                stroke="#e0e8f1"
              />
              <text x="20" y="39" fontSize="16" fill="#657b97">
                {text}
              </text>
              <path
                d="M20 60h190M20 71h123"
                stroke="#e1e8f1"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          ))}
        </g>
      )}
      {annotated && (
        <g>
          <rect
            x={panelX + 18}
            y={panelY + 18}
            width={panelWidth - 36}
            height={panelHeight - 36}
            rx="14"
            stroke="#77a9d2"
            strokeDasharray="5 7"
          />
          <rect
            x={panelX + panelWidth - 163}
            y={panelY + 24}
            width="137"
            height="32"
            rx="16"
            fill="#fbfdff"
          />
          <text
            x={panelX + panelWidth - 94}
            y={panelY + 45}
            textAnchor="middle"
            fill="#6c95bd"
            fontSize="12"
          >
            资料关联 · 示意
          </text>
        </g>
      )}
    </svg>
  );
}
