# 跟着真实官网学 React

建议按组件和交互阅读，不必先逐行理解全部样式。

1. `content.ts` 与 `BrandSite.tsx`：认识数据配置、组件、props、列表与 key。修改产品配置并观察导航和展台标题联动。
2. `CloudProduct.tsx` 与 `ui.tsx`：学习受控组件、useState、Tab 状态、键盘导航与 ARIA。为新场景配置节点。
3. `ImagingAI.tsx` 与 `RadiologyFilm.tsx`：学习 range 受控表单、props、useId、缩略图状态与条件渲染。影像帧、窗宽、窗位和分界线各有独立状态；同一帧同步驱动原图与 Canvas，对照线同步驱动裁剪与可访问文字。继续阅读 useRef、图片加载 useEffect、requestAnimationFrame 清理和像素灰度映射。
4. `MedicalAgent.tsx` / `workflow.ts`：学习 useReducer、useEffect 清理、定时器与过期回调。切换场景和重置不应被上一个任务的回调覆盖。
5. `Modal.tsx`：学习 Portal、useRef、useId、事件监听清理、焦点管理与 Escape。
6. `BrandSite.tsx` 与 `CareScene.tsx`：学习状态提升、方案 Tab、React.lazy / Suspense。产品展台按需加载，页脚与场景共用选择状态。
7. `ImagingStory.tsx`：学习 useScroll / useTransform。MotionValue 驱动连续几何动画，React state 管理章节内容；useInView 与回调通知导航。
8. `CinemaHero.tsx` / `ui.tsx`：学习组件封装、稳定排版、减少动态效果与静态替代布局。
9. `narrative.css` / `site.css`：学习设计参数、Flex/Grid、sticky 场景、透视变换、图片裁剪、响应式和层叠顺序。
10. `workflow.test.ts` 与 GitHub CI：学习状态生命周期测试。关注取消、重新开始、越界和迟到事件，而不是验证某个颜色常量。

工程使用 React + TypeScript + Vite + Motion。没有 WebGL、患者数据、云端诊断或 Token 后端。项目的难度来自可操作的交互、跨组件状态、响应式和可访问性，而不是添加很多无关依赖。
