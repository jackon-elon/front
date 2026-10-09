import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  FileJson,
  HardDrive,
  PlugZap,
  Upload,
  RefreshCw,
  ShieldCheck,
  ArrowUpRight,
} from "lucide-react";
import { useApp } from "../state/AppContext";
import { PageTitle, Panel, ProviderBadge } from "../components/UI";
import { createDemo } from "../../shared/demo";
import {
  providerNames,
  sessionTotals,
  type Provider,
  type Snapshot,
} from "../../shared/schema";
import { compact, time } from "../lib/format";
import { readSetting, saveSetting } from "../lib/storage";

export default function Sources() {
  const {
    snapshot,
    mode,
    setMode,
    importData,
    refresh,
    refreshing,
    connected,
  } = useApp();
  const [provider, setProvider] = useState<Provider>("codex");
  const [preview, setPreview] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const worker = useRef<Worker | null>(null);
  const [density, setDensity] = useState(() =>
    readSetting("density", "comfortable"),
  );
  const [motion, setMotion] = useState(() => readSetting("motion", true));
  useEffect(() => () => worker.current?.terminate(), []);
  const parse = async (list: FileList | File[]) => {
    const files = Array.from(list);
    if (!files.length) return;
    setError("");
    setPreview(null);
    worker.current?.terminate();
    if (
      files.length > 10 ||
      files.some((f) => f.size > 20 * 1024 * 1024) ||
      files.reduce((n, f) => n + f.size, 0) > 50 * 1024 * 1024
    ) {
      setError("最多 10 个文件，单文件 20 MB，合计 50 MB。");
      return;
    }
    setBusy(true);
    try {
      const texts = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          text: await file.text(),
        })),
      );
      const instance = new Worker(
        new URL("../lib/import.worker.ts", import.meta.url),
        { type: "module" },
      );
      worker.current = instance;
      instance.onmessage = (
        e: MessageEvent<{ snapshot?: Snapshot; error?: string }>,
      ) => {
        setBusy(false);
        if (e.data.error) setError(e.data.error);
        else setPreview(e.data.snapshot!);
        instance.terminate();
      };
      instance.onerror = () => {
        setBusy(false);
        setError("解析工作进程无法运行，请重试");
        instance.terminate();
      };
      instance.postMessage({ files: texts, provider });
    } catch {
      setBusy(false);
      setError("文件读取失败，请重新选择。");
    }
    if (input.current) input.current.value = "";
  };
  const sample = () => {
    const demo = createDemo();
    demo.sessions = demo.sessions.slice(0, 3);
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(demo, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentlens-example.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const changeDensity = (value: string) => {
    setDensity(value);
    document.documentElement.dataset.density = value;
    saveSetting("density", value);
  };
  const changeMotion = () => {
    const next = !motion;
    setMotion(next);
    document.documentElement.dataset.motion = next ? "on" : "off";
    saveSetting("motion", next);
  };
  return (
    <>
      <PageTitle
        kicker="WORKSPACE / CONNECTIONS"
        title="连接你的工作现场"
        description="三个数据源，一套清晰口径。在线体验与本地真实数据，可以随时切换。"
      >
        <button className="button" disabled={refreshing} onClick={refresh}>
          <RefreshCw size={16} className={refreshing ? "spin" : ""} />
          重新扫描
        </button>
      </PageTitle>
      <div className="connection-banner">
        <div className="connection-icon">
          <PlugZap size={26} />
        </div>
        <div>
          <span className="eyebrow">CURRENT WORKSPACE</span>
          <h2>
            {mode === "demo"
              ? "演示工作区"
              : mode === "import"
                ? "导入工作区"
                : "本地工作区"}
          </h2>
          <p>
            {mode === "demo"
              ? "虚构示例记录，完整体验筛选、对比、标签和图表。"
              : mode === "local"
                ? `SSE ${connected ? "已连接 · 每 3 秒检查日志" : "等待连接"} · 日志元数据留在本机。`
                : "导入记录使用 IndexedDB 保存在当前浏览器。"}
          </p>
        </div>
        <div className="segment">
          {(
            [
              ["demo", "在线演示"],
              ["local", "本地日志"],
              ["import", "已导入"],
            ] as const
          ).map(([id, name]) => (
            <button
              key={id}
              className={mode === id ? "active" : ""}
              onClick={() => setMode(id)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="source-cards">
        {(["codex", "claude", "workbuddy"] as Provider[]).map((p, i) => {
          const source = snapshot?.sources.find((s) => s.provider === p);
          return (
            <article className="panel source-card" key={p}>
              <div className="source-card-top">
                <span className="source-symbol">{["⌘", "✳", "↗"][i]}</span>
                <span
                  className={`status-pill ${source?.status === "ready" ? "ready" : ""}`}
                >
                  {source?.status === "demo"
                    ? "示例数据"
                    : source?.status === "ready"
                      ? "可读取"
                      : source?.status === "error"
                        ? "读取失败"
                        : "未发现"}
                </span>
              </div>
              <ProviderBadge provider={p} />
              <p>
                {
                  [
                    "读取 sessions 与 archived_sessions 中的请求记录和累计快照。",
                    "读取 projects 下的 JSONL，按 message ID 去重并统一缓存口径。",
                    "读取 traces 中的 trace JSON，按 sessionId 和请求 ID 合并。",
                  ][i]
                }
              </p>
              <div className="source-path">
                <code>
                  {
                    [
                      "~/.codex/sessions",
                      "~/.claude/projects",
                      "~/.workbuddy/traces",
                    ][i]
                  }
                </code>
              </div>
              <div className="source-card-footer">
                <span>
                  {source?.files ?? 0} 个文件 · {source?.skipped ?? 0} 个跳过
                </span>
                <span>
                  {snapshot?.sessions.filter((s) => s.provider === p).length ??
                    0}{" "}
                  个会话
                </span>
              </div>
            </article>
          );
        })}
      </div>
      <div className="import-grid">
        <Panel
          title="把记录带进来"
          eyebrow="LOCAL FILE IMPORT"
          className="import-panel"
        >
          <p className="muted">
            拖入 JSONL / Trace JSON / AgentLens 标准快照。解析在浏览器 Worker
            中完成，原文不会上传到服务器。
          </p>
          <label className="import-select">
            文件来自
            <select
              aria-label="导入文件的数据源"
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as Provider);
                setPreview(null);
              }}
            >
              {Object.entries(providerNames).map(([id, name]) => (
                <option value={id} key={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <input
            type="file"
            multiple
            accept=".json,.jsonl"
            ref={input}
            className="sr-only"
            aria-label="选择日志文件"
            onChange={(e) => {
              if (e.target.files) void parse(e.target.files);
            }}
          />
          <button
            className={`drop-zone ${over ? "drag-over" : ""}`}
            disabled={busy}
            onClick={() => input.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              void parse(e.dataTransfer.files);
            }}
          >
            <Upload size={28} />
            <strong>{busy ? "正在解析与校验…" : "拖放文件，或点击选择"}</strong>
            <span>最多 10 个文件 · 单文件 20 MB</span>
          </button>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          {preview && (
            <div className="import-preview">
              <FileJson size={23} />
              <div>
                <strong>识别到 {preview.sessions.length} 个会话</strong>
                <span>
                  {compact(
                    preview.sessions.reduce(
                      (n, s) => n + sessionTotals(s).total,
                      0,
                    ),
                  )}{" "}
                  Tokens · 不包含对话正文
                </span>
              </div>
              <button
                className="button primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await importData(preview);
                    setPreview(null);
                  } catch {
                    setError("本地存储写入失败，可能空间不足。");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Check size={16} />
                确认导入
              </button>
            </div>
          )}
          <button className="text-link" onClick={sample}>
            下载虚构示例文件，试试导入 <ArrowUpRight size={14} />
          </button>
        </Panel>
        <Panel title="本地服务，轻量连接" eyebrow="QUICK START">
          <div className="setup-step">
            <span>01</span>
            <div>
              <h3>启动前端与本地 API</h3>
              <code>
                npm install
                <br />
                npm run dev:all
              </code>
            </div>
          </div>
          <div className="setup-step">
            <span>02</span>
            <div>
              <h3>切换到「本地日志」</h3>
              <p>服务只监听 127.0.0.1；默认发现三个 Agent 的日志目录。</p>
            </div>
          </div>
          <div className="setup-step">
            <span>03</span>
            <div>
              <h3>自定义目录</h3>
              <p>
                启动前设置 CODEX_HOME、CLAUDE_CONFIG_DIR 或 WORKBUDDY_HOME。
              </p>
            </div>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={19} />
            <span>
              不读取认证配置，不保存消息正文，不修改原始日志。统计元数据仍可能包含项目名，请自主决定是否导出。
            </span>
          </div>
        </Panel>
      </div>
      <div className="lower-grid">
        <Panel title="按照你的习惯" eyebrow="PREFERENCES">
          <div className="preference-row">
            <div>
              <strong>界面密度</strong>
              <p>调整主要面板间距</p>
            </div>
            <select
              aria-label="界面密度"
              value={density}
              onChange={(e) => changeDensity(e.target.value)}
            >
              <option value="comfortable">舒适</option>
              <option value="compact">紧凑</option>
            </select>
          </div>
          <div className="preference-row">
            <div>
              <strong>界面动画</strong>
              <p>同时尊重系统的减少动态效果设置</p>
            </div>
            <button
              className={`switch ${motion ? "on" : ""}`}
              role="switch"
              aria-label="界面动画"
              aria-checked={motion}
              onClick={changeMotion}
            >
              <i />
            </button>
          </div>
          <div className="last-sync">
            <HardDrive size={15} />
            最后读取 {snapshot ? time(snapshot.generatedAt) : "尚无数据"}
            <ChevronRight size={14} />
          </div>
        </Panel>
        <Panel title="数字背后的边界" eyebrow="METRIC DEFINITIONS">
          <dl className="definitions">
            <div>
              <dt>输入</dt>
              <dd>包含普通输入、缓存读取与缓存写入，跨数据源统一。</dd>
            </div>
            <div>
              <dt>输出</dt>
              <dd>推理 token 若存在，已包含在输出中，不重复相加。</dd>
            </div>
            <div>
              <dt>上下文</dt>
              <dd>单次请求的输入 / 该请求记录的模型上下文上限。</dd>
            </div>
            <div>
              <dt>未知</dt>
              <dd>日志未提供的指标用「—」表示，不把缺失当作零。</dd>
            </div>
          </dl>
        </Panel>
      </div>
    </>
  );
}
