interface RegionDefinition {
  title: string;
  selector: string;
  source: string;
  note: string;
  fallback?: boolean;
}
const home = "src/pages/HomeExperience.tsx";
const panel = "src/components/ExperimentPanel.tsx";
const header = "src/components/Header.tsx";
const works = "src/pages/WorksGallery.tsx";
const experiment = "src/pages/ExperimentPage.tsx";
// Narrow regions precede their containers. These are existing CSS selectors,
// so page components don't need a second set of teaching-only labels.
export const regions: RegionDefinition[] = [
  {
    title: "粒子重组与鼠标力场",
    selector: ".field-controls",
    source: panel + " / src/scene/particleField.ts / src/state/model.ts",
    note: "按钮和参数入口改 ExperimentPanel；三种形态、显卡模拟与力场改 particleField；参数保存与恢复由共享状态处理。",
  },
  {
    title: "首页大标题 · 第二行",
    selector: ".hero-title span",
    source: home,
    note: "文字在组件中；大小、字重和字距在 styles.css。",
  },
  {
    title: "首页大标题",
    selector: ".hero-title",
    source: home,
    note: "修改主标题的大小、字重、行距和位置。",
  },
  {
    title: "首页中文说明",
    selector: ".hero-caption p",
    source: home,
    note: "文案改组件；字号和行距改 styles.css。",
  },
  {
    title: "进入空间按钮",
    selector: ".hero-caption .button",
    source: home,
    note: "按钮跳到下一章节；尺寸、背景和间距由 CSS 控制。",
  },
  {
    title: "标题上方的小标签",
    selector: ".eyebrow",
    source: home,
    note: "这是复用样式类。全站修改 .eyebrow 会影响多个标签；具体文案在所在页面组件。",
  },
  {
    title: "解构段落标题",
    selector: ".section-copy h2",
    source: home,
    note: "这里是第二段的大标题，桌面和手机有各自的字号规则。",
  },
  {
    title: "解构段落说明",
    selector: ".section-copy p",
    source: home,
    note: "第二段的中文说明；CSS 控制字号、行距和颜色。",
  },
  {
    title: "展厅标题",
    selector: ".gallery-heading h2",
    source: home,
    note: "首页第三段的标题；作品模型另由 Three.js 渲染。",
  },
  {
    title: "展厅说明",
    selector: ".gallery-heading p",
    source: home,
    note: "第三段的辅助说明文字。",
  },
  {
    title: "选择展品的标签",
    selector: ".exhibit-label",
    source: home,
    note: "点击选择作品，并滚动到实验区。",
  },
  {
    title: "实验区标题",
    selector: ".change-copy h2",
    source: home,
    note: "首页第四段的大标题。",
  },
  {
    title: "实验区说明",
    selector: ".change-copy p",
    source: home,
    note: "首页第四段的辅助说明文字。",
  },
  {
    title: "作品切换",
    selector: ".kind-tabs",
    source: home + " / " + experiment,
    note: "切换粒子、液态和光影；首页更新状态，独立作品页切换路由。",
  },
  {
    title: "实验参数 · 密度或速度",
    selector: ".slider-row",
    source: panel,
    note: "拖动滑块更新共享参数；标签、滑块和数字属于同一行。",
  },
  {
    title: "实验参数 · 颜色",
    selector: ".color-row",
    source: panel,
    note: "预设和自定义颜色会同步到 3D 材质。",
  },
  {
    title: "实验参数 · 操作按钮",
    selector: ".panel-actions",
    source: panel,
    note: "重置恢复默认参数；收藏实验打开保存表单。",
  },
  {
    title: "实验参数 · 标题与暂停",
    selector: ".panel-heading",
    source: panel,
    note: "右侧按钮控制动画暂停与继续。",
  },
  {
    title: "实验参数面板",
    selector: ".experiment-panel",
    source: panel,
    note: "面板宽度、背景、边框和内边距在 styles.css。",
  },
  {
    title: "网站标识",
    selector: ".brand",
    source: header,
    note: "顶部 Logo 与名称，点击回到首页。",
  },
  {
    title: "顶部导航",
    selector: ".desktop-nav",
    source: header,
    note: "探索、作品、关于；窄窗口由 CSS 隐藏。",
  },
  {
    title: "环境声音开关",
    selector: ".sound-button",
    source: "src/hooks/useAmbientSound.ts / " + header,
    note: "用户点击后开启或关闭合成环境音。",
  },
  {
    title: "菜单按钮",
    selector: ".menu-button",
    source: header,
    note: "打开空间导航和偏好设置。",
  },
  {
    title: "菜单设置",
    selector: ".menu-settings",
    source: header,
    note: "调整画质、减少动态效果；参数由 LabContext 共享。",
  },
  {
    title: "菜单链接",
    selector: ".menu-links",
    source: header,
    note: "点击链接切换页面。",
  },
  {
    title: "保存实验表单",
    selector: ".save-form",
    source: panel,
    note: "输入名称并保存参数到当前浏览器。",
  },
  {
    title: "收藏的实验",
    selector: ".saved-item",
    source: "src/components/CollectionModal.tsx",
    note: "恢复这个版本，或删除保存的参数。",
  },
  {
    title: "弹窗",
    selector: ".modal",
    source: "src/components/Modal.tsx",
    note: "公共弹窗组件：管理关闭、键盘焦点和背景滚动。",
  },
  {
    title: "作品搜索",
    selector: ".search-field",
    source: works,
    note: "根据作品名称和标签过滤结果。",
  },
  {
    title: "作品筛选",
    selector: ".filter-tabs",
    source: works,
    note: "切换全部作品和已收藏作品。",
  },
  {
    title: "作品页标题",
    selector: ".page-heading",
    source: works,
    note: "整个标题区域；字号和间距在 styles.css。",
  },
  {
    title: "作品介绍与入口",
    selector: ".work-slot",
    source: works,
    note: "作品名称、介绍和收藏按钮。搜索标签数据在 artworks.ts。",
  },
  {
    title: "独立作品介绍",
    selector: ".experiment-intro",
    source: experiment,
    note: "页面布局在此组件；标题和文案数据在 src/data/artworks.ts。",
  },
  {
    title: "我的实验入口",
    selector: ".experiment-bottom",
    source: experiment,
    note: "作品切换和打开已保存实验。",
  },
  {
    title: "关于页大标题",
    selector: ".about-page > h1",
    source: "src/pages/AboutPage.tsx",
    note: "关于页标题；蓝色词语有独立样式。",
  },
  {
    title: "关于实验室的说明",
    selector: ".about-copy",
    source: "src/pages/AboutPage.tsx",
    note: "关于页的介绍文字与按钮。",
  },
  {
    title: "关于页装饰",
    selector: ".about-symbol",
    source: "src/pages/AboutPage.tsx",
    note: "这一块用 CSS 绘制，不是 Three.js 场景。",
  },
  {
    title: "关于页三项说明",
    selector: ".about-principles",
    source: "src/pages/AboutPage.tsx",
    note: "三列内容，手机改为纵向排列。",
  },
  {
    title: "章节导航",
    selector: ".story-rail",
    source: home,
    note: "点击跳到对应滚动章节；当前章节由滚动进度决定。",
  },
  {
    title: "页脚与章节提示",
    selector: ".story-bottom, .gallery-footer, .page-footer",
    source: home + " / 对应页面组件",
    note: "底部提示、链接与回到起点按钮。",
  },
  {
    title: "首页进入章节",
    selector: ".hero-section",
    source: home,
    note: "这一整段的布局与文案。3D 模型在场景文件中。",
    fallback: true,
  },
  {
    title: "首页解构章节",
    selector: ".deconstruct-section",
    source: home,
    note: "滚动推动三层曲面分开；滚动连接在 HomeExperience，模型位置在 createArtScene。",
    fallback: true,
  },
  {
    title: "首页展厅章节",
    selector: ".gallery-section",
    source: home,
    note: "三个展品与选择入口。",
    fallback: true,
  },
  {
    title: "首页实验章节",
    selector: ".change-section",
    source: home,
    note: "当前展品与实验参数面板。",
    fallback: true,
  },
  {
    title: "3D 画布",
    selector: ".art-canvas",
    source: "src/components/ArtCanvas.tsx",
    note: "连接 React 和 Three.js。模型形状在 sculptures.ts；摄像机、位置和大小在 createArtScene.ts。",
    fallback: true,
  },
  {
    title: "关于页面",
    selector: ".about-page",
    source: "src/pages/AboutPage.tsx",
    note: "关于页整体布局。",
    fallback: true,
  },
];

export function getRegionSource(
  region: RegionDefinition,
  element: Element,
): string {
  if (region.selector !== ".eyebrow") return region.source;
  if (element.closest(".about-page")) return "src/pages/AboutPage.tsx";
  if (element.closest(".experiment-page")) return experiment;
  if (element.closest(".works-page")) return works;
  return home;
}
