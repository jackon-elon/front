import { useId, useRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
export function usePresentationMotion() {
  return (
    useReducedMotion() ||
    new URLSearchParams(window.location.search).get("motion") === "off"
  );
}
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = usePresentationMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Tabs({
  labels,
  value,
  onChange,
  label,
  panelId,
}: {
  labels: readonly string[];
  value: number;
  onChange: (value: number) => void;
  label: string;
  panelId: string;
}) {
  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="segmented-tabs" role="tablist" aria-label={label}>
      {labels.map((name, index) => (
        <button
          key={name}
          ref={(node) => {
            buttons.current[index] = node;
          }}
          id={`${id}-${index}`}
          role="tab"
          aria-selected={value === index}
          aria-controls={panelId}
          tabIndex={value === index ? 0 : -1}
          onClick={() => onChange(index)}
          onKeyDown={(event) => {
            const next =
              event.key === "ArrowRight"
                ? (index + 1) % labels.length
                : event.key === "ArrowLeft"
                  ? (index + labels.length - 1) % labels.length
                  : event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? labels.length - 1
                      : null;
            if (next !== null) {
              event.preventDefault();
              onChange(next);
              buttons.current[next]?.focus();
            }
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 22V10l11-6 11 6v12l-11 6-11-6Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="m5 10 11 6 11-6M16 16v12M10 7l12 7v11"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
