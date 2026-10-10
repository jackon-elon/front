# 影像设计素材记录

## 当前阅片协作照片

日期：2026-10-10。使用内置 imagegen 生成新的阅片空间照片，Pillow 仅转换为 WebP，没有裁切、调色或修改内容。发布路径：public/media/reading-room-editorial.webp，1672 × 941，140,292 字节。仅在解决方案出现一次，前端按布局裁切显示。照片为虚构设计场景。

原图：C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-ff2efe33-f9fb-4a6c-bdd1-7c373ccd5abe.png。

最终提示词：

```text
Use case: photorealistic-natural. Asset type: single premium editorial photograph for a dark medical imaging brand website, wide landscape 16:9. Primary request: a believable documentary-style photograph of two fictional East Asian radiologists working together at a professional reading workstation. Camera looks diagonally from behind and slightly to the side, waist-up medium wide, faces only subtle partial profiles, people in the middle and left half, not posing for camera. One seated female physician in her late thirties, one male colleague standing naturally beside her; ordinary white clinical coats, no stethoscope. One graphite medical display at right shows a restrained small grayscale knee imaging view and a few tiny neutral interface rules, no legible text. Dark modern reading room with charcoal walls and realistic wood or matte desk, soft daylight from a side window, refined warm-neutral ambient light, natural skin and fabric texture, clear realistic details. Both people and workstation are well exposed despite dark room. Calm professional collaboration, not dramatic or futuristic. Crisp editorial photography, no beauty smoothing, no plastic skin, no painterly blur, no oversaturated blue cast. Realistic proportions, natural hands resting on desk, no pointing fingers, no smiling promotional pose. No head scans, brain, skull, organs, horror, blood, exposed anatomy, holograms, floating screens, glowing neon, logos, names, text, numbers, watermark, or actual patient records. The entire photograph is a fictional design concept.
```

当前发布仅包含该照片与六帧合成影像图集，总计 496,964 字节。首屏与四种亮点由 React、CSS 与 SVG 绘制，避免放大图片中的界面文字。旧浅色终端与阅片空间照片分别归档到 docs/reference-assets/imaging-workstation-light.webp、docs/reference-assets/reading-room-light.webp，不进入部署输出。

## 历史浅色主视觉

日期：2026-10-10。内置 imagegen 生成，使用 Pillow 仅转为 WebP，没有裁切、调色或改动图像内容。历史归档路径：docs/reference-assets/imaging-workstation-light.webp，1672 × 941，42,910 字节。

原图：C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-6e46c002-7120-48c6-8264-cf6b52493d41.png。

最终提示词：

Use case: product-mockup. Asset type: wide 16:9 hero photograph for a refined light-themed medical imaging software brand website. Create premium realistic studio product photography of ONE generic professional silver desktop display on a seamless warm-white cyclorama and white tabletop. One display only, no phone, no extra screens. Front-facing slight three-quarter angle, fully contained inside frame, centered within middle 75 percent of image with soft natural grounding shadow, plenty of white surrounding space. Screen: beautifully restrained light-gray medical image review workspace, one modest grayscale healthy knee MRI view as a small local joint image in the center, a thin pale-blue navigation strip and simple light-gray report lines beside it, without readable labels. The medical image must occupy less than one-third of the screen, software chrome stays light. Brushed anodized silver enclosure, realistic subtle anti-reflective glass and slim graphite bezel, finely detailed stand. Daylight studio lighting, accurate material texture, exceptionally calm clinical sophistication. No head, skull, brain, organs, whole body, blood, pathology or horror. No floating glass, holograms, neon, gradients, dark scene, reflections of extra devices, brand logo, Apple products, readable text, letters, numbers or watermark. Design concept only, not actual patient imaging. Background corners and lower margin softly resolve to near white. High fidelity photographic composition.

四项亮点改为代码图形，远程会诊使用不同的协作角色图形；既有医生照片仅在解决方案章节使用一次。影像图集只用于实际阅片演示，多个帧用于表达同一份资料的不同视图。旧深色主视觉归档在 docs/reference-assets/imaging-workstation-dark.webp，不再发布。

## 历史深色主视觉

使用内置 imagegen 生成；仅转换为 WebP，没有改动图像内容。归档路径：`docs/reference-assets/imaging-workstation-dark.webp`，1672 × 941，95,340 字节。

原图：`C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-dd37bb5b-4289-4c0c-87b4-25173178f459.png`。

提示词：

