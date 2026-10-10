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
9. BrandSite.tsx、ProductNavigation.tsx：React.lazy / Suspense 与弹窗入口；IntersectionObserver 的章节状态移到导航组件，滚动更新不再触发整个首页渲染。方案通过原生锚点定位。
10. ImageFrame.tsx、editorial.css、product-scenes.css：图集定位、样式对象、Grid/Flex、scroll-snap、sticky、素材比例和响应式。
11. workflow.test.ts、CI：验证取消、重启、越界和迟到事件。

修改前能说清「哪个组件、谁拥有状态、谁传 props、视图怎样更新」，即可让 AI 精确定位。首页强调产品叙事，复杂交互在对应的详情展台中体现。

## 新增的渲染进阶

打开「影像云」详情，点击「浏览影像资料」。这是真正可以搜索、收藏、翻帧和键盘操作的产品交互概念；不是接入医院的资料服务。

1. ImagingLibrary.tsx 管理受控搜索和筛选。useDeferredValue 将搜索结果的渲染放在较低优先级；输入框立即更新，memo 的 StudyList 在查询还没变化时跳过更新。它不会把运算移到另一个线程，也不等于网络防抖。
2. StudyList.tsx 用 useMemo 缓存筛选结果与 ID 索引；useCallback 保持行选择回调稳定。收藏采用新的 Set 更新，避免修改 React 中已有的对象。
3. TanStack Virtual 根据滚动位置只挂载附近条目。滚动容器是固定高度，内部占位高度代表整个结果集；可见行按偏移绝对定位。getItemKey 使用资料 ID，筛选或排序后不会将另一份资料误认成原来的行。
4. StudyRow.tsx 用 memo 包住缩略图与元数据；移动位置的外壳在外面。选中一行时，其他 props 未变的行跳过渲染。不是所有组件都需要 memo，应优先拆分状态，再处理重复且昂贵的工作。
5. StudyPreview.tsx 自己拥有帧状态，翻帧不通知列表；资料 ID 作为 key，更换资料重新建立该预览。收藏更新当前资料的标志，但不重置帧。
6. RenderBoundary.tsx 隔离产品详情与资料浏览的渲染错误，重试重新挂载该子树。Suspense 负责等待；错误边界负责失败。失败的 lazy 模块可能被 React 缓存，因此另提供真正的页面重载。
7. 键盘支持方向键、Home/End 与 Page Up/Down；listbox 用 aria-posinset、aria-setsize 表达条目在完整结果集里的位置，只有选中行已挂载时才设置 aria-activedescendant。
8. catalog.test.ts、StudyRow.test.tsx、StudyPreview.test.tsx、RenderBoundary.test.tsx、Modal.test.tsx 验证检索、无关更新跳过、帧边界、局部恢复、lazy 加载拒绝和失败后焦点约束。DOM 测试用 jsdom，不模拟真实浏览器布局；列表窗口与滚动需另外做浏览器验证。

错误边界不捕获普通点击回调或计时器中的异常，也不覆盖错误边界自己的错误。这些路径仍需要在各自的处理逻辑中处理。

官方参考：[memo](https://react.dev/reference/react/memo)、[useDeferredValue](https://react.dev/reference/react/useDeferredValue)、[错误边界](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)、[TanStack Virtual](https://tanstack.com/virtual/latest/docs/framework/react/react-virtual)。
