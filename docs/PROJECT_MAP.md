# 项目定位图

所有正文和产品配置先从 `src/brand/content.ts` 找。页面骨架在 `BrandSite.tsx`，外观在 `src/site.css`。

- 首屏：`Hero` / `.hero` / `.hero-copy` / `.hero-visual`。
- 产品亮点：`Highlights` / `.highlight-card` / `.highlight-copy`。
- 云影像：`CloudProduct` / `.product-window` / `.workspace-content`。
- AI 对照：`ImagingAI` / `.comparison-view` / `.comparison-range`。
- 医疗 Agent：`MedicalAgent` / `.agent-product` / `.process-steps`。
- 解决方案：`Solutions` / `.solution-card` / `.solution-info`。
- 关于影联：`BrandSite` / `.about-content`。
- 联系弹窗：`BrandSite` / `.contact-modal` / `.contact-method`。
- 通用弹窗：`components/Modal.tsx` / `.modal`。
- 手机适配：`site.css` 底部 `@media`，600 px 以下为手机主要布局。

描述微调时，可以直接说：把首页 `.hero h1` 字号减小一点；把云影像 `.product-window` 加宽；让医疗 Agent 的最后一步保持等待人工确认。无需复制整页代码。
