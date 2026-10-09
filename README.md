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
- 首屏影像在画框内随滚动轻微移动，文字不横向移动；系统减少动态效果设置自动生效。
- 支持触摸/触控板的吸附卡片轨道、上一张/下一张与位置指示、产品详情弹窗。
- 云影像场景切换，展示内容、工作流节点与说明随受控 Tab 联动。
- 可拖动、可用键盘操作的 AI 影像对照分界线。
- 医疗 Agent 的可取消流程演示；切换场景或重置会取消旧流程，过期回调不会污染新场景。最终状态保留人工复核。
- 解决方案切换，页脚场景链接会定位并切换到对应方案。
- 公开联系方式弹窗，电话、邮箱、外部平台和复制按钮。
- 弹窗 Portal、焦点约束、Escape 关闭与关闭后焦点恢复。

## 代码入口

- `src/brand/BrandSite.tsx`：网站组合、首屏、导航、解决方案和弹窗状态。
- `src/brand/content.ts`：产品文案、场景配置、图片路径和公开资料链接。
- `src/site.css`：全站设计参数、组件样式及 1100/800/600 px 响应式规则。
- `src/brand/Highlights.tsx`：卡片轨道与详情入口。
- `src/brand/CloudProduct.tsx`：云影像产品切换。
- `src/brand/ImagingAI.tsx`：影像对照交互。
- `src/brand/MedicalAgent.tsx` / `workflow.ts`：Agent 交互与状态迁移。
- `src/brand/ui.tsx`：进入视口动画、键盘 Tab、自绘几何标识。
- `src/components/Modal.tsx`：复用之前项目的通用弹窗能力。

旧 AgentLens 的页面、日志读取、图表、后端和无关依赖已移除；历史版本可以从 Git 记录查看。

[UI 设计说明](docs/UI_DESIGN.md) · [项目定位图](docs/PROJECT_MAP.md) · [React 学习路线](docs/REACT_GUIDE.md) · [验证记录](docs/VERIFICATION.md)
