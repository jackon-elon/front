# 先找到区域，再让 AI 修改

你不必先读具体代码。先知道“哪个页面、哪个区域、什么行为”，再让 AI 检查对应文件。

## 页面与文件

- 全站顶部 Logo、导航、菜单：`src/components/StudioHeader.tsx`。
- 首页大标题、叠放卡片、精选作品、底部邀请：`src/pages/DiscoverPage.tsx`。
- 全部作品的搜索、分类、收藏筛选、排序：`src/pages/CatalogPage.tsx`。
- 作品详情的实时预览、调色、节奏、保存表单：`src/pages/DesignPage.tsx`。
- 我的收藏、卡片排序、版本恢复：`src/pages/ShelfPage.tsx`。
- 关于页的学习折叠卡片：`src/pages/InfoPage.tsx`。
- 每张海报内部的图形和英文排版：`src/components/Poster.tsx`。
- 卡片的标题、爱心按钮、打开入口、排序按钮：`src/components/ProjectCard.tsx`。
- 字号、间距、主色、布局、悬停动画、手机覆盖：`src/styles.css`。
- 六张作品的中文名称、介绍、标签、默认颜色：`public/catalog.json`。
- 数据类型与数据检查：`src/data/projects.ts`。
- 收藏、草稿和保存版本的共享接口与持久化：`src/state/StudioContext.tsx`。
- 修改、重置、保存、恢复、排序的状态规则：`src/state/studioModel.ts`。
- 封面展开与页面转场：`src/components/TransitionLink.tsx` 及 CSS 的 `::view-transition-*`。
- 筛选、排序时卡片移动：`src/hooks/useFlipList.ts`。
- 请求作品数据、加载／错误／重试、取消请求：`src/hooks/useCatalog.tsx`。
- 弹窗、焦点与 Escape：`src/components/Modal.tsx`。
- 路由、滚动恢复、页脚和异常处理：`src/App.tsx`。

## CSS 名称是什么

`.hero-title`、`.project-card`、`.design-controls` 是样式选择器，不是文件。组件用 className 给页面元素分配这些名称，`styles.css` 决定它们的外观。

`@media (max-width: 700px)` 表示浏览器可用宽度小于等于 700 像素时采用该组样式。手机、窄窗口和侧边预览都可能触发它。前面的基础样式仍生效，这里只覆盖需要调整的部分。

海报文字使用 `cqw`，根据海报容器宽度缩放，所以同一个 Poster 能放在小卡片和大预览里；页面标题使用 `clamp()` 限制最小、响应式和最大字号。

## 可直接复制给 AI 的修改描述

> 首页叠放卡片区域：把正面的海报宽度增加 8%，后面的卡片仍露出边缘，390px 手机宽度不能横向溢出。先看 DiscoverPage.tsx 和 styles.css 的 hero-deck。

> 作品页的卡片标题：字号增加到 20px，只改卡片下面的中文标题，不改海报里的英文。看 ProjectCard.tsx 与 project-info h3。

> 温柔的信号：只把橙色圆形中心的渐变改得柔和一些，保留紫色背景和白色圆环。看 Poster.tsx 的 soft-signal 分支和 styles.css 的 soft-orb。

> 点击封面进入详情：让展开更快，文字在封面展开后再出现。看 TransitionLink.tsx、view-transition 样式和设计详情的入场样式。

> 保存版本时增加一个“用途”输入框，收藏页显示它，刷新后仍保留。先解释要修改的表单、状态类型、存储清洗和版本展示，再实现。

## 定位模式与 F12

定位模式把业务名称、项目文件线索和实际样式整理成容易复制的说明。F12 能继续追踪真实 DOM、CSS 来源、网络请求和错误。它们互相补充；日常微调先用定位模式，需要检查浏览器行为再用 F12。

描述顺序：**页面 → 区域 → 希望变化的属性／行为 → 保留的约束**。有歧义时，让 AI 先指出对应文件与选择器，再修改。
