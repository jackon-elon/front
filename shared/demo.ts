import { emptyAnnotation, type Provider, type Snapshot } from "./schema";

// Deterministic fictional dataset. Never derived from local logs.
export function createDemo(now = new Date()): Snapshot {
  let seed = 731;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const providers: Provider[] = ["codex", "claude", "workbuddy"];
  const projects = [
    "agent-lens",
    "orbit-design",
    "shopfront",
    "api-gateway",
    "personal-site",
    "design-system",
  ];
  const titles = [
    "重构数据查询层",
    "构建交互式时间线",
    "优化路由与加载体验",
    "实现主题设计系统",
    "检查缓存与请求链路",
    "修复布局边界问题",
    "完善筛选和搜索",
    "搭建服务适配器",
  ];
  const models = {
    codex: ["gpt-6.1-sol", "gpt-6-sol"],
    claude: ["claude-sonnet-5", "claude-opus-4-6"],
    workbuddy: ["hunyuan", "deepseek"],
  };
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  const sessions = Array.from({ length: 180 }, (_, i) => {
    const provider = providers[i % 3];
    const day = i % 28;
    const started =
      midnight.getTime() - day * 86400000 + (8 + random() * 13) * 3600000;
    const size = 7 + Math.floor(random() * 32);
    let input = 6000 + Math.floor(random() * 16000);
    const requests = Array.from({ length: size }, (_, j) => {
      const compact = j === 19 && i % 4 === 0;
      input = compact
        ? 14000
        : Math.min(178000, input + Math.floor(random() * 5500));
      const output = Math.floor(140 + random() * 4000);
      return {
        id: `demo-${i}-${j}`,
        time: new Date(started + j * 95000).toISOString(),
        model: models[provider][i % 2],
        input,
        output,
        cacheRead: Math.floor(input * (0.32 + random() * 0.64)),
        cacheWrite: provider === "claude" ? Math.floor(input * 0.02) : 0,
        reasoning: provider === "codex" ? Math.floor(output * 0.36) : null,
        contextLimit: provider === "workbuddy" ? null : 200000,
        latencyMs: Math.floor(1400 + random() * 8000),
        kind: compact ? ("compaction" as const) : ("request" as const),
        error: i % 29 === 0 && j === 4,
      };
    });
    return {
      id: `demo-session-${i}`,
      provider,
      title: titles[i % 8],
      project: projects[i % 6],
      startedAt: requests[0].time,
      updatedAt: requests.at(-1)!.time,
      parentId: null,
      messages: 2 + (i % 8),
      tools: size * 2 + (i % 5),
      requests,
      notices: provider === "workbuddy" ? ["Trace 未提供模型上下文上限"] : [],
      annotation: {
        ...emptyAnnotation,
        pinned: i % 23 === 0,
        tags: i % 7 === 0 ? ["前端"] : [],
        note: "",
      },
    };
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return {
    version: 1,
    mode: "demo",
    generatedAt: now.toISOString(),
    sessions,
    sources: providers.map((provider) => ({
      provider,
      status: "demo",
      files: 60,
      skipped: 0,
      message: "虚构示例数据 · 不连接本地日志",
    })),
  };
}
