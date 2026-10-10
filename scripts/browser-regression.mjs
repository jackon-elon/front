// Run inside Codex cua_repl with its documented tab handle. This script never
// starts a browser, opens an external transport, or mutates the DOM via evaluate.
export async function runBrowserRegression(tab) {
  const results = [];
  const assert = (condition, name, evidence) => {
    if (!condition) throw new Error(`${name}: ${JSON.stringify(evidence)}`);
    results.push({ name, passed: true, evidence });
  };
  const observe = () => tab.getAXState({ emit: false });
  const click = async (label) => {
    await tab.playwright.getByLabel(label, { exact: true }).click();
    await observe();
  };
  const opener = tab.playwright.getByRole("button", {
    name: "了解区域影像云",
    exact: true,
  });
  await opener.click();
  await observe();
  const browse = tab.playwright.getByRole("button", {
    name: "浏览影像资料",
    exact: true,
  });
  await browse.waitFor({ state: "visible" });
  await browse.click();
  await observe();
  await tab.playwright
    .getByLabel("交互影像画布", { exact: true })
    .waitFor({ state: "visible" });
  const rows = await tab.playwright.getByRole("option").count();
  assert(rows > 0 && rows < 30, "6000-row list stays virtualized", {
    mounted: rows,
  });
  await click("放大影像");
  const ratio = await tab.playwright
    .getByLabel("影像缩放比例", { exact: true })
    .textContent();
  assert(ratio === "125%", "toolbar zoom", ratio);
  // Frame controls scroll the viewer into the viewport through real UI actions.
  await click("下一帧资料影像");
  await click("上一帧资料影像");
  await click("框选标注");
  const rect = await tab.playwright.evaluate(() => {
    const r = document.querySelector(".viewer-stage").getBoundingClientRect();
    return {
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
      viewportHeight: document.documentElement.clientHeight,
    };
  });
  const from = [rect.x + rect.width * 0.35, rect.y + rect.height * 0.35];
  const to = [rect.x + rect.width * 0.65, rect.y + rect.height * 0.65];
  assert(
    from[1] > 0 && to[1] < rect.viewportHeight,
    "annotation coordinates are visible",
    rect,
  );
  await tab.getScreenshot({ emit: false });
  await tab.drag(from, to);
  await observe();
  const marks = () =>
    tab.playwright.evaluate(
      () => document.querySelectorAll(".annotation").length,
    );
  assert((await marks()) === 1, "pointer rectangle annotation", await marks());
  await click("撤销标注");
  assert((await marks()) === 0, "undo", await marks());
  await click("重做标注");
  assert((await marks()) === 1, "redo", await marks());
  await click("下一帧资料影像");
  assert(
    (await marks()) === 0,
    "marks are scoped to their frame",
    await marks(),
  );
  await click("上一帧资料影像");
  assert(
    (await marks()) === 1,
    "returning to frame restores marks",
    await marks(),
  );
  await click("拖拽影像");
  const canvas = tab.playwright.getByLabel("交互影像画布", { exact: true });
  await canvas.press("+");
  await observe();
  assert(
    (await tab.playwright
      .getByLabel("影像缩放比例", { exact: true })
      .textContent()) === "150%",
    "keyboard zoom",
    "150%",
  );
  await canvas.press("ArrowLeft");
  await observe();
  const transform = await tab.playwright.evaluate(
    () => document.querySelector(".viewer-image-plane").style.transform,
  );
  assert(!transform.startsWith("translate(0%, 0%)"), "keyboard pan", transform);
  await click("复位影像视图");
  assert(
    (await tab.playwright
      .getByLabel("影像缩放比例", { exact: true })
      .textContent()) === "100%",
    "reset view",
    "100%",
  );
  const geometry = await tab.playwright.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return {
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      dialog: d.clientWidth,
      content: d.scrollWidth,
    };
  });
  assert(
    geometry.document <= geometry.viewport + 1 &&
      geometry.content <= geometry.dialog + 1,
    "no horizontal overflow",
    geometry,
  );
  await click("关闭弹窗");
  await tab.playwright.getByRole("dialog").waitFor({ state: "detached" });
  const restored = await tab.playwright.evaluate(() => ({
    focus: document.activeElement.getAttribute("aria-label"),
    overflow: document.body.style.overflow,
  }));
  assert(
    restored.focus === "了解区域影像云" && restored.overflow !== "hidden",
    "close restores opener focus and page scrolling",
    restored,
  );
  const errors = await tab.dev.logs({ levels: ["error"], limit: 20 });
  assert(errors.length === 0, "browser console has no errors", errors);
  const performance = await tab.playwright.evaluate(
    () =>
      document.getElementById("performance-diagnostics")?.textContent ?? null,
  );
  return { results, diagnostics: performance ? JSON.parse(performance) : null };
}

// A native click avoids a locator's automatic scroll-into-view being mistaken
// for an application scroll jump. Measure only once the entry is visible.
export async function runModalStabilityRegression(tab) {
  const results = [];
  const opener = tab.playwright.getByRole("button", {
    name: "深入了解影像云",
    exact: true,
  });
  await opener.press("Escape");
  await tab.getAXState({ emit: false });
  const measure = () =>
    tab.playwright.evaluate(() => {
      const title = document
        .getElementById("cloud-showcase-title")
        .getBoundingClientRect();
      const button = [...document.querySelectorAll("button")]
        .find((element) => element.textContent.includes("深入了解影像云"))
        .getBoundingClientRect();
      const modal = document.querySelector('[role="dialog"]');
      const rect = modal?.getBoundingClientRect();
      return {
        x: title.x,
        y: title.y,
        width: title.width,
        scroll: document.scrollingElement.scrollTop,
        bodyWidth: document.body.getBoundingClientRect().width,
        button: {
          x: button.x + button.width / 2,
          y: button.y + button.height / 2,
        },
        viewportHeight: document.documentElement.clientHeight,
        modal: rect ? { y: rect.y, height: rect.height } : null,
      };
    });
  for (let round = 1; round <= 3; round++) {
    await tab.getScreenshot({ emit: false });
    const before = await measure();
    if (before.button.y <= 0 || before.button.y >= before.viewportHeight)
      throw new Error("Product entry is outside the measured viewport");
    await tab.click([before.button.x, before.button.y]);
    await tab.getAXState({ emit: false });
    await tab.playwright.getByRole("dialog").waitFor({ state: "visible" });
    const during = await measure();
    await tab.playwright.getByLabel("关闭弹窗", { exact: true }).click();
    await tab.playwright.getByRole("dialog").waitFor({ state: "detached" });
    await tab.getAXState({ emit: false });
    const after = await measure();
    const keys = ["x", "y", "width", "scroll", "bodyWidth"];
    const stable = [during, after].every((value) =>
      keys.every((key) => Math.abs(value[key] - before[key]) < 1),
    );
    const evidence = { before, during, after };
    if (!stable)
      throw new Error(`Modal round ${round}: ${JSON.stringify(evidence)}`);
    results.push({
      name: `modal round ${round} preserves page geometry`,
      passed: true,
      evidence,
    });
  }
  return { results };
}
