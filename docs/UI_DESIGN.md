# UI 设计与素材

参考 [Apple MacBook Pro 产品页](https://www.apple.com/macbook-pro/) 的主角、近看细节、全幅场景与内容节奏，首页以连续旅程组织产品故事。没有使用 Apple 的代码或素材。

## 当前视觉

主视觉回到医学影像：在明亮的银灰空间中展示三块轻薄影像板，影像选用关节 MRI 设计素材。参考 [西门子 MRI 官网](https://www.siemens-healthineers.com/magnetic-resonance-imaging)、[肌骨影像页面](https://www.siemens-healthineers.com/magnetic-resonance-imaging/clinical-specialities/musculoskeletal-imaging)与 [GE MRI 官网](https://www.gehealthcare.com/en-us/products/magnetic-resonance-imaging)的产品呈现与影像内容组织。没有使用这些公司的照片、代码或标识。

`RadiologyFilm.tsx` 是共用的 React 影像板组件，通过一张三列两行图集显示六帧合成影像。云影像展台与滚动场景共用此组件；阅片展台叠加 Canvas2D 灰度映射，帧选择、窗宽、窗位与对照线由 React state 控制。素材不是实际患者检查序列，灰度调整不是 DICOM 诊断或 AI 推理。

浅色首屏以居中标题和影像产品摄影为主角；浅色章节展开影像层次；深色章节收拢影像板并近看局部；浅色章节转入协作报告；最后进入全幅医疗协作照片。影像展示控制占比，避免大幅头颅或脑部解剖图。

字号、章节导航和 420svh 连续滚动轨道保持原有设计。MotionValue 驱动位置、旋转、缩放、背景与扫描线，React state 管理当前标题与展台入口。系统减少动态效果或 ?motion=off 改为三个普通静态章节。主标题不横向移动。

## 素材管理

发布三张 WebP 素材，共 604,456 字节：`joint-imaging-hero.webp`（1672 × 941，119,288 字节）、`joint-mri-atlas.webp`（1536 × 1024，356,672 字节）、`reading-room.webp`（1672 × 941，128,496 字节）。都是生成的设计素材。[新影像素材记录](RADIOLOGY_ASSETS.md)保留生成提示词、原图路径和用途。

旧解剖学图片移到 `docs/reference-assets/` 作为设计历史，不进入 dist，也不再被页面引用。此前生成提示词和原图路径保留在 [素材历史](reference-assets/ASSET_HISTORY.md)；其中 public 路径是归档前记录。

几何标识为概念标识，非官方 Logo。协作空间、产品界面和流程均为设计示意，没有真实患者资料或临床分析。

## 公开内容来源

- [影联网公开平台](https://www.imagingunion.com/iunet/login)：平台业务定位、服务协议、客服热线和联系邮箱。
- [数坤科技官方网站](https://shukun.net/)：讯飞影联区域影像云与医学影像 AI 合作动态。
- [合作动态入口](https://shukun.net/news/8/335.html)：官方新闻入口。

没有添加医院客户 Logo、诊断准确率或虚构临床案例；医疗 Agent 为协作场景概念，不声称已正式发布某个产品。
