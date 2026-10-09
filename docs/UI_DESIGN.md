# UI 设计与素材

## 视觉方向

采用苹果产品页常见的视觉组织方式：沉浸式产品主图、大字号标题、单一核心观点、宽幅产品亮点、功能场景切换与详情弹窗。所有代码与素材均为本项目实现，没有复制 Apple 页面源码或素材。

颜色以石墨黑、暖白、浅灰和医疗蓝为主。主标题桌面约 60–90 px，章节标题约 44–68 px，正文主要为 17–21 px。手机端重新排版，而不是整体缩小。字体采用设备系统字体，避免外部字体请求影响首屏。

黑色首屏呈现医学影像的切片质感；浅色云影像章节呈现协作产品；黑色 AI 章节提供影像对照；浅色 Agent 章节提供明确的协同路径；温暖的阅片空间平衡技术视觉。

动画服务于内容与操作：首屏仅图片有限移动；卡片使用原生滚动吸附；Tab 内容使用短转场；弹窗使用原有 Portal 和焦点逻辑；Agent 以可取消状态迁移驱动进度。支持 prefers-reduced-motion。

## 生成素材

使用内置 imagegen 生成，原图保留在 Codex generated_images 目录。项目使用 WebP 压缩版，保持画面内容：

- `public/media/imaging-glass.webp`：1672 × 941，约 139 KB。玻璃医学影像切片模型。
- `public/media/reading-room.webp`：1672 × 941，约 128 KB。医生阅片协作空间。

主视觉提示词：

> Create a premium photorealistic CGI medical technology product visual for a Chinese healthcare cloud imaging brand website, landscape 16:9. On a seamless very dark charcoal black background, an exquisitely detailed translucent frosted-glass human head and upper neck in three-quarter profile facing left, with a scientifically inspired three dimensional brain visible inside. The head is built out of many precise, very thin parallel MRI / CT volume slices, with a few elegant glass slice panels floating slightly separated to its right. Position the sculpture in the center-right of the composition; the left third mostly quiet black negative space. Clear cool silver anatomical structures, soft icy blue light passing through the glass, subtle warm gray reflections, dense realistic fine material detail, polished edges, physically realistic subsurface scattering. High-end studio product photography, like an Apple hardware campaign photographed as a sculptural object; calm, powerful, sophisticated, extremely clean art direction. The whole sculpture well within frame, no cropping of head. No text, no numbers, no logos, no UI, no chart, no neon beams, no particles, no network nodes, no purple, no sci-fi HUD, no stars. Illustration only, not an actual patient scan.

协作空间提示词：

> Premium architectural editorial photograph for a sophisticated healthcare technology company website, very wide landscape 16:9 composition. A beautiful contemporary hospital radiology consultation space in China, warm pale oak, matte warm white walls, floor to ceiling glass partitions, diffuse natural light from large windows. Two Chinese medical specialists in clean white coats seen mostly from behind, quietly collaborating at a long minimal workstation. Large dark diagnostic monitors displaying subtle grayscale medical scan imagery WITHOUT readable text. The people are small within the spacious architecture, the right half dominated by window light and layered glass. Refined restrained hospital architecture, realistic material textures, soft shadows, architectural magazine photography, premium Apple product lifestyle photograph quality, quiet humane atmosphere. No camera-facing portrait, no exaggerated futuristic holograms, no blue neon, no dramatic emergency, no robots, no logos, no visible text, no watermark. Beautiful natural desaturated warm color grading, photographed with 35mm lens.

几何标识为本项目绘制的概念标识，不是官方 Logo。产品界面以 HTML/CSS 实现，可访问性与交互状态由 React 管理。

## 公开内容来源

- [影联网公开平台](https://www.imagingunion.com/iunet/login)：平台业务定位、服务协议与客服热线、联系邮箱。
- [数坤科技官方网站](https://shukun.net/)：2026-06-04 的讯飞影联区域影像云与医学影像 AI 合作动态。
- [合作动态入口](https://shukun.net/news/8/335.html)：官方新闻入口会跳转到官方微信文章。

未添加医院客户 Logo、医疗性能数字、诊断准确率、资质证书或虚构临床案例。医疗 Agent 按用户指定方向设计为协作场景概念，不声称已正式发布某个产品。
