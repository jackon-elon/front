# 影像设计素材记录

日期：2026-10-09。使用 imagegen 生成两张全新图片，未复制参考网站素材。WebP 仅作格式压缩，未更改生成图的内容或构图。

所有关节影像都是合成设计示意，不是患者影像、真实检查序列或诊断证据。六帧图集通过 CSS 定位和 Canvas 裁切用于前端交互。

## 官网主视觉

发布路径：`public/media/joint-imaging-hero.webp`，1672 × 941，119,288 字节。

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

窗宽窗位演示对 8 位灰度图片作线性映射，不解析 DICOM、不调用诊断模型，也不代表临床参数。
