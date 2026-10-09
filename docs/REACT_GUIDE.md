# 从真实功能理解 React

这个文档用于后续一起读代码；产品界面本身是围绕真实 Agent 工作记录构建的交互作品。

新版首页可以先跟踪「切换唱片 → 保留会话 ID → 重算请求图形 → 拖动回放滑块 → 柱图和首屏指针同步」。分别看局部 state、派生数据、useMemo、effect 清理、受控 range、MotionValue 和声明式动画。随后再读下面的查询与数据处理流程。

首页组件边界：`Experience` 持有筛选和选中会话，`SessionGallery` 接收 props 展示有限唱片窗口，`RequestPlayback` 管理播放计时器，`SignalRecord` 生成 SVG。会话总量和图形用 useMemo 缓存；稳定的回调配合 memo，减少播放逐帧推进时无关图形的重算。回放组件以会话 ID 为 key，切换会话时卸载旧计时器。可以用这些实际变化理解 props、组件身份、派生状态与 effect 清理，而不是到处加缓存。

建议第一轮只跟踪一个操作：「点击会话标题 → URL 出现 session → 详情侧栏读取同一份查询结果 → 点击收藏 → 乐观更新 → API 确认或回滚」。涉及组件、props、state、Context、路由、Portal 和服务端状态，能先建立完整的逻辑图。

第二轮看搜索：受控输入改变 URL，`useDeferredValue` 保持输入响应，TanStack Table 计算过滤与排序结果，Virtualizer 只渲染视口和 overscan 的行。分别理解「数据多」和「DOM 多」带来的成本。

第三轮看图表联动：筛选条件改变 → Worker 执行聚合 → 序号检查丢弃旧结果 → 总览重绘。跟踪每个状态的归属，以及为什么不能每次 render 创建 Worker。

第四轮看导入与数据边界：文件在 Worker 内解析 → Zod 校验 → 预览 → IndexedDB 事务保存 → Query 重新读取。理解 TypeScript 类型检查和运行时校验各自解决什么问题。

第五轮看本地实时更新：Node 扫描 mtime / size 变化 → 请求元数据归一 → SSE 发布 revision → Query invalidation → UI 更新。接着看取消、清理、错误状态和重试，最后才读适配器的日志差异。

阅读时可以先不逐行学习语法。每次说明「数据从哪来、状态在哪里、谁触发变化、哪些组件重新渲染、失败后怎么办」，再让 AI 指出对应实现。微调时用 F8 定位组件和选择器；全局字体或间距改 CSS，业务流程改页面组件，字段含义改 shared 层。
