# FORM & FLOW · React 创意空间

一个用 React + TypeScript 制作的动态作品集与设计编辑器。米白底色、大字排版、六张由 CSS / SVG 绘制的海报；从发现、筛选、打开作品，到实时调色、收藏排序和保存版本，形成完整的交互流程。

## 运行

需要 Node.js 22.12 或更高版本。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:5173/ 。终端里的服务需要保持运行；停止服务用 Ctrl+C。

```sh
npm test
npm run build
npm run preview
```

构建产物在 `dist/`，可放到普通静态网站服务器。HashRouter 使用 `/#/works` 形式的地址，不需要服务器路由重写。没有账号、后端和云同步；作品数据通过真实 fetch 读取 `public/catalog.json`，收藏和设计版本保存在当前浏览器的 localStorage。

## 体验路径

1. 首页用箭头或键盘切换精选卡片，点击卡片进入作品。
2. 作品页搜索、分类、排序或筛选收藏，卡片随布局变化移动。
3. 详情页调整主色、动态节奏，暂停、重置或保存命名版本和备注。
4. 我的收藏中拖动卡片或用前移／后移按钮排序，恢复保存的版本。
5. 关于页用可展开的学习卡片了解每个交互对应的 React 概念。

## React 学习重点

- 复用组件与 props：Poster、ProjectCard、Modal、TransitionLink。
- 局部 state、受控表单与列表 key。
- Context + reducer：跨页面共享收藏、独立草稿和版本快照。
- 自定义 Hook：异步数据、动画、系统动态偏好。
- effect 清理：取消网络请求、撤销 GSAP 动画、移除事件监听、恢复焦点。
- ref：读取 DOM 布局和设置指针位置，避免动画逐帧触发 React 渲染。
- 路由、URL 查询参数、滚动位置恢复与异常边界。
- Portal 弹窗、键盘焦点约束、减少动态效果。

React 管理界面和交互状态。GSAP Flip 管理筛选／排序后的卡片位移，ScrollTrigger 管理首页内容入场；原生 View Transitions 管理封面从列表展开到详情。浏览器不支持 View Transitions 时仍可直接导航；减少动态效果时跳过这些动画。React 的并发调度与视觉转场是不同的事情，搜索使用 useDeferredValue 延后结果更新。

没有 Three.js 依赖。海报是本项目编写的 CSS / SVG 图形，未使用外部 3D 模型、图库海报或他站源码。视觉采用常见的编辑排版与几何海报语言，不宣称这些设计手法是独创。Manrope 来自 Google Fonts，网络不可用时使用系统字体。

## 准确描述修改位置

开发时左下角“区域定位”可显示中文区域名、组件路径、CSS 选择器和实际字号。Alt+点击固定，再点复制定位；Alt+L 开关，Esc 取消固定。正式构建默认关闭，可主动开启。区域映射集中在 `src/learning/regions.ts`，不在每个元素上重复添加说明。

从 [页面与文件指南](docs/PROJECT_MAP.md) 开始，再按 [React 学习路线](docs/REACT_GUIDE.md) 逐步修改。当前验收范围见 [验收记录](docs/VERIFICATION.md)。

参考文档：[React Hooks](https://react.dev/reference/react/hooks)、[useDeferredValue](https://react.dev/reference/react/useDeferredValue)、[GSAP Flip](https://gsap.com/docs/v3/Plugins/Flip/)、[View Transitions](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)。
