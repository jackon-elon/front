// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudyRow } from "./StudyRow";
import { catalog } from "./catalog";
import { ImageFrame } from "../ImageFrame";

vi.mock("../ImageFrame", () => ({ ImageFrame: vi.fn(() => <div />) }));
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.mocked(ImageFrame).mockClear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});
describe("memoized study rows", () => {
  it("does not render the thumbnail again for an unrelated parent update", async () => {
    const onSelect = vi.fn();
    const view = (heading: string, selected = false) => (
      <>
        <h3>{heading}</h3>
        <StudyRow
          study={catalog[0]}
          selected={selected}
          bookmarked={false}
          position={1}
          total={6000}
          onSelect={onSelect}
        />
      </>
    );
    await act(() => root.render(view("标题一")));
    expect(ImageFrame).toHaveBeenCalledTimes(1);
    await act(() => root.render(view("标题二")));
    expect(ImageFrame).toHaveBeenCalledTimes(1);
    await act(() => root.render(view("标题二", true)));
    expect(ImageFrame).toHaveBeenCalledTimes(2);
    expect(
      container.querySelector('[role="option"]')?.getAttribute("aria-selected"),
    ).toBe("true");
  });
  it("selects the stable ID and exposes the position in the full result set", async () => {
    const onSelect = vi.fn();
    await act(() =>
      root.render(
        <StudyRow
          study={catalog[5999]}
          selected={false}
          bookmarked
          position={6000}
          total={6000}
          onSelect={onSelect}
        />,
      ),
    );
    const option = container.querySelector<HTMLElement>('[role="option"]')!;
    await act(() => option.click());
    expect(onSelect).toHaveBeenCalledWith("DEMO-06000");
    expect(option.getAttribute("aria-posinset")).toBe("6000");
    expect(option.getAttribute("aria-setsize")).toBe("6000");
    expect(option.getAttribute("aria-label")).toContain("已收藏");
  });
});
