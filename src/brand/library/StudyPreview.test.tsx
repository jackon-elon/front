// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudyPreview } from "./StudyPreview";
import { catalog } from "./catalog";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
const button = (name: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`)!;
describe("study preview", () => {
  it("enforces both frame boundaries and resets for a new record", async () => {
    const onBookmark = vi.fn();
    await act(() =>
      root.render(
        <StudyPreview
          key={catalog[0].id}
          study={catalog[0]}
          bookmarked={false}
          onBookmark={onBookmark}
        />,
      ),
    );
    expect(button("上一帧资料影像").disabled).toBe(true);
    for (let i = 0; i < 5; i++)
      await act(() => button("下一帧资料影像").click());
    expect(button("下一帧资料影像").disabled).toBe(true);
    expect(
      container.querySelector('[role="img"]')?.getAttribute("aria-label"),
    ).toContain("第 6 帧");
    await act(() =>
      root.render(
        <StudyPreview
          key={catalog[1].id}
          study={catalog[1]}
          bookmarked={false}
          onBookmark={onBookmark}
        />,
      ),
    );
    expect(
      container.querySelector('[role="img"]')?.getAttribute("aria-label"),
    ).toContain("第 2 帧");
  });
  it("bookmarks the selected record without resetting its current frame", async () => {
    const onBookmark = vi.fn();
    const view = (bookmarked: boolean) => (
      <StudyPreview
        study={catalog[0]}
        bookmarked={bookmarked}
        onBookmark={onBookmark}
      />
    );
    await act(() => root.render(view(false)));
    await act(() => button("下一帧资料影像").click());
    await act(() => button("收藏当前资料").click());
    expect(onBookmark).toHaveBeenCalledWith("DEMO-00001");
    await act(() => root.render(view(true)));
    expect(button("取消收藏当前资料").getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(
      container.querySelector('[role="img"]')?.getAttribute("aria-label"),
    ).toContain("第 2 帧");
  });
});
