# 讯飞影联 · 品牌官网设计概念

以区域影像云、数字影像、医学影像 AI 与协作为主题的 React 宣传官网。参考苹果产品页的摄影构图、信息层级与交互节奏，使用自己的组件和合成素材。

[在线预览](https://agentlens-front.proudash8.chatgpt.site/) · [源码](https://github.com/jackon-elon/front)

这是非官方设计概念。产品方向参考公开资料；影像、界面及医疗 Agent 为设计演示，不接入患者信息或诊断服务。

## 运行

需要 Node.js 22.12 或以上。

```bash
npm ci
npm run dev
npm test
npm run build
npm run check:bundle
npm run preview
```

开发地址 http://127.0.0.1:5173/。部署 dist/ 即可，无服务器、API 或数据库要求。

## 产品与交互

- 黑色与石墨灰官网：大型终端主视觉、摄影亮点、大字号章节、原生页面滚动和短转场。
- 首页不使用业务 Tab；三项云影像能力、三项智能影像方向、三类医疗方案直接呈现。
- 摄影亮点桌面三列，窄屏原生滚动与吸附，左右按钮和键盘共享真实滚动位置，支持边界禁用与响应式检测。
- 五张官网摄影各使用一次。四张新素材由内置 imagegen 生成，经 WebP 格式转换用于部署，保留原图与提示词记录。
- 点击深入了解，按需加载云影像、AI 与医疗 Agent 的独立产品展台。
- 云影像详情：机构选择、手机影像与报告、分享范围、远程会诊暂停及本页纪要。
- 云影像资料浏览：按需加载 6,000 条演示索引，支持搜索、分组、排序、收藏、键盘跳转与六帧预览。TanStack Virtual 仅挂载可见区域附近的资料行。
- AI 详情：六帧复核标记、受控报告草稿与保存、联动或独立对照、缩放、边界禁用与复位。切换功能后保留本页状态。
- Agent：可取消的四步演示、重置和重启，过期回调不会覆盖新流程。
- 章节导航、手机菜单、方案锚点、联系信息复制、电话及邮件链接。
- 弹窗 Portal、焦点约束、Escape 与焦点恢复；系统减少动态设置和 ?motion=off。
- 渲染优化：章节跟踪状态只更新导航；预览翻帧只更新预览区；列表、资料行与搜索结果通过 memo、稳定回调、useMemo 和 useDeferredValue 减少重复工作。
- 产品详情与资料浏览各有渲染错误边界，支持局部重试与页面重载；不会将内部错误内容显示给用户。
- 摄影卡片、标题和封面与详情使用 Motion 共享布局转场；退出动画结束后恢复入口焦点和页面滚动。减少动画模式直接展示。
- 资料查看器支持鼠标位置缩放、拖拽、双指缩放、方向键移动、框选标注、按帧保留、撤销重做和 JSON 导出。标注是演示坐标，不是诊断结果或医学测量。
- `?diagnostics=1` 启用本地性能采集；开发环境记录 React Profiler，生产环境记录浏览器性能条目。普通访问没有调试面板或采集上报。
- 自动回归脚本验证真实浏览器交互与布局；CI 检查单元测试、生产构建和资源体积预算。运行方法及验证范围见 [浏览器验证](docs/BROWSER_TESTING.md)。

## 组件入口

- src/brand/BrandSite.tsx：页面、弹窗与跨组件状态；ProductNavigation.tsx 单独拥有章节跟踪状态。
- src/brand/CinemaHero.tsx：首屏产品主视觉。
- src/brand/ProductHighlights.tsx：横向亮点与滚动生命周期。
- src/brand/editorial.css：首页摄影、章节与响应式布局。
- src/brand/ProductSections.tsx：首页产品叙事与详情入口。
- src/brand/CloudScene.tsx：区域网络、手机产品展示与远程会诊场景。
- src/brand/DigitalFilm.tsx：手机影像、报告与分享范围的局部状态。
- src/brand/ImagingWorkstation.tsx：质控、报告编辑与联动对照的三个工作区。
- src/brand/ImageFrame.tsx：合成图集的帧定位。
- src/brand/CloudProduct.tsx / ImagingAI.tsx：按需加载的产品详情。
- src/brand/library/：资料浏览、筛选、虚拟列表、独立预览和交互测试；样式在 library.css。
- src/brand/library/InteractiveImageViewer.tsx、viewerModel.ts、viewer.css：输入事件、坐标变换、标注历史与查看器样式。
- src/performance.ts、scripts/browser-regression.mjs、scripts/check-bundle.mjs：性能采样、真实浏览器验证与构建预算。
- src/components/RenderBoundary.tsx：详情渲染异常隔离和重试。
- src/brand/MedicalAgent.tsx / workflow.ts：可取消的协作演示。
- src/brand/CareScene.tsx：三类医疗方案与各自锚点。
- src/brand/content.ts：文案、场景、素材与资料链接。
- src/brand/ui.tsx / src/components/Modal.tsx：视口动画、可访问 Tab 与弹窗。
- src/site.css：通用组件、导航、Agent、页脚。
- src/narrative.css：详情展台的共用样式。
- src/product-scenes.css：六个场景的画面、控件与手机布局。

[UI 设计与资料来源](docs/UI_DESIGN.md) · [修改位置](docs/PROJECT_MAP.md) · [React 阅读路线](docs/REACT_GUIDE.md) · [验证记录](docs/VERIFICATION.md) · [素材记录](docs/RADIOLOGY_ASSETS.md)
