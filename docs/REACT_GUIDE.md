# 跟着真实官网学 React

建议按组件和交互阅读，不必先逐行理解全部样式。

1. `content.ts` 与 `Highlights.tsx`：认识数据配置、组件、props、列表与 key。修改产品文案并观察卡片和详情联动。
2. `CloudProduct.tsx` 与 `ui.tsx`：学习受控组件、useState、Tab 状态、键盘导航与 ARIA。为新场景配置节点。
3. `ImagingAI.tsx`：学习 range 表单、onChange 与状态映射到 CSS。分界线、图层裁剪、可访问文字共用一个状态值。
4. `MedicalAgent.tsx` / `workflow.ts`：学习 useReducer、useEffect 清理、定时器与过期回调。切换场景和重置不应被上一个任务的回调覆盖。
5. `Modal.tsx`：学习 Portal、useRef、useId、事件监听清理、焦点管理与 Escape。
6. `BrandSite.tsx`：学习状态提升。页脚的方案选择与解决方案 Tab 共用状态，避免两个位置各自维护互不一致的数据。
7. `Reveal` 和 `Hero`：学习组件封装、视口监听、Motion 的滚动值、有限变换与减少动态效果适配。
8. `site.css`：学习设计参数、Flex/Grid、图片裁剪、原生滚动吸附、吸顶导航、响应式和层叠顺序。
9. `workflow.test.ts` 与 GitHub CI：学习状态生命周期测试。关注取消、重新开始、越界和迟到事件，而不是验证某个颜色常量。

工程使用 React + TypeScript + Vite + Motion。没有 WebGL、患者数据、云端诊断或 Token 后端。项目的难度来自可操作的交互、跨组件状态、响应式和可访问性，而不是添加很多无关依赖。
