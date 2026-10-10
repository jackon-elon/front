// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { lockPageScroll } from "./scrollLock";
afterEach(() => {
  vi.restoreAllMocks();
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});
it("compensates removed scrollbar width without losing existing padding, and restores after the last owner", () => {
  document.body.style.paddingRight = "13px";
  document.body.style.overflow = "auto";
  vi.spyOn(document.body, "getBoundingClientRect").mockImplementation(
    () =>
      ({
        width: document.body.style.overflow === "hidden" ? 1440 : 1425,
      }) as DOMRect,
  );
  const first = lockPageScroll(),
    second = lockPageScroll();
  expect(document.body.style.paddingRight).toBe("28px");
  first();
  first();
  expect(document.body.style.overflow).toBe("hidden");
  second();
  expect(document.body.style.overflow).toBe("auto");
  expect(document.body.style.paddingRight).toBe("13px");
});
it("does not add padding when a stable gutter already preserves the width", () => {
  vi.spyOn(document.body, "getBoundingClientRect").mockReturnValue({
    width: 1425,
  } as DOMRect);
  const release = lockPageScroll();
  expect(document.body.style.paddingRight).toBe("");
  release();
  expect(document.body.style.overflow).toBe("");
});
