# 讯飞影联 · 品牌官网设计概念

以云影像、AI 辅助诊断与医疗 Agent 为主题的 React 宣传官网。视觉参考苹果产品页的产品摄影、字号层级、章节节奏和克制的交互；没有复制苹果的代码、商标或图片。

[在线预览](https://agentlens-front.proudash8.chatgpt.site/) · [源码](https://github.com/jackon-elon/front)

这是品牌官网设计概念，非讯飞影联官方站点。医学影像、阅片空间与产品界面均为设计示意。没有真实患者信息、临床推理或咨询提交后端。

## 运行

需要 Node.js 22.12 或以上。

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

开发地址 http://127.0.0.1:5173/。纯静态网站，部署 `dist/` 即可，无服务器/API/数据库要求。

## 已实现的交互

- 双层导航、吸顶模糊背景、章节定位、移动端导航弹窗。
- 居中大标题与立体产品窗口，首屏图片有限移动，文字保持稳定。
- 连续滚动旅程：资料窗口展开连接云端、收拢整理信息、转为协作报告；章节导航可直接定位。
- 章节内容与吸顶导航联动，单个标题按阶段切换，避免多层文字重叠。
- 产品展台使用 React.lazy / Suspense 按需加载；首页负责叙事，详情保留实际交互。
- 全幅医疗协作场景与解决方案切换；系统减少动态效果设置生效，也可用 `?motion=off` 查看静态布局。
- 云影像场景切换，展示内容、工作流节点与说明随受控 Tab 联动。
- 可拖动、可用键盘操作的信息整理对照分界线。
- 医疗 Agent 的可取消流程演示；切换场景或重置会取消旧流程，过期回调不会污染新场景。最终状态保留人工复核。
- 解决方案切换，页脚场景链接会定位并切换到对应方案。
- 公开联系方式弹窗，电话、邮箱、外部平台和复制按钮。
- 弹窗 Portal、焦点约束、Escape 关闭与关闭后焦点恢复。

## 代码入口

- `src/brand/BrandSite.tsx`：页面组合、导航、跨组件方案状态和按需加载弹窗。
- `src/brand/CinemaHero.tsx`：居中首屏与产品主视觉。
- `src/brand/ImagingStory.tsx`：连续滚动旅程、章节切换、资料窗口几何变换和静态替代布局。
- `src/brand/WorkspaceArtwork.tsx`：可复用的 SVG 产品视觉；首页与展台共用，支持横竖布局及信息整理状态。
- `src/brand/CareScene.tsx`：全幅医疗协作场景与方案 Tab。
- `src/brand/content.ts`：产品文案、场景配置、图片路径和公开资料链接。
- `src/site.css`：基础设计参数、通用组件与产品展台样式。
- `src/narrative.css`：首屏、滚动场景与医疗协作的布局及响应式规则。
- `src/brand/CloudProduct.tsx`：云影像产品切换。
- `src/brand/ImagingAI.tsx`：信息整理对照交互。
- `src/brand/MedicalAgent.tsx` / `workflow.ts`：Agent 交互与状态迁移。
- `src/brand/ui.tsx`：进入视口动画、键盘 Tab、自绘几何标识。
- `src/components/Modal.tsx`：复用之前项目的通用弹窗能力。

旧 AgentLens 的页面、日志读取、图表、后端和无关依赖已移除；历史版本可以从 Git 记录查看。

[UI 设计说明](docs/UI_DESIGN.md) · [项目定位图](docs/PROJECT_MAP.md) · [React 学习路线](docs/REACT_GUIDE.md) · [验证记录](docs/VERIFICATION.md)
