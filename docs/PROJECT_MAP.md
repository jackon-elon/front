# 页面修改位置

先说明区域、要改变的属性和预期结果。例如：「首页的数字影像亮点卡片，把标题往下移动 10px，手机保持原位置」。

- 首屏标题、探索入口、终端主图：src/brand/CinemaHero.tsx；src/brand/editorial.css 的 .brand-hero-*。
- 三张摄影亮点、加号入口、滚动及边界：src/brand/ProductHighlights.tsx；.feature-*。
- 云影像、影像智能、Agent 的首页展示：src/brand/ProductSections.tsx；.brand-cloud-_、.brand-display-_、.brand-agent-*。首页无需选择业务标签。
- 三类医疗方案及各自锚点：src/brand/CareScene.tsx；.solution-*。页脚直接跳到 solution-0、solution-1、solution-2。
- 产品弹窗、联系信息与移动菜单：src/brand/BrandSite.tsx；章节导航的观察器与当前章节状态：ProductNavigation.tsx。
- 卡片展开与返回转场：ProductHighlights.tsx 中的 layoutId，与 BrandSite.tsx 中相同的产品、标题和图片标识；Modal.tsx 负责保持退出期间的滚动锁与焦点约束。转场封面在 editorial.css 的 .detail-story。
- 业务文案与媒体路径：src/brand/content.ts；生成素材见 docs/RADIOLOGY_ASSETS.md。
- 详情中的云影像三场景：src/brand/CloudScene.tsx，数字胶片：DigitalFilm.tsx；样式在 src/product-scenes.css。
- 详情中的复核标记、报告编辑和联动对照：src/brand/ImagingWorkstation.tsx；样式 .quality-_、.report-_、.comparison-*。
- 图集帧定位：src/brand/ImageFrame.tsx。
- 按需加载的产品详情：CloudProduct.tsx、ImagingAI.tsx、MedicalAgent.tsx。
- 详情加载慢、等待提示闪烁：productResources.ts 注册独立模块，components/preloadable.ts 共享加载请求；ProductHighlights.tsx、ProductSections.tsx 与 CloudProduct.tsx 负责接近视口和操作意图预加载。
- 开关弹窗时页面横移：site.css 的 scrollbar-gutter 与 components/scrollLock.ts；详情加载前后外框尺寸：narrative.css 的 .product-modal；默认布局转场时长：main.tsx 的 MotionConfig。
- 影像云详情里的资料浏览入口：CloudProduct.tsx 的 library-section；工具栏与搜索输入：library/ImagingLibrary.tsx。
- 资料索引与筛选规则：library/catalog.ts；生成的是元数据索引，共用六帧合成图集。
- 资料列表、键盘与滚动位置：library/StudyList.tsx；每一行与收藏标志：StudyRow.tsx。88px 的行高与 library.css 共同控制布局。
- 右侧预览、翻帧与收藏按钮：library/StudyPreview.tsx；更换资料时通过 key 重置预览状态。
- 预览中的缩放、拖拽、双指、标注按钮与导出：library/InteractiveImageViewer.tsx；缩放上下限、坐标转换和撤销重做规则：library/viewerModel.ts；样式：library/viewer.css。
- 本地性能采样：src/performance.ts；开发诊断参数与 Profiler 入口：main.tsx、StudyPreview.tsx。
- 浏览器回归：scripts/browser-regression.mjs；构建体积预算：scripts/check-bundle.mjs 与 .github/workflows/ci.yml。
- 资料浏览颜色、字号、列数与手机布局：library/library.css；首页外观仍在 editorial.css。
- 产品渲染异常界面与重试：src/components/RenderBoundary.tsx；共用样式在 narrative.css。
- 协作演示的状态规则：src/brand/workflow.ts；生命周期测试：workflow.test.ts。
- 可访问 Tab 与进入视口动画：src/brand/ui.tsx；弹窗焦点、Escape、滚动锁定：src/components/Modal.tsx。

首页样式集中在 src/brand/editorial.css，详情共用样式在 src/narrative.css，基础导航、页脚等在 src/site.css。@media 改变同一组件的字号、列数和间距，并非另做一份手机页面。

已移除旧首屏工作台、HighlightArt 及其两份样式，清理旧首页覆盖规则，避免修改无效代码。
