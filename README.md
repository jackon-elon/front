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
npm run preview
```

开发地址 http://127.0.0.1:5173/。部署 dist/ 即可，无服务器、API 或数据库要求。

## 产品与交互

- 深色阅片终端主视觉，独立且稳定的大标题，移动端重新布局。
- 四项横向产品亮点，原生滚动、滚动吸附、左右按钮、键盘操作与边界状态。
- 区域影像云显示可选择的机构网络；数字影像显示可操作的手机影像、报告与分享范围；远程会诊显示共享影像、协作画面与本页纪要。
- 质控支持逐帧复核标记；报告协同支持参考帧、资料摘要与受控草稿编辑；多期对比支持联动或独立翻帧、缩放、边界禁用与复位。
- 六个场景使用不同画面结构，短淡入切换；本页的草稿、标记与浏览状态在功能切换后保留。刷新或关闭详情后清除，不接入真实服务。
- 产品详情按需加载，独立的交互状态；首页可以直接浏览，无需先打开详情。
- 医疗 Agent 四步演示，支持取消、重置、切换和重新开始；过期回调无法覆盖新流程，最后等待人工确认。
- 全幅医疗协作场景，方案 Tab 与页脚入口共享选择状态。
- 吸顶章节导航、移动菜单、联系信息复制、电话和邮件链接。
- 弹窗 Portal、焦点约束、Escape 关闭与焦点恢复。
- 系统减少动态效果设置与 ?motion=off；动效不会影响页面的阅读顺序。

## 组件入口

- src/brand/BrandSite.tsx：页面、章节导航、弹窗与跨组件状态。
- src/brand/CinemaHero.tsx：产品摄影首屏。
- src/brand/ProductHighlights.tsx：横向亮点与滚动生命周期。
- src/brand/ProductSections.tsx：首页产品章节、受控场景切换。
- src/brand/CloudScene.tsx：区域网络、手机产品展示与远程会诊场景。
- src/brand/DigitalFilm.tsx：手机影像、报告与分享范围的局部状态。
- src/brand/ImagingWorkstation.tsx：质控、报告编辑与联动对照的三个工作区。
- src/brand/ImageFrame.tsx：合成图集的帧定位。
- src/brand/CloudProduct.tsx / ImagingAI.tsx：按需加载的产品详情。
- src/brand/MedicalAgent.tsx / workflow.ts：可取消的协作演示。
- src/brand/CareScene.tsx：医疗场景及方案联动。
- src/brand/content.ts：文案、场景、素材与资料链接。
- src/brand/ui.tsx / src/components/Modal.tsx：视口动画、可访问 Tab 与弹窗。
- src/site.css：通用组件、导航、Agent、页脚。
- src/narrative.css：产品章节、横向亮点与响应式布局。
- src/product-scenes.css：六个场景的画面、控件与手机布局。

[UI 设计与资料来源](docs/UI_DESIGN.md) · [修改位置](docs/PROJECT_MAP.md) · [React 阅读路线](docs/REACT_GUIDE.md) · [验证记录](docs/VERIFICATION.md) · [素材记录](docs/RADIOLOGY_ASSETS.md)