```text
Use case: ads-marketing. Asset type: wide 16:9 hero photograph for a refined medical imaging software brand website. Primary request: premium studio product photography of medical image viewing across two thin professional graphite displays and one small portrait mobile display. These are generic display devices showcasing software, not MRI scanners or branded hardware. Scene: seamless pure black studio cyclorama, black floor with only a faint soft reflection, exceptionally restrained lighting. Composition: one large landscape display facing camera at a subtle 12 degree oblique angle, one slim rear display in elegant opposing perspective showing a small multi-frame contact sheet, one portrait phone in the lower right as a secondary object. All objects fully within the image, clustered in the central 75 percent of width; upper half and edges naturally fall into pure black, generous negative space, no dramatic floating holograms. Screens show extremely refined dark grayscale radiology viewing interfaces with small grayscale knee MRI views, thin muted steel-blue dividing lines, an understated report sidebar represented only by fine gray horizontal rules. Medical images are local joint views, controlled size, never enlarged anatomy. Realistic anti-reflective glass, fine graphite metal texture, delicate silver rim light, precise beveled edges, coherent scale, luxurious materials, no harsh glow. Image-specific grayscale content provides the visual interest. No readable text, no letters, no numbers, no labels, no logo, no watermark, no brand identification, no Apple products. No brain, no skull, no head, no face, no whole body, no blood, no organs, no pathology, no gore, no neon, no purple gradient, no cloudy glass cards, no giant acrylic MRI panels. Synthetic design concept, not an actual patient study. Keep presentation calm, photographic and sophisticated.
```

通用设备展示影像软件，不代表讯飞影联制造这些硬件。上述硬件主视觉均已归档，当前首屏直接呈现前端产品预览。

日期：2026-10-09。使用 imagegen 生成两张全新图片，未复制参考网站素材。WebP 仅作格式压缩，未更改生成图的内容或构图。

所有关节影像都是合成设计示意，不是患者影像、真实检查序列或诊断证据。六帧图集通过 CSS 定位用于界面展示；当前页面不再进行 Canvas 灰度映射。

## 历史银灰主视觉

历史归档路径：`docs/reference-assets/joint-imaging-hero.webp`，1672 × 941，119,288 字节。

生成原图：`C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-1fb0d156-ea8e-4689-9935-a46b3c1b87d0.png`。

提示词：

```text
Use case: ads-marketing. Asset type: premium medical imaging brand website hero, wide landscape 16:9. Create an exquisitely art-directed studio product photograph / photoreal CGI composition of three thin medical imaging glass panels, a refined showcase of radiology technology. Each panel contains small, exceptionally clear grayscale MRI images of a healthy human KNEE JOINT, with the central panel containing a tasteful four-image contact sheet and the side panels a single sagittal or coronal knee view. Only knee imaging, no other anatomy. The imaging views are cropped local scans, not a person or a giant isolated body part. Polished ultra-thin brushed-silver display edges and pristine clear glass, realistic bevels and subtle reflections. Panels float upright slightly fanned out in depth over a seamless very pale cool-gray studio background, with a soft realistic contact shadow below, generous quiet space. Central panel at a very slight angle, supporting panels at elegant oblique angles. Imagery occupies only a controlled portion of each glass panel, leaving generous soft silver surround, like a luxury technology product photographed in a beautiful daylight studio. Calm, luminous, sophisticated healthcare brand art direction, neutral silver and white materials with a restrained powder-blue reflection. Entire composition fully inside frame, panels centered and occupying the middle 70 percent width and lower 70 percent height. No head, no skull, no brain, no face, no chest, no lungs, no organs, no exposed tissue, no skin, no gore, no blood, no neon, no laser beam, no hologram, no UI buttons, no cartoon cloud icon. NO TEXT, NO letters, NO numbers, NO logo, NO watermark, NO patient information. This is a synthetic radiology illustration for design, not a real patient scan. High material fidelity and fine image texture.
```

## 六帧图集

发布路径：`public/media/joint-mri-atlas.webp`，1536 × 1024，356,672 字节。三列两行，每格 512 × 512。

生成原图：`C:/Users/32117/.codex/generated_images/01a11c15-1ce0-7e61-96a2-bd349443c0f9/exec-321cba49-d99f-4d5b-99bd-5cca0a9591b0.png`。

提示词：

```text
Use case: scientific-educational. Asset type: a clean MRI imagery atlas for a website design demo. Create a perfectly regular contact sheet of SIX grayscale sagittal MRI views of the SAME healthy knee joint. EXACT layout: THREE equal-width columns and TWO equal-height rows, all six panels exactly the same size, no margins, no gaps, no frame, no borders. Wide landscape 3:2 composition. Each tile is a square black radiology viewport with one high-resolution monochrome knee MRI centered inside and fully visible with black margin. The six images depict slightly different adjacent sagittal slices through the knee, from lateral through central to medial, reading left-to-right top row then bottom row. Show femoral condyle above and tibial plateau below, with gray soft tissues and fine scan texture, a restrained professional radiology appearance. Elegant clear clinical-style grayscale image contrast, no injuries, no pathology, no red tissue. No head, no skull, no brain, no face, no exposed skin, no blood, no gore, no other anatomy, no full body. No labels, no letters, no numbers, no UI, no measurement lines, no crosshairs, no patient metadata, no logo, no watermark. These are synthetic medical illustration slices for a front-end design demonstration, not a real patient study. Make the grid absolutely even so CSS can address each of the six square cells independently.
```

历史版本包含窗宽窗位演示；当前版本已删除相关 Canvas 和扫描交互，保留合成图集。
