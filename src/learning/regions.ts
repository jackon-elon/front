interface RegionDefinition {
  title: string;
  selector: string;
  source: string;
  note: string;
  fallback?: boolean;
}
const discover = "src/pages/DiscoverPage.tsx",
  poster = "src/components/Poster.tsx",
  design = "src/pages/DesignPage.tsx",
  catalog = "src/pages/CatalogPage.tsx";
export const regions: RegionDefinition[] = [
  {
    title: "首页大标题",
    selector: ".hero-title",
    source: discover,
    note: "文字在组件中；字体、大小、行距和橙色强调在 styles.css 的 .hero-title。",
  },
  {
    title: "首页中文说明",
    selector: ".hero-description",
    source: discover,
    note: "描述文字改组件，字号和间距改 CSS。",
  },
  {
    title: "首页操作按钮",
    selector: ".hero-actions",
    source: discover,
    note: "按钮的文字与导航目的地在组件中，按钮外观在 CSS 中。",
  },
  {
    title: "精选卡片切换",
    selector: ".deck-controls",
    source: discover,
    note: "selected 状态决定前排卡片；change 更新状态，CSS 根据 deck-card 深度完成转场。",
  },
  {
    title: "首页叠放卡片",
    selector: ".hero-deck",
    source: discover + " / " + poster,
    note: "卡片选择与层级改 DiscoverPage；封面形状改 Poster；叠放角度、尺寸、切换曲线改 CSS。",
  },
  {
    title: "精选作品标题",
    selector: ".selected-heading",
    source: discover,
    note: "标题文字和入口在首页组件，滚动揭示也由这里创建并清理。",
  },
  {
    title: "作品分类按钮",
    selector: ".category-tabs",
    source: catalog,
    note: "点击更新 URL 筛选条件；useFlipList 根据 React 重排结果做位置动画。",
  },
  {
    title: "作品搜索框",
    selector: ".catalog-search",
    source: catalog,
    note: "search 控制输入，useDeferredValue 延后结果更新；筛选逻辑在 CatalogPage。",
  },
  {
    title: "仅收藏筛选",
    selector: ".favorite-filter",
    source: catalog,
    note: "favorites 来自 StudioContext；按钮与 URL 参数共同决定显示的作品。",
  },
  {
    title: "作品排序与计数",
    selector: ".catalog-count",
    source: catalog,
    note: "排序是页面状态，显示列表由搜索、分类、收藏与排序共同计算。",
  },
  {
    title: "作品收藏按钮",
    selector: ".favorite-button",
    source: "src/components/ProjectCard.tsx / src/state/StudioContext.tsx",
    note: "点击更新共享收藏状态；爱心选中外观在 styles.css。",
  },
  {
    title: "作品封面",
    selector: ".project-cover-link",
    source: poster + " / src/components/ProjectCard.tsx",
    note: "图形与封面排版在 Poster；点击打开、共享转场名称在 ProjectCard 与 TransitionLink。",
  },
  {
    title: "作品卡片说明",
    selector: ".project-info",
    source: "src/components/ProjectCard.tsx / public/catalog.json",
    note: "作品名字、类型和年份来自 catalog.json；组件负责排版。",
  },
  {
    title: "收藏拖动与顺序",
    selector: ".reorder-actions",
    source: "src/components/ProjectCard.tsx / src/state/studioModel.ts",
    note: "拖动或前移／后移改变 favorites 顺序；CSS 与 useFlipList 负责过渡。",
  },
  {
    title: "详情实时封面",
    selector: ".design-preview",
    source: poster + " / " + design,
    note: "封面接收 settings；输入改变状态，再传给 Poster，形成单向数据流。",
  },
  {
    title: "详情作品介绍",
    selector: ".design-description",
    source: "public/catalog.json / " + design,
    note: "修改介绍数据看 catalog.json；位置、行距看 CSS。",
  },
  {
    title: "主色编辑器",
    selector: ".design-color",
    source: design + " / src/state/StudioContext.tsx",
    note: "受控输入更新项目 draft；Poster 用相同状态实时展示主色。",
  },
  {
    title: "动态节奏滑块",
    selector: ".design-range",
    source: design + " / " + poster,
    note: "滑块更改 intensity；Poster 把它转换成动画时长。",
  },
  {
    title: "保存与重置按钮",
    selector: ".design-actions",
    source: design + " / src/state/studioModel.ts",
    note: "保存打开表单，记录一份状态快照；重置只影响当前作品。",
  },
  {
    title: "版本保存表单",
    selector: ".save-form",
    source: design,
    note: "名称、备注是受控表单；提交调用共享状态保存，Modal 管理焦点和关闭。",
  },
  {
    title: "已保存的版本",
    selector: ".saved-card",
    source: "src/pages/ShelfPage.tsx / src/state/studioModel.ts",
    note: "保存版本在共享状态中；恢复将快照复制回当前作品的 draft。",
  },
  {
    title: "React 学习折叠项",
    selector: ".guide-item",
    source: "src/pages/InfoPage.tsx",
    note: "open 状态决定展开项；CSS grid 实现自然高度过渡。",
  },
  {
    title: "页面顶部导航",
    selector: ".site-header",
    source: "src/components/StudioHeader.tsx",
    note: "品牌、导航和收藏入口在组件中；TransitionLink 封装导航转场。",
  },
  {
    title: "页面底部",
    selector: ".site-footer",
    source: "src/App.tsx",
    note: "所有页面共享页脚；回到顶部按钮遵循减少动态效果设置。",
  },
  {
    title: "导航弹窗",
    selector: ".modal",
    source: "src/components/Modal.tsx / src/components/StudioHeader.tsx",
    note: "Modal 通过 Portal 展示；键盘焦点、Escape 和滚动锁定由 effect 管理。",
    fallback: true,
  },
  {
    title: "详情编辑区",
    selector: ".design-controls",
    source: design,
    note: "介绍、参数和保存操作组成一个 React 编辑区。",
    fallback: true,
  },
  {
    title: "作品卡片",
    selector: ".project-card",
    source: "src/components/ProjectCard.tsx",
    note: "这是可复用的作品卡片；数据通过 props 传入。",
    fallback: true,
  },
  {
    title: "作品列表",
    selector: ".project-grid",
    source: catalog + " / src/pages/ShelfPage.tsx",
    note: "grid 布局在 CSS；显示与排列哪些卡片由页面状态决定。",
    fallback: true,
  },
];
export function getRegionSource(region: RegionDefinition, _element: Element) {
  return region.source;
}
