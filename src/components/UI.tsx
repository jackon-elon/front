import { motion } from "motion/react";
import { ArrowUpRight, AlertCircle, SearchX } from "lucide-react";
import type { ReactNode } from "react";
import {
  providerColors,
  providerNames,
  type Provider,
} from "../../shared/schema";
export function ProviderBadge({
  provider,
  short = false,
}: {
  provider: Provider;
  short?: boolean;
}) {
  return (
    <span
      className="provider-badge"
      style={{ "--provider": providerColors[provider] } as React.CSSProperties}
    >
      <i />
      {short && provider === "claude" ? "Claude" : providerNames[provider]}
    </span>
  );
}
export function Panel({
  title,
  eyebrow,
  children,
  className = "",
  action,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section className={`panel ${className}`} data-region={title}>
      <header className="panel-head">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function PageTitle({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h1>
          {title}
          <span className="title-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="page-actions">{children}</div>
    </div>
  );
}
export function Metric({
  label,
  value,
  sub,
  index,
  accent = false,
  children,
}: {
  label: string;
  value: string;
  sub: string;
  index: number;
  accent?: boolean;
  children?: ReactNode;
}) {
  return (
    <motion.div
      className={`metric ${accent ? "accent" : ""}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      data-region={label}
    >
      <div className="metric-label">
        {label}
        <ArrowUpRight size={16} />
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">{sub}</div>
      {children}
    </motion.div>
  );
}
export function Empty({
  title,
  message,
  action,
  error = false,
}: {
  title: string;
  message: string;
  action?: ReactNode;
  error?: boolean;
}) {
  return (
    <div className="empty">
      {error ? <AlertCircle size={34} /> : <SearchX size={34} />}
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  );
}
export function Skeleton() {
  return (
    <div className="skeleton-grid" aria-label="正在加载数据" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="skeleton" />
      ))}
    </div>
  );
}
