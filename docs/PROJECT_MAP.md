# 项目定位图

页面骨架和弹窗状态在 `src/brand/BrandSite.tsx`。产品配置和公开链接在 `content.ts`；首页标题在对应场景组件中。

- 首屏：`CinemaHero.tsx` / `.cinema-hero` / `.cinema-heading` / `.cinema-hero-image`。
- 连续影像旅程：`ImagingStory.tsx` / `.story-track` / `.story-pin` / `.story-caption`。
- 切片展开：`SlicePlane` / `.story-slice`，位置与旋转由滚动进度映射。
- 云端连接：`.cloud-orbit` / `.orbit-label`。
- AI 近看：`.story-ai-scan` / `.story-scan-line` / `.ai-reticle`。
- 协作报告：`.story-report` / `.report-sheet` / `.report-task`。
- 章节按钮：`.story-toolbar`，`#cloud` / `#ai` / `#agent` 是轨道内的定位标记。
- 云影像：`CloudProduct` / `.product-window` / `.workspace-content`。
- AI 对照：`ImagingAI` / `.comparison-view` / `.comparison-range`。
- 医疗 Agent：`MedicalAgent` / `.agent-product` / `.process-steps`。
- 医疗场景：`CareScene.tsx` / `.care-photograph` / `.care-story` / `.care-selector`。
- 关于影联：`BrandSite` / `.about-content`。
- 联系弹窗：`BrandSite` / `.contact-modal` / `.contact-method`。
- 通用弹窗：`components/Modal.tsx` / `.modal`。
- 首页视觉主要改 `src/narrative.css`，展台与通用样式主要改 `src/site.css`。
- 手机适配：两个 CSS 文件底部的 `@media`，600 px 以下为手机布局，小高度手机另有规则。

描述微调时可以说：把首屏 `.cinema-heading h1` 再放大；减少云端阶段切片之间的距离；把 `.story-report` 加宽；让 AI 展台默认分界线在 60%。不必复制整页代码。
