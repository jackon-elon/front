import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useForm } from "react-hook-form";
import {
  Bookmark,
  GitCompareArrows,
  Info,
  Check,
  ChevronRight,
  MessageSquare,
  Terminal,
  ArrowDownRight,
} from "lucide-react";
import { useAnnotation, useApp } from "../state/AppContext";
import { Modal } from "./Modal";
import { ProviderBadge } from "./UI";
import { ContextChart } from "./Charts";
import { compact, duration, integer, percent, time } from "../lib/format";
import { sessionTotals, type Session } from "../../shared/schema";

function Detail({ session: s }: { session: Session }) {
  const { compare, toggleCompare, toast } = useApp();
  const mutation = useAnnotation(s.id);
  const [tab, setTab] = useState<"requests" | "notes">("requests");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const totals = sessionTotals(s);
  const requests = useMemo(
    () =>
      s.requests.filter(
        (r) =>
          kind === "all" ||
          (kind === "error" ? r.error : r.kind === "compaction"),
      ),
    [s.requests, kind],
  );
  const ref = useRef<HTMLDivElement>(null);
  const virtual = useVirtualizer({
    count: requests.length,
    getScrollElement: () => ref.current,
    estimateSize: () => 62,
    overscan: 5,
  });
  const activeRequest = s.requests.find((r) => r.id === selected);
  useEffect(() => {
    const index = requests.findIndex((r) => r.id === selected);
    if (index >= 0) virtual.scrollToIndex(index, { align: "center" });
  }, [selected, requests, virtual]);
  const form = useForm({
    defaultValues: {
      tags: s.annotation.tags.join(", "),
      note: s.annotation.note,
    },
    mode: "onChange",
  });
  const save = form.handleSubmit((values) =>
    mutation.mutate(
      {
        ...s.annotation,
        tags: [
          ...new Set(
            values.tags
              .split(/[,，]/)
              .map((t) => t.trim())
              .filter(Boolean),
          ),
        ],
        note: values.note,
      },
      { onSuccess: () => toast("标签与备注已保存") },
    ),
  );
  return (
    <div className="detail-body">
      <div className="detail-top">
        <ProviderBadge provider={s.provider} />
        <span className="muted">{s.id.slice(-12)}</span>
      </div>
      <h3 className="detail-title">{s.title}</h3>
      <p className="detail-subtitle">
        {s.project} · {time(s.startedAt)} — {time(s.updatedAt)}
      </p>
      <div className="detail-actions">
        <button
          className={`button ${s.annotation.pinned ? "selected" : ""}`}
          disabled={mutation.isPending}
          onClick={() =>
            mutation.mutate({ ...s.annotation, pinned: !s.annotation.pinned })
          }
        >
          <Bookmark
            size={15}
            fill={s.annotation.pinned ? "currentColor" : "none"}
          />
          {s.annotation.pinned ? "已收藏" : "收藏会话"}
        </button>
        <button
          className="button"
          aria-pressed={compare.includes(s.id)}
          onClick={() => toggleCompare(s.id)}
        >
          {compare.includes(s.id) ? (
            <Check size={15} />
          ) : (
            <GitCompareArrows size={15} />
          )}
          {compare.includes(s.id) ? "已加入对比" : "加入对比"}
        </button>
        {compare.includes(s.id) && (
          <Link className="text-link" to="/compare">
            打开对比 <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="detail-metrics">
        <div>
          <span>输入 Tokens（含缓存）</span>
          <strong>{compact(totals.input)}</strong>
        </div>
        <div>
          <span>输出 Tokens</span>
          <strong>{compact(totals.output)}</strong>
        </div>
        <div>
          <span>输入缓存命中</span>
          <strong>
            {percent(
              totals.cacheKnownInput
                ? totals.cache / totals.cacheKnownInput
                : null,
            )}
          </strong>
        </div>
      </div>
      <div className="detail-meta">
        <span>
          <MessageSquare size={14} />
          用户消息 {s.messages ?? "未知"}
        </span>
        <span>
          <Terminal size={14} />
          工具调用 {s.tools ?? "未知"}
        </span>
        <span>
          <ArrowDownRight size={14} />
          压缩 {s.requests.filter((r) => r.kind === "compaction").length} 次
        </span>
      </div>
      <div className="detail-tabs" role="tablist" aria-label="会话详情页签">
        {(
          [
            ["requests", "请求分析"],
            ["notes", "标签与备注"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {name}
          </button>
        ))}
      </div>
      {tab === "requests" ? (
        <div role="tabpanel" aria-label="请求分析">
          <div className="detail-section-head">
            <h4>上下文的生长</h4>
            <span>每次请求的输入 · 非累计用量</span>
          </div>
          <ContextChart
            sessions={[s]}
            selectedStep={
              selected
                ? s.requests.findIndex((r) => r.id === selected) + 1
                : undefined
            }
            onStep={(step) => {
              setKind("all");
              setSelected(s.requests[step - 1]?.id ?? null);
            }}
          />
          <div className="detail-section-head">
            <h4>
              请求明细 <span>{requests.length}</span>
            </h4>
            <select
              aria-label="请求明细筛选"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="all">全部请求</option>
              <option value="compaction">仅上下文压缩</option>
              <option value="error">仅错误记录</option>
            </select>
          </div>
          <div className="request-list" ref={ref}>
            <div
              style={{ height: virtual.getTotalSize(), position: "relative" }}
            >
              {virtual.getVirtualItems().map((item) => {
                const r = requests[item.index];
                return (
                  <button
                    key={r.id}
                    className={`request-row ${selected === r.id ? "active" : ""}`}
                    style={{
                      height: item.size,
                      position: "absolute",
                      width: "100%",
                      top: 0,
                      transform: `translateY(${item.start}px)`,
                    }}
                    onClick={() => setSelected(r.id)}
                  >
                    <span className="request-index">
                      {String(item.index + 1).padStart(2, "0")}
                    </span>
                    <span className="request-label">
                      <strong>
                        {r.kind === "compaction" ? "上下文压缩" : r.model}
                      </strong>
                      <small>
                        {time(r.time)}
                        {r.error && " · 错误"}
                      </small>
                    </span>
                    <span>
                      {compact(r.input)}
                      <small>输入</small>
                    </span>
                    <span>
                      {compact(r.output)}
                      <small>输出</small>
                    </span>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>
            {!requests.length && (
              <p className="request-empty">没有符合条件的请求。</p>
            )}
          </div>
          {activeRequest && (
            <section className="request-insight">
              <div className="detail-section-head">
                <h4>已选请求的完整口径</h4>
                <span>{activeRequest.id.slice(-14)}</span>
              </div>
              <dl>
                <div>
                  <dt>输入 / 输出</dt>
                  <dd>
                    {integer(activeRequest.input)} /{" "}
                    {integer(activeRequest.output)}
                  </dd>
                </div>
                <div>
                  <dt>缓存读取 / 写入</dt>
                  <dd>
                    {activeRequest.cacheRead === null
                      ? "未知"
                      : integer(activeRequest.cacheRead)}{" "}
                    /{" "}
                    {activeRequest.cacheWrite === null
                      ? "未知"
                      : integer(activeRequest.cacheWrite)}
                  </dd>
                </div>
                <div>
                  <dt>推理输出（包含在输出内）</dt>
                  <dd>
                    {activeRequest.reasoning === null
                      ? "未知"
                      : integer(activeRequest.reasoning)}
                  </dd>
                </div>
                <div>
                  <dt>上下文占用</dt>
                  <dd>
                    {activeRequest.contextLimit
                      ? `${percent(activeRequest.input / activeRequest.contextLimit)} / ${compact(activeRequest.contextLimit)} 上限`
                      : "模型上限未记录"}
                  </dd>
                </div>
                <div>
                  <dt>请求延迟</dt>
                  <dd>{duration(activeRequest.latencyMs)}</dd>
                </div>
              </dl>
            </section>
          )}
          <div className="metric-notice">
            <Info size={17} />
            <div>
              {s.notices.map((n) => (
                <p key={n}>{n}</p>
              ))}
              <p>
                输入包含缓存；推理 token 已包含在输出中。缓存命中率 = 缓存读取 /
                已知缓存口径的输入。
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={save}
          className="annotation-form"
          role="tabpanel"
          aria-label="标签与备注"
        >
          <label>
            标签 <span>逗号分隔，最多 8 个</span>
            <input
              {...form.register("tags", {
                validate: (text) => {
                  const tags = text
                    .split(/[,，]/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                  return (
                    (tags.length <= 8 && tags.every((t) => t.length <= 24)) ||
                    "最多 8 个标签，每个不超过 24 个字符"
                  );
                },
              })}
              placeholder="前端, 待复查, 高缓存命中"
            />
          </label>
          {form.formState.errors.tags && (
            <p className="field-error">{form.formState.errors.tags.message}</p>
          )}
          <label>
            工作备注
            <textarea
              rows={7}
              {...form.register("note", {
                maxLength: { value: 500, message: "备注最多 500 个字符" },
              })}
              placeholder="记录这次会话的工作目标和观察…"
            />
          </label>
          {form.formState.errors.note && (
            <p className="field-error">{form.formState.errors.note.message}</p>
          )}
          <p className="muted small">
            备注由 AgentLens 单独保存，不修改 Agent 原始日志。
          </p>
          <button
            className="button primary"
            type="submit"
            disabled={mutation.isPending || !form.formState.isValid}
          >
            {mutation.isPending ? "保存中…" : "保存标签与备注"}
          </button>
        </form>
      )}
    </div>
  );
}
export default function SessionDetail() {
  const { snapshot } = useApp();
  const [params, setParams] = useSearchParams();
  const id = params.get("session");
  const session = snapshot?.sessions.find((s) => s.id === id);
  const close = () =>
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("session");
        return next;
      },
      { replace: true },
    );
  return (
    <Modal
      open={Boolean(id)}
      title="会话透镜"
      onClose={close}
      className="drawer"
    >
      {session ? (
        <Detail key={session.id} session={session} />
      ) : (
        <div className="empty">
          <h3>找不到这个会话</h3>
          <p>它可能来自其他数据模式。关闭详情后重新选择会话。</p>
        </div>
      )}
    </Modal>
  );
}
