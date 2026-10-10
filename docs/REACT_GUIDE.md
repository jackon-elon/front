# 跟着产品官网阅读 React

按真实组件和交互阅读：

1. content.ts、BrandSite.tsx：数据配置、组件组合、props、列表 key。首页展示与详情共用业务配置。
2. ProductSections.tsx、CareScene.tsx：组件拆分、声明式视图、回调 props、语义化章节与锚点。业务介绍直接可见，操作在详情中。
3. CloudProduct.tsx、ImagingAI.tsx：useState 与受控 Tab。同一索引驱动相应场景和说明。
4. CloudScene.tsx、DigitalFilm.tsx、ImagingWorkstation.tsx：局部状态、受控输入、useId、条件显示；hidden 保留子场景状态，隐藏画面不进入可访问树。
5. ProductHighlights.tsx：useRef、原生滚动、requestAnimationFrame、ResizeObserver、事件与清理。是否出现方向按钮取决于真实溢出；按实际卡片位置计算滚动与边界。
6. ui.tsx：可访问 Tab、roving tabindex、方向键和 Home/End；进入视口动画与减少动态设置。
7. MedicalAgent.tsx、workflow.ts：useReducer、定时器、取消与运行编号；切换或重置后，过期回调不能覆盖新流程。
8. Modal.tsx：Portal、焦点约束、Escape、滚动锁定与恢复。
9. BrandSite.tsx：IntersectionObserver 章节跟踪、React.lazy / Suspense 与弹窗入口。方案通过原生锚点定位，不再维护无用途的全局方案选择状态。
10. ImageFrame.tsx、editorial.css、product-scenes.css：图集定位、样式对象、Grid/Flex、scroll-snap、sticky、素材比例和响应式。
11. workflow.test.ts、CI：验证取消、重启、越界和迟到事件。

修改前能说清「哪个组件、谁拥有状态、谁传 props、视图怎样更新」，即可让 AI 精确定位。首页强调产品叙事，复杂交互在对应的详情展台中体现。