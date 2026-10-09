import { useDeferredValue, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Command, Search } from "lucide-react";
import { useApp } from "../state/AppContext";
import { Modal } from "./Modal";
import { ProviderBadge } from "./UI";
export default function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { snapshot } = useApp();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (open) {
      setText("");
      setActive(0);
    }
  }, [open]);
  const routes = [
    { label: "总览", sub: "查看用量和活动趋势", url: "/", provider: null },
    {
      label: "会话探索",
      sub: "检索与整理使用记录",
      url: "/sessions",
      provider: null,
    },
    {
      label: "对比工作台",
      sub: "跨 Agent 比较会话",
      url: "/compare",
      provider: null,
    },
    {
      label: "数据源",
      sub: "连接本地日志与导入文件",
      url: "/sources",
      provider: null,
    },
  ];
  const sessionResults = (snapshot?.sessions ?? [])
    .filter((s) =>
      `${s.title} ${s.project}`.toLowerCase().includes(deferred.toLowerCase()),
    )
    .slice(0, 7)
    .map((s) => ({
      label: s.title,
      sub: s.project,
      url: `/sessions?session=${encodeURIComponent(s.id)}`,
      provider: s.provider,
    }));
  const results = [
    ...routes.filter((r) => r.label.includes(deferred)),
    ...(deferred ? sessionResults : []),
  ];
  const choose = (index: number) => {
    if (results[index]) {
      navigate(results[index].url);
      onClose();
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="快速跳转"
      className="command-modal"
    >
      <label className="command-input">
        <Search size={21} />
        <input
          autoComplete="off"
          data-autofocus
          aria-label="搜索页面和会话"
          aria-controls="command-results"
          aria-activedescendant={
            results[active] ? `command-${active}` : undefined
          }
          role="combobox"
          aria-expanded="true"
          value={text}
          placeholder="搜索页面、会话或工作区…"
          onChange={(e) => {
            setText(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((v) => (v + 1) % Math.max(1, results.length));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(
                (v) => (v - 1 + results.length) % Math.max(1, results.length),
              );
            }
            if (e.key === "Enter") {
              e.preventDefault();
              choose(active);
            }
          }}
        />
        <kbd>ESC</kbd>
      </label>
      <div id="command-results" role="listbox">
        {results.map((r, i) => (
          <button
            key={r.url}
            role="option"
            id={`command-${i}`}
            aria-selected={active === i}
            className={`command-result ${active === i ? "active" : ""}`}
            onClick={() => choose(i)}
            onPointerEnter={() => setActive(i)}
          >
            <span className="command-result-icon">
              <Command size={18} />
            </span>
            <span>
              <strong>{r.label}</strong>
              <small>{r.sub}</small>
            </span>
            {r.provider && <ProviderBadge provider={r.provider} short />}
            <ArrowUpRight size={16} />
          </button>
        ))}
        {!results.length && (
          <p className="command-empty">没有匹配的页面或会话。</p>
        )}
      </div>
      <div className="command-footer">
        <span>↑ ↓ 选择</span>
        <span>↵ 打开</span>
        <span>⌘ / Ctrl K 唤起</span>
      </div>
    </Modal>
  );
}
