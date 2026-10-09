# AgentLens

本地优先的 Agent 用量观测台，用 React 和 TypeScript 构建。支持 Codex、Claude Code 与 WorkBuddy 的用量记录，围绕会话探索、请求下钻和跨 Agent 对比组织界面。

[在线演示](https://agentlens-front.proudash8.chatgpt.site) · [UI 设计](docs/UI_DESIGN.md) · [结构地图](docs/PROJECT_MAP.md)

![AgentLens overview](docs/images/overview.jpg)

在线演示使用 **180 个确定性虚构会话**。本地模式通过轻量 Node API 只读取统计元数据；没有内置真实对话或认证信息。

## 运行

需要 Node.js 22.12+。

```sh
npm install
npm run dev:all
```

打开 http://127.0.0.1:5173/ 。默认是演示模式，在顶部切换到本地模式读取已安装 Agent 的日志。只体验前端可运行 `npm run dev`，无需 API。

```sh
npm test
npm run typecheck
npm run build
```

## 产品功能

- 时间、项目、Agent 联动总览；趋势缩放与日期下钻；Token 分布和活动热图。
- 可排序、可搜索的虚拟会话列表；URL 筛选；收藏、标签备注、保存视图与 CSV 导出。
- 会话详情侧栏；输入上下文走势；虚拟请求明细；单次请求的输入、输出、缓存、推理与上限口径。
- 三槽对比工作台；原生拖动 / 键盘排序；跨 Agent 曲线与指标对照；缺失指标保留未知。
- 浏览器 Worker 文件解析与规范校验；预览后导入 IndexedDB；演示 / 本地 / 导入工作区切换。
- Ctrl / Cmd K 搜索跳转；路由懒加载、错误边界、键盘焦点约束、动画减弱与移动布局。
- 开发模式 F8 区域定位，显示组件与样式位置，方便和 AI 描述具体修改。

## 前端实现

React 19、TypeScript strict、React Router 7、TanStack Query 5、Table 8 / Virtual 3、Motion、Recharts、React Hook Form 与 Zod。

服务端状态由 Query 管理；筛选在 URL；表单和视图状态留在组件；全局工作区和对比选择在 Context。聚合与文件解析使用独立 Worker，并处理过期响应和进程清理。请求列表与会话表分别虚拟化，路由和重型图表按需加载。标签备注支持乐观更新、错误回滚和持久化。

UI、SVG 流线、布局与交互在本仓库实现；图表、图标及动效基础使用开源库。设计说明见 [UI design](docs/UI_DESIGN.md)，结构见 [项目地图](docs/PROJECT_MAP.md)，后续读代码路线见 [React walkthrough](docs/REACT_GUIDE.md)。

## 轻量本地后端

Node 内置 HTTP、文件系统、Readline 流式解析和 SSE，不依赖数据库。只监听 127.0.0.1:5174，Vite 代理 `/api`。扫描使用文件 mtime / size 缓存；每 10 秒发现变化，向前端推送版本更新。备注保存在被 git 忽略的 `.agentlens/annotations.json`，通过串行队列与临时文件 rename 原子保存。

可在启动前设置：

- `CODEX_HOME`：默认 `~/.codex`，读取 sessions 和 archived_sessions。
- `CLAUDE_CONFIG_DIR`：默认 `~/.claude`，读取 projects。
- `WORKBUDDY_HOME`：默认 `~/.workbuddy`，读取 traces。
- `AGENTLENS_STORE`：备注文件路径。

如修改 API 端口，同时修改 Vite proxy。目录没有日志时可以在数据源页面导入文件；在线演示的本地模式不能访问访客电脑，真实连接应在本机运行完整项目。

## 数据定义与限制

输入统一包含缓存读取与写入；Claude 原始普通输入需额外加缓存。推理输出若有，已包含在输出中。缓存命中率的分母只包含缓存字段可知的输入。上下文占用是单次输入 / 该次日志记录的上限，绝不是整场会话的累计用量。

Codex 优先使用归属当前 thread 的 response ID 记录，去重显式与嵌入的压缩记录；旧版主会话回退到累计快照差分。旧版子 Agent 没有明确归属时不计入，避免复制历史带来重复消耗。不同版本日志可能缺字段，统计不是账单。

Claude 按 message ID 合并重复 / 流式片段。WorkBuddy 按 trace 和 sessionId 汇总，利用 totalTokens 对账识别缓存独立输入；无法对账的异常缓存值不计算命中率。未连接 WorkBuddy 会话数据库，因此标题、用户消息、工具数和上下文上限保留未知。请求数在 WorkBuddy 是 trace 数，不一定等于底层模型调用数。

本机 Codex 已做实际读取验证；Claude Code 和 WorkBuddy 做了合成格式测试，本机没有它们的日志，尚未做安装实例联调。项目名和使用时间也属于私人元数据；导出和分享请自行选择范围。

适配口径参考 [ccusage Codex 文档](https://github.com/ccusage/ccusage/blob/main/docs/guide/codex/index.md)、[Claude Code monitoring](https://code.claude.com/docs/en/monitoring-usage)、[WorkBuddy usage data guide](https://github.com/clancy-feng/workbuddy-usage-status/blob/main/DATA-GUIDE.md)。代码为独立实现；没有复制这些项目的源代码或数据。

验证范围见 [verification](docs/VERIFICATION.md)。

MIT licensed. 第三方库保留各自许可。
