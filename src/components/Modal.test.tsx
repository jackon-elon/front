// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { RenderBoundary } from "./RenderBoundary";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
it("keeps Tab in a failed dialog and restores the opener on Escape", async () => {
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  const rectangles = vi
    .spyOn(HTMLElement.prototype, "getClientRects")
    .mockReturnValue([{}] as unknown as DOMRectList);
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container, { onCaughtError: () => {} });
  function Fragile() {
    const [failed, setFailed] = useState(false);
    if (failed) throw new Error("render failure");
    return <button onClick={() => setFailed(true)}>引发组件错误</button>;
  }
  const view = (open: boolean) => (
    <>
      <button>详情入口</button>
      <Modal
        open={open}
        title="受控体验"
        onClose={() => root.render(view(false))}
      >
        <RenderBoundary>
          <Fragile />
        </RenderBoundary>
      </Modal>
    </>
  );
  try {
    await act(() => root.render(view(false)));
    const opener = container.querySelector("button")!;
    opener.focus();
    await act(() => root.render(view(true)));
    const trigger = [...document.querySelectorAll("button")].find(
      (button) => button.textContent === "引发组件错误",
    )!;
    trigger.focus();
    await act(() => trigger.click());
    expect(document.querySelector('[role="alert"]')).not.toBeNull();
    expect(document.activeElement).toBe(document.body);
    await act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(document.activeElement?.getAttribute("aria-label")).toBe("关闭弹窗");
    document.body.focus();
    // Explicitly blur the surviving control to simulate another removed focus.
    (document.activeElement as HTMLElement).blur();
    await act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(document.activeElement?.textContent).toContain("重新加载页面");
    await act(() =>
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  } finally {
    await act(() => root.unmount());
    container.remove();
    rectangles.mockRestore();
    vi.unstubAllGlobals();
  }
});
