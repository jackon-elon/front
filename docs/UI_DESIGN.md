# UI 设计与素材

## 视觉方向

参考 [Apple MacBook Pro 产品页](https://www.apple.com/macbook-pro/) 的中心主角、近看细节、全幅场景与内容节奏。首页改为一条影像的连续旅程，产品交互放入按需加载展台，减少重复产品区块。代码与素材为本项目实现，没有复制 Apple 页面源码或素材。

颜色以石墨黑、暖白、浅灰和医疗蓝为主。主标题桌面约 68–112 px，章节标题约 42–74 px，正文主要为 17–21 px。手机端重新排版，而不是整体缩小。字体采用设备系统字体，避免外部字体请求影响首屏。

黑色首屏以居中标题与对称双面玻璃影像为主角。之后固定在同一个画面内推进：浅色切片展开连接云端；黑色近看聚焦影像细节；浅色报告卡片展示协同路径。最后切入全幅温暖阅片空间。首页标题不随主视觉横向移动。

滚动旅程使用 420svh 轨道与 sticky 视口，MotionValue 映射切片位移、旋转、缩放、背景与扫描线。React 章节状态管理单个标题与产品入口，避免多层文字重叠。Tab 使用短转场；弹窗使用 Portal 和焦点逻辑；Agent 以可取消状态迁移驱动进度。系统 prefers-reduced-motion 或 `?motion=off` 会改用三个普通静态章节。

## 生成素材

使用内置 imagegen 生成，原图保留在 Codex generated_images 目录。项目使用 WebP 压缩版，保持画面内容：

- `public/media/imaging-glass.webp`：1672 × 941，约 139 KB。玻璃医学影像切片模型。
- `public/media/reading-room.webp`：1672 × 941，约 128 KB。医生阅片协作空间。
- `public/media/imaging-hero-v2.webp`：1672 × 941，对称双面影像与玻璃切片，是新版首屏主视觉。
- `public/media/imaging-slice.webp`：1086 × 1448，保留透明通道的单张影像玻璃面板；多层展开由前端几何变换实现。

新版主视觉原图：`C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-53d1b7ab-1bf7-4362-ad57-4f9534e16e0a.png`。

新版主视觉提示词：

> Premium studio product photograph / photorealistic CGI medical technology hero visual, panoramic landscape 16:9. On an absolutely black seamless background, two exquisite thin freestanding dark glass anatomical imaging panels form a refined open V shape in the exact center of the composition, like two carefully crafted physical objects displayed on a dark studio surface. The left panel contains a silver grayscale axial brain cross-section and the right panel a silver grayscale sagittal brain cross-section. Additional thin glass slices trail behind both panels like a precise accordion stack, revealing depth. Each glass panel has immaculate rounded corners, polished silver beveled edges, finely detailed translucent anatomical tissues within, subtle cool white studio rim light, realistic dark charcoal reflections. A beautiful low-angle central symmetrical composition, object entirely inside frame with substantial quiet black space above. Elegant calm and sculptural, luxury industrial product photography with precise material realism and glossy glass detail. No head skull or human bust, no text, no numbers, no branding, no HUD, no neon, no particles, no blue haze, no medical diagnosis callouts. Medical art illustration, not real patient scans. The panels occupy the middle 70 percent of image width and lower 75 percent of image height.

透明面板原图：`C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-ac9b69ff-cf40-4a25-8565-565b2425d262.png`。

透明面板提示词：

> Create a single isolated photorealistic medical imaging glass panel, portrait 3:4 asset, on a fully transparent background. One very thin pristine glass sheet with subtle rounded corners and polished beveled edges, seen almost straight-on with extremely slight three-quarter perspective. In the center of the dark translucent sheet is an exquisite grayscale axial brain MRI style illustration, an oval anatomical cross-section with rich fine details, symmetrical cerebral folds and small ventricles, pale silver-white tissues against the transparent charcoal glass. The whole panel fully visible with generous transparent margin, only this one panel, no surface underneath, no stand, no cast shadow outside panel. Premium studio product render, calm restrained Apple-like hardware material quality, precise polished glass edges with minimal cool silver-blue reflections. No text, no numbers, no logos, no sci-fi HUD, no colorful rings, no beams, no chart, no realistic patient identification. This is an illustrative anatomical art asset, not a real patient scan.

展台旧主视觉提示词：

> Create a premium photorealistic CGI medical technology product visual for a Chinese healthcare cloud imaging brand website, landscape 16:9. On a seamless very dark charcoal black background, an exquisitely detailed translucent frosted-glass human head and upper neck in three-quarter profile facing left, with a scientifically inspired three dimensional brain visible inside. The head is built out of many precise, very thin parallel MRI / CT volume slices, with a few elegant glass slice panels floating slightly separated to its right. Position the sculpture in the center-right of the composition; the left third mostly quiet black negative space. Clear cool silver anatomical structures, soft icy blue light passing through the glass, subtle warm gray reflections, dense realistic fine material detail, polished edges, physically realistic subsurface scattering. High-end studio product photography, like an Apple hardware campaign photographed as a sculptural object; calm, powerful, sophisticated, extremely clean art direction. The whole sculpture well within frame, no cropping of head. No text, no numbers, no logos, no UI, no chart, no neon beams, no particles, no network nodes, no purple, no sci-fi HUD, no stars. Illustration only, not an actual patient scan.

协作空间提示词：

> Premium architectural editorial photograph for a sophisticated healthcare technology company website, very wide landscape 16:9 composition. A beautiful contemporary hospital radiology consultation space in China, warm pale oak, matte warm white walls, floor to ceiling glass partitions, diffuse natural light from large windows. Two Chinese medical specialists in clean white coats seen mostly from behind, quietly collaborating at a long minimal workstation. Large dark diagnostic monitors displaying subtle grayscale medical scan imagery WITHOUT readable text. The people are small within the spacious architecture, the right half dominated by window light and layered glass. Refined restrained hospital architecture, realistic material textures, soft shadows, architectural magazine photography, premium Apple product lifestyle photograph quality, quiet humane atmosphere. No camera-facing portrait, no exaggerated futuristic holograms, no blue neon, no dramatic emergency, no robots, no logos, no visible text, no watermark. Beautiful natural desaturated warm color grading, photographed with 35mm lens.

几何标识为本项目绘制的概念标识，不是官方 Logo。产品界面以 HTML/CSS 实现，可访问性与交互状态由 React 管理。

## 公开内容来源

- [影联网公开平台](https://www.imagingunion.com/iunet/login)：平台业务定位、服务协议与客服热线、联系邮箱。
- [数坤科技官方网站](https://shukun.net/)：2026-06-04 的讯飞影联区域影像云与医学影像 AI 合作动态。
- [合作动态入口](https://shukun.net/news/8/335.html)：官方新闻入口会跳转到官方微信文章。

未添加医院客户 Logo、医疗性能数字、诊断准确率、资质证书或虚构临床案例。医疗 Agent 按用户指定方向设计为协作场景概念，不声称已正式发布某个产品。
