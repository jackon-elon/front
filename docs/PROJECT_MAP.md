# 不必先读代码：从页面找到修改位置

这是 React 项目。你只需要知道组件负责哪块画面、数据放在哪里、交互由谁管理，再让 AI 打开相应文件。

## 鼠标直接定位

左下角“区域定位”开关开启后，移动鼠标可查看区域名、对应文件、CSS 名称、实际字号和范围。Alt+点击或点“固定当前”固定信息，再点“复制定位”并粘贴给 AI，补充希望改变的效果。正常点击仍操作网页，Esc 取消固定，Alt+L 开关模式。

本地开发默认开启；生产构建默认关闭。当前浏览器会话记住开关选择。区域说明集中在 src/learning/regions.ts，定位浮层在 RegionInspector.tsx，3D 命中由 createArtScene.ts 处理。

它与 F12 的区别：定位模式提供业务区域名和项目文件线索；F12 可以深入检查真实 DOM、CSS 规则、布局盒子、网络请求与错误。定位模式里的字号也读取浏览器实际生效的样式。Three.js 的多个展品在 F12 中属于一块 canvas，定位模式额外识别场景对象。

## 一眼定位

- 顶部 Logo、探索/作品/关于、声音按钮、菜单：src/components/Header.tsx。
- 首页四段内容、大标题、章节导航：src/pages/HomeExperience.tsx。
- 全部作品页、搜索、收藏筛选：src/pages/WorksGallery.tsx。
- 某个作品的标题、介绍、切换入口：src/pages/ExperimentPage.tsx。
- 右侧参数面板、颜色按钮、保存实验表单：src/components/ExperimentPanel.tsx。
- 我的收藏弹窗、保存版本列表、恢复与删除：src/components/CollectionModal.tsx。
- 关于页面：src/pages/AboutPage.tsx。
- 字号、间距、边框、颜色、手机布局：src/styles.css。样式按页面和组件分组，手机覆盖在后半部分。
- 三件作品的名字、文案、搜索标签：src/data/artworks.ts。
- 首页与粒子展品的形态、受力、GPU 反馈模拟和着色器：src/scene/particleField.ts。
- 金属液滴与光影装置的几何和材质：src/scene/sculptures.ts。
- 3D 摄像机、位置、大小、灯光、滚动时的分层：src/scene/createArtScene.ts。
- 连接 React 参数与 Three.js 场景：src/components/ArtCanvas.tsx。
- 参数、收藏、保存版本以及浏览器持久化：src/state/LabContext.tsx。
- 默认参数、参数合法范围、存储清洗、状态变化规则：src/state/model.ts。
- 页面地址、页面加载、异常处理：src/App.tsx。

## 两个“变大”的区别

“把参数面板放大”属于界面布局：改 styles.css 的 .experiment-panel，以及页面对它的宽度覆盖。

“把液态雕塑放大”属于 3D 场景：改 createArtScene.ts 中实验布局的 group.scale。sculptures.ts 决定雕塑的形状，不负责整件作品在页面里占多大。

“让液态雕塑更像水滴”才是模型形状：改 sculptures.ts 中 makeLiquid 的曲面顶点与材质参数。

## 可以这样向 AI 描述

> 在作品详情页，把右侧实验参数面板从 300px 改为 340px。保留中心雕塑的完整可见区域，手机布局仍占容器宽度。先看 ExperimentPage.tsx 和 styles.css。

> 首页“解构”段落，让球体更晚开始重组，形态变化跟随滚动。看 createArtScene.ts 中传给 heroField 的 morph，以及 particleField.ts 的 targetPosition。

> 只把粒子流场的点变大、变亮，不改变金属液滴的灯光。看 particleField.ts 的 drawVertex 与 drawFragment。

> 将默认蓝色改为紫色，同步修改默认参数和面板预设颜色。已有用户保存的实验保持原来的颜色。

> 在全部作品页，给粒子流场增加“流动”搜索标签。只改 artworks.ts 的数据即可。

你不必截图逐个指认：用“页面 + 区域名 + 要改变的属性 + 必须保持的行为”，AI 就能定位。若仍有歧义，让 AI 先列出它认为对应的组件与样式选择器。

## 只需要理解的 React 逻辑

1. **组件**：页面拆成 Header、ArtCanvas、ExperimentPanel 等区域。HomeExperience、ExperimentPage 复用同一个参数面板。
2. **props**：页面告诉面板当前作品是哪一个。比如 kind 是 particles / liquid / light。
3. **state**：当前颜色、速度、收藏、弹窗是否打开。状态变化后，React 更新画面。
4. **受控表单**：滑块值来自状态，拖动滑块更新状态；不是只改变页面上显示的数字。
5. **Context + reducer**：全站共享参数与收藏。reducer 明确规定修改、保存、恢复、重置怎么改变数据。
6. **effect 和清理**：创建场景、读取浏览器偏好、存储数据。离开页面时释放 3D 资源与监听器，避免积累。
7. **ref**：保存 Three.js 控制器和滚动进度。动画逐帧变化由场景控制器处理，避免整个 React 页面每帧重新渲染。
8. **自定义 Hook**：useLab、useAmbientSound、useMotionPreference 复用逻辑。
9. **路由与懒加载**：地址对应不同页面，只在需要时加载页面代码。
10. **Portal**：弹窗渲染到页面顶层，避免被某块内容挡住；同时管理键盘焦点。

TypeScript 是带类型检查的 JavaScript；这里主要约束作品种类、参数、组件输入。Three.js 和 GSAP 负责特殊视觉能力；React 负责组织与交互。当前项目不需要 Next.js，也没有后端。

## 修改顺序

先改一项能观察的效果 → 运行预览 → 检查桌面和手机 → 构建 → 提交。

样式小改先看 CSS；改变作品介绍先看数据；增加操作先看组件和共享状态；改变 3D 效果先看场景或模型。别为了一个视觉调整同时改所有文件。
