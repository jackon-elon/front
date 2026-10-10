# 浏览器与性能验证

`npm test` 运行 30 项逻辑和 React DOM 测试，`npm run build` 构建生产输出，`npm run check:bundle` 检查输出资源预算。GitHub Actions 执行这三项；资源检查失败会阻止 CI 通过。

浏览器回归由 `scripts/browser-regression.mjs` 提供，使用 Codex 的 `cua_repl` 浏览器接口。脚本不启动浏览器、不连接隐藏传输通道，也不通过 evaluate 改变 DOM。它接受已经打开预览页面的 tab，依次点击真实控件和拖动影像。**这部分需要 Codex 浏览器会话，不是在 GitHub Actions 中执行的 E2E。**

在 cua_repl 中先创建或选择本地预览 tab，并读取运行时文档，然后导入本仓库脚本：

```js
const regression =
  await import("file:///绝对路径/front/scripts/browser-regression.mjs");
const result = await regression.runBrowserRegression(tab);
nodeRepl.write(result);
```

页面应在产品亮点处，建议地址为 `http://127.0.0.1:4173/?diagnostics=1#products`。桌面实际 CSS 视口 1440 × 1000；手机 390 × 844。移动页面还验证 `&motion=off`。每次运行要求先关闭已打开的弹窗；需要重置状态时重载页面。页面内匹配使用可访问名称；坐标拖动前读取当前画布位置并刷新截图映射。

每次有 14 项断言：虚拟列表、按钮缩放、可见坐标、框选、撤销、重做、跨帧隐藏和恢复、键盘缩放和移动、复位、无横向溢出、关闭恢复焦点与滚动、无控制台错误。结果保存在 `browser-desktop.json` 和 `browser-mobile.json`。截图属于视觉证据，布局尺寸也有断言；**尚未实现截图像素差异回归或多浏览器矩阵**。

## 性能数据

`?diagnostics=1` 启用本机采集，结果写在隐藏的 `#performance-diagnostics` output 中，没有外部上报。用 F12 选择该元素即可查看 JSON；普通访问没有这个元素，也不会注册这些性能观察器。

- 开发环境：App 与 ImageViewer 的 React Profiler 提交记录。示例在 `performance-development.json`，来自真实点击操作；开发计时包含 StrictMode 的影响，不代表生产耗时。
- 标准生产构建：React profiling 默认关闭，记录明确标为 disabled。PerformanceObserver 按浏览器支持项采集 FCP、LCP、长任务、原始布局偏移总和及采样交互时长。
- 后两项是诊断聚合值，**不是完整 CLS 或 INP**。本地缓存、机器性能、浏览器缩放和测试动作都会影响数值，结果不能代替真实用户监测或弱网测试。
- CI 预算：入口 JS gzip ≤ 135,000 字节，资料浏览 JS gzip ≤ 18,000 字节，入口 CSS gzip ≤ 13,000 字节，全部 WebP ≤ 1,700,000 字节。由 Node zlib 对最终文件计算，不以构建日志作为预算输入。

双指数学、触点切换、取消框选、RAF 合并和卸载清理通过单元及 DOM 测试；当前浏览器接口没有多点触控输入，尚未做实体触屏验证。实际滚轮、框选、撤销重做、键盘操作及 JSON 文件下载另有浏览器验证。

参考：[React Profiler](https://react.dev/reference/react/Profiler)、[PerformanceObserver](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceObserver)。
