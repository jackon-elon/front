# 跟着产品官网阅读 React

按实际组件和交互阅读，不用先记语法清单。

1. content.ts 与 BrandSite.tsx：数据配置、组件组合、props、列表 key。修改产品名称观察导航与详情联动。
2. ProductSections.tsx：useState 与受控 Tab。同一个场景索引驱动画面、说明和节点。
3. ImagingWorkstation.tsx 与 ImageFrame.tsx：可复用组件、可选 props、条件渲染、样式对象与图集复用。多期对比与六帧视图共享素材，不复制六张图片。
4. ProductHighlights.tsx：useRef、原生滚动、requestAnimationFrame、ResizeObserver、事件与清理。按钮、拖动和键盘改变同一滚动区域，React 跟踪当前位置。
5. ui.tsx：可访问 Tab、useId、roving tabindex、左右方向键和 Home/End；减少动态设置影响短转场而不改变阅读结构。
6. MedicalAgent.tsx 与 workflow.ts：useReducer、定时器、取消与运行编号。场景切换和重置后，旧回调不能覆盖新流程。
7. Modal.tsx：Portal、事件清理、焦点约束、Escape、滚动锁定与恢复。
8. BrandSite.tsx 与 CareScene.tsx：状态提升、页脚联动、IntersectionObserver、React.lazy / Suspense。
9. narrative.css 与 site.css：Flex/Grid、scroll-snap、sticky 导航、图片比例、响应式与层叠顺序。
10. workflow.test.ts 与 CI：验证取消、重新开始、越界和迟到事件等行为。

一个合格修改应该能说清「哪个组件、谁拥有状态、谁接收 props、视图如何更新」。复杂度服务产品体验，不必用需要长时间滚动的动画证明技术能力。
