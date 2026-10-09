import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ArrowDownUp,
  ArrowUpRight,
  Bookmark,
  Check,
  Download,
  GitCompareArrows,
  Search,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import {
  type Session,
  sessionTotals,
  providerNames,
} from "../../shared/schema";
import { compact, percent, time } from "../lib/format";
import { useApp } from "../state/AppContext";
import { readSetting, saveSetting } from "../lib/storage";
import { PageTitle, ProviderBadge, Empty } from "../components/UI";

interface View {
  name: string;
  search: string;
  source: string;
  pinned: boolean;
}
export default function Sessions() {
  const { snapshot, compare, toggleCompare, toast } = useApp();
  const [params, setParams] = useSearchParams();
  const search = params.get("q") ?? "";
  const source = params.get("source") ?? "all";
  const pinned = params.get("pinned") === "1";
  const deferred = useDeferredValue(search);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated", desc: true },
  ]);
  const [views, setViews] = useState<View[]>(() => readSetting("views", []));
  const container = useRef<HTMLDivElement>(null);
  const update = (key: string, value: string) =>
    setParams(
      (previous) => {
        const p = new URLSearchParams(previous);
        if (value && value !== "all") p.set(key, value);
        else p.delete(key);
        return p;
      },
      { replace: true },
    );
  const data = useMemo(
    () =>
      (snapshot?.sessions ?? []).filter(
        (s) =>
          (source === "all" || s.provider === source) &&
          (!pinned || s.annotation.pinned),
      ),
    [snapshot?.sessions, source, pinned],
  );
  const columns = useMemo<ColumnDef<Session>[]>(
    () => [
      {
        id: "pick",
        size: 45,
        header: () => <GitCompareArrows size={16} />,
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className={`pick-box ${compare.includes(row.original.id) ? "checked" : ""}`}
            aria-label={`对比 ${row.original.title} ${row.original.id.slice(-5)}`}
            aria-pressed={compare.includes(row.original.id)}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompare(row.original.id);
            }}
          >
            {compare.includes(row.original.id) && <Check size={13} />}
          </button>
        ),
      },
      {
        id: "session",
        size: 305,
        accessorFn: (s) =>
          `${s.title} ${s.project} ${s.annotation.tags.join(" ")} ${s.requests[0]?.model ?? ""}`,
        header: "会话 / 工作区",
        cell: ({ row }) => (
          <div className="table-session">
            <strong>
              {row.original.annotation.pinned && (
                <Bookmark size={13} fill="currentColor" />
              )}
              {row.original.title}
            </strong>
            <span>
              {row.original.project}
              {row.original.parentId && " · 子 Agent"}
              {row.original.annotation.tags.map((tag) => (
                <i key={tag}>{tag}</i>
              ))}
            </span>
          </div>
        ),
      },
      {
        id: "source",
        size: 140,
        accessorKey: "provider",
        header: "Agent",
        cell: ({ row }) => (
          <ProviderBadge provider={row.original.provider} short />
        ),
      },
      {
        id: "tokens",
        size: 120,
        accessorFn: (s) => sessionTotals(s).total,
        header: "总 Tokens",
        cell: ({ getValue }) => (
          <strong className="tabular">{compact(getValue<number>())}</strong>
        ),
      },
      {
        id: "cache",
        size: 105,
        accessorFn: (s) => {
          const t = sessionTotals(s);
          return t.cacheKnownInput ? t.cache / t.cacheKnownInput : -1;
        },
        header: "缓存命中",
        cell: ({ getValue }) => {
          const v = getValue<number>();
          return (
            <span className="cache-chip">{percent(v < 0 ? null : v)}</span>
          );
        },
      },
      {
        id: "requests",
        size: 80,
        accessorFn: (s) => s.requests.length,
        header: "请求数",
      },
      {
        id: "updated",
        size: 150,
        accessorKey: "updatedAt",
        header: "最近活动",
        cell: ({ getValue }) => (
          <span className="muted">{time(getValue<string>())}</span>
        ),
      },
      {
        id: "open",
        size: 40,
        header: "",
        cell: () => <ArrowUpRight size={16} />,
        enableSorting: false,
      },
    ],
    [compare, toggleCompare],
  );
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: deferred },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    enableGlobalFilter: true,
  });
  const rows = table.getRowModel().rows;
  const virtual = useVirtualizer({
    count: rows.length,
    getScrollElement: () => container.current,
    estimateSize: () => 80,
    overscan: 6,
  });
  const template = columns.map((c) => `${c.size ?? 100}px`).join(" ");
  const open = (id: string) => update("session", id);
  const saveView = () => {
    const view = {
      name: `${source === "all" ? "全部 Agent" : providerNames[source as keyof typeof providerNames]}${search ? ` · ${search.slice(0, 12)}` : ""}${pinned ? " · 已收藏" : ""}`,
      search,
      source,
      pinned,
    };
    const next = [...views.filter((v) => v.name !== view.name), view].slice(-5);
    try {
      saveSetting("views", next);
      setViews(next);
      toast("视图已保存");
    } catch {
      toast("无法保存视图，浏览器存储空间不足");
    }
  };
  const download = () => {
    const header =
      "session_id,agent,project,input,output,cache_read,requests\r\n";
    const csvCell = (v: string | number) =>
      `"${String(v)
        .replace(/^[=+@-]/, "'$&")
        .replace(/"/g, '""')}"`;
    const csv =
      header +
      rows
        .map(({ original: s }) => {
          const t = sessionTotals(s);
          return [
            s.id,
            s.provider,
            s.project,
            t.input,
            t.output,
            t.cache,
            s.requests.length,
          ]
            .map(csvCell)
            .join(",");
        })
        .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentlens-usage.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast("已导出当前筛选结果，仅含统计元数据");
  };
  return (
    <>
      <PageTitle
        kicker="WORKSPACE / SESSIONS"
        title="每次探索，都有记录"
        description="检索、整理、深入请求细节。选择最多三个会话，发现不同的工作方式。"
      >
        <button className="button" onClick={download}>
          <Download size={16} />
          导出 CSV
        </button>
        <button className="button primary" onClick={saveView}>
          <Bookmark size={16} />
          保存视图
        </button>
      </PageTitle>
      <div className="sessions-summary">
        <div>
          <strong>{snapshot?.sessions.length ?? 0}</strong>
          <span>全部会话</span>
        </div>
        <div>
          <strong>
            {snapshot?.sessions.filter((s) => s.annotation.pinned).length ?? 0}
          </strong>
          <span>已收藏</span>
        </div>
        <div>
          <strong>{compare.length} / 3</strong>
          <span>对比槽位</span>
        </div>
        <div className="summary-hint">
          <span className="live-dot" />
          列表只渲染视口内的行
        </div>
      </div>
      <section className="panel table-panel" data-region="会话虚拟列表">
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={18} />
            <input
              aria-label="搜索会话"
              placeholder="搜索会话、工作区、模型或标签…"
              value={search}
              onChange={(e) => update("q", e.target.value)}
            />
            {search && (
              <button
                className="icon-button"
                aria-label="清除搜索"
                onClick={() => update("q", "")}
              >
                <X size={15} />
              </button>
            )}
          </label>
          <select
            aria-label="会话数据源"
            value={source}
            onChange={(e) => update("source", e.target.value)}
          >
            <option value="all">所有 Agent</option>
            {Object.entries(providerNames).map(([id, name]) => (
              <option value={id} key={id}>
                {name}
              </option>
            ))}
          </select>
          <button
            className={`button ${pinned ? "selected" : ""}`}
            aria-pressed={pinned}
            onClick={() => update("pinned", pinned ? "" : "1")}
          >
            <Bookmark size={15} />
            已收藏
          </button>
        </div>
        {!!views.length && (
          <div className="saved-views">
            <span>我的视图</span>
            {views.map((v) => (
              <div key={v.name}>
                <button
                  onClick={() =>
                    setParams({
                      ...(v.search ? { q: v.search } : {}),
                      ...(v.source !== "all" ? { source: v.source } : {}),
                      ...(v.pinned ? { pinned: "1" } : {}),
                    })
                  }
                >
                  {v.name}
                </button>
                <button
                  aria-label={`删除视图 ${v.name}`}
                  onClick={() => {
                    const next = views.filter((x) => x.name !== v.name);
                    saveSetting("views", next);
                    setViews(next);
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="virtual-scroll"
          ref={container}
          role="table"
          aria-label="会话统计"
          aria-rowcount={rows.length + 1}
          aria-colcount={columns.length}
        >
          <div
            className="table-header"
            role="row"
            style={{ gridTemplateColumns: template }}
          >
            {table.getHeaderGroups()[0].headers.map((h) => (
              <div
                key={h.id}
                role="columnheader"
                aria-sort={
                  h.column.getIsSorted() === "asc"
                    ? "ascending"
                    : h.column.getIsSorted() === "desc"
                      ? "descending"
                      : undefined
                }
              >
                {h.column.getCanSort() ? (
                  <button onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    <ArrowDownUp
                      size={12}
                      className={h.column.getIsSorted() ? "sorted" : ""}
                    />
                  </button>
                ) : (
                  flexRender(h.column.columnDef.header, h.getContext())
                )}
              </div>
            ))}
          </div>
          {!rows.length ? (
            <Empty
              title="没找到匹配的会话"
              message="试试其他关键词，或清除收藏和数据源筛选。"
              action={
                <button className="button" onClick={() => setParams({})}>
                  清除筛选
                </button>
              }
            />
          ) : (
            <div
              style={{
                height: virtual.getTotalSize(),
                position: "relative",
                minWidth: 1085,
              }}
            >
              {virtual.getVirtualItems().map((item) => {
                const row = rows[item.index];
                return (
                  <div
                    className={`table-row ${compare.includes(row.original.id) ? "is-selected" : ""}`}
                    key={row.id}
                    role="row"
                    aria-rowindex={item.index + 2}
                    style={{
                      position: "absolute",
                      top: 0,
                      transform: `translateY(${item.start}px)`,
                      height: item.size,
                      gridTemplateColumns: template,
                    }}
                    onClick={() => open(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} role="cell">
                        {cell.column.id === "session" ? (
                          <button
                            className="session-open-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              open(row.original.id);
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </button>
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell ??
                              (() => String(cell.getValue())),
                            cell.getContext(),
                          )
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            找到 {rows.length} 个会话{search !== deferred && " · 正在搜索…"}
          </span>
          <span>点击标题查看详情 · 筛选条件保存在 URL</span>
        </div>
      </section>
      {!!compare.length && (
        <motion.div
          className="compare-tray"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          <div className="tray-stack">
            {compare.map((id, i) => (
              <span key={id} style={{ transform: `rotate(${(i - 1) * 8}deg)` }}>
                {i + 1}
              </span>
            ))}
          </div>
          <div>
            <strong>{compare.length} 个会话已加入对比</strong>
            <span>可以跨 Agent 对比，最多三个</span>
          </div>
          <Link className="button primary" to="/compare">
            打开对比工作台 <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      )}
    </>
  );
}
