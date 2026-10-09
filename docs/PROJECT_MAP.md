# 修改哪里

## 按界面找文件

- 整体导航、全局栏、路由转场：`src/App.tsx`
- 首页海报、滚动编排、展册布局、筛选与请求回放：`src/pages/Experience.tsx`
- 请求唱片图形与旋转后的点击定位：`src/components/SignalRecord.tsx`
- 长会话分桶、扇区与请求索引映射：`shared/experience.ts`
- 新版视觉探索、全屏导航和顶栏的字号、布局、颜色：`src/experience.css`
- 实时工作台、过滤与时间线暂停：`src/pages/Overview.tsx`
- 请求时间桶与 SVG 点击联动：`src/components/LiveTrace.tsx`、`shared/live.ts`
- 会话卡片展开与对比：`src/components/SessionDeck.tsx`
- 会话叠放、前后切换、单会话请求轨迹：`src/components/SessionStack.tsx`
- 指针 / 键盘分隔条和宽度记忆：`src/components/SplitView.tsx`
- 搜索、排序、收藏筛选、虚拟列表、CSV：`src/pages/Sessions.tsx`
- 会话侧栏、请求明细、标签备注：`src/components/SessionDetail.tsx`
- 对比槽位、排序、指标对照：`src/pages/Compare.tsx`
- 数据源状态、文件导入、密度与动画设置：`src/pages/Sources.tsx`
- 折线、面积图、范围滑块：`src/components/Charts.tsx`
- 通用面板、指标卡、空状态：`src/components/UI.tsx`
- 弹窗 Portal、焦点约束与恢复：`src/components/Modal.tsx`
- 命令搜索：`src/components/CommandPalette.tsx`
- 开发时区域定位：`src/components/RegionInspector.tsx`
- 颜色、字体大小、间距、响应式：`src/styles.css`

例如「首页的大标题」对应 `src/experience.css` 中的 `.x-hero-title h1`；「唱片卡片标题」对应 `.x-vinyl-card h3`；「回放三个柱图的数字」对应 `.x-tower > strong`。数据逻辑在组件与 `shared/experience.ts`，不要通过 CSS 伪造指标。

## 按数据流找文件

- 字段合同、运行时校验、指标聚合：`shared/schema.ts`
- Codex / Claude Code / WorkBuddy 元数据解析：`shared/parsers.ts`
- 虚构演示生成器：`shared/demo.ts`
- 日期 / 来源 / 项目分析：`shared/analytics.ts`
- 聚合 Worker 与过期结果处理：`src/lib/analytics.worker.ts`、`src/lib/useAnalytics.ts`
- 文件解析 Worker：`src/lib/import.worker.ts`
- 本地数据查询、SSE、乐观修改与回滚：`src/state/AppContext.tsx`
- IndexedDB 和本地偏好：`src/lib/storage.ts`
- 原始日志扫描、文件时间缓存：`server/scanner.ts`
- 本地 API、SSE、原子保存队列：`server/index.ts`

## 状态放置原则

1. 服务端快照由 TanStack Query 管理，不复制到另一个全局 store。
2. 会话列表的可分享筛选和详情会话放在 URL search parameters。首页展册的临时筛选、排列方式和回放位置属于局部体验状态。
3. 对比集合、数据模式、通知放 Context；对比集合保存在浏览器。
4. 表单草稿与卡片排序属于所属视图的局部状态。
5. 导入后的规范化元数据放 IndexedDB；不保存原文。
6. 标签备注与 Agent 原始日志分开；本地模式写入 `.agentlens/annotations.json`，其他模式使用浏览器存储。

## 后续扩展边界

增加 Agent 时先补 Provider 和 schema，再增加适配器与夹具测试，然后注册扫描目录和来源展示。不要把新日志格式判断散落到业务组件中。

线上部署只包含 `dist/` 静态前端。真实日志 API 在用户本机运行，线上页面不会主动调用 localhost，也不会内置真实日志路径或使用样本。
