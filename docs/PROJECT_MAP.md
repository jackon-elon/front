# 页面修改位置

先说明区域、要改变的属性和预期结果。例如：「首页的数字影像亮点卡片，把标题往下移动 10px，手机保持原位置」。

- 首屏标题、探索入口、终端主图：src/brand/CinemaHero.tsx；src/brand/editorial.css 的 .brand-hero-*。
- 三张摄影亮点、加号入口、滚动及边界：src/brand/ProductHighlights.tsx；.feature-*。
- 云影像、影像智能、Agent 的首页展示：src/brand/ProductSections.tsx；.brand-cloud-*、.brand-display-*、.brand-agent-*。首页无需选择业务标签。
- 三类医疗方案及各自锚点：src/brand/CareScene.tsx；.solution-*。页脚直接跳到 solution-0、solution-1、solution-2。
- 导航、产品弹窗、联系信息与移动菜单：src/brand/BrandSite.tsx。
- 业务文案与媒体路径：src/brand/content.ts；生成素材见 docs/RADIOLOGY_ASSETS.md。
- 详情中的云影像三场景：src/brand/CloudScene.tsx，数字胶片：DigitalFilm.tsx；样式在 src/product-scenes.css。
- 详情中的复核标记、报告编辑和联动对照：src/brand/ImagingWorkstation.tsx；样式 .quality-*、.report-*、.comparison-*。
- 图集帧定位：src/brand/ImageFrame.tsx。
- 按需加载的产品详情：CloudProduct.tsx、ImagingAI.tsx、MedicalAgent.tsx。
- 协作演示的状态规则：src/brand/workflow.ts；生命周期测试：workflow.test.ts。
- 可访问 Tab 与进入视口动画：src/brand/ui.tsx；弹窗焦点、Escape、滚动锁定：src/components/Modal.tsx。

首页样式集中在 src/brand/editorial.css，详情共用样式在 src/narrative.css，基础导航、页脚等在 src/site.css。@media 改变同一组件的字号、列数和间距，并非另做一份手机页面。

已移除旧首屏工作台、HighlightArt 及其两份样式，清理旧首页覆盖规则，避免修改无效代码。