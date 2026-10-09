# 页面修改位置

修改前，先说明区域名称、想改变的属性和预期结果。示例：「首页影像智能章节，报告协同 Tab 下，把右侧报告信息的正文增大到 15px，保留手机纵向排列」。AI 可以据此定位组件与样式。

- 首屏图片、标题、探索入口：CinemaHero.tsx；样式 .launch-*。
- 横向产品亮点、切换按钮、加号入口：ProductHighlights.tsx；样式 .highlight-_、.network-_。
- 首页三个产品章节和当前选择：ProductSections.tsx；样式 .product-intro、.cloud-_、.intelligence-_、.agent-showcase-*。
- 桌面影像工作台：ImagingWorkstation.tsx；样式 .reader-_、.insight-_。
- 手机数字胶片：同一文件的 DigitalFilm；样式 .digital-film-phone、.phone-*。
- 图集素材和帧定位：ImageFrame.tsx；图片路径在 content.ts。
- 云影像、AI 详情：CloudProduct.tsx、ImagingAI.tsx；样式 .product-exhibit、.exhibit-*。
- 协作流程：MedicalAgent.tsx 管理演示；workflow.ts 定义状态规则。不要靠改显示文字替代状态迁移。
- 医疗场景照片与方案选择：CareScene.tsx；样式 .care-*。
- 导航、弹窗打开、页脚方案联动、联系信息：BrandSite.tsx。
- 通用 Tab 键盘逻辑与动画：ui.tsx；弹窗焦点逻辑：components/Modal.tsx。
- 产品文案和业务配置：content.ts。场景标签、说明、节点共用配置，避免在多处重复写文案。

这些组件位于 src/brand/。产品画面样式在 src/narrative.css，基础样式在 src/site.css。@media 按视口宽度调整同一组件的字号、列数和间距，不是另外一套手机页面。

已删除 ImagingStory.tsx、RadiologyFilm.tsx 以及旧扫描/窗宽窗位样式，避免后续改到无效代码。
