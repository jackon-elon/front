// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InteractiveImageViewer } from "./InteractiveImageViewer";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement, root: Root;
let queue: Map<number, FrameRequestCallback>, sequence: number;
beforeEach(() => {
  queue = new Map();
  sequence = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    queue.set(++sequence, callback);
    return sequence;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => queue.delete(id));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 400,
    bottom: 400,
    width: 400,
    height: 400,
    toJSON: () => ({}),
  });
  // jsdom has no pointer capture or native touch input; test the actual React
  // handlers with a small DOM polyfill, not the browser's gesture synthesis.
  Object.defineProperties(HTMLElement.prototype, {
    setPointerCapture: { configurable: true, value: () => {} },
    hasPointerCapture: { configurable: true, value: () => true },
    releasePointerCapture: { configurable: true, value: () => {} },
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const name of [
    "setPointerCapture",
    "hasPointerCapture",
    "releasePointerCapture",
  ])
    delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name];
});
const flush = async () => {
  await act(() => {
    const callbacks = [...queue.values()];
    queue.clear();
    callbacks.forEach((callback) => callback(0));
  });
};
const button = (label: string) =>
  container.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
const pointer = async (type: string, id: number, x: number, y: number) => {
  const event = new MouseEvent(type, {
    bubbles: true,
    clientX: x,
    clientY: y,
    button: 0,
  });
  Object.defineProperty(event, "pointerId", { value: id });
  await act(() =>
    container.querySelector(".viewer-stage")!.dispatchEvent(event),
  );
};
const count = () => container.querySelectorAll(".annotation").length;
describe("interactive viewer event lifecycle", () => {
  it("commits marks by frame, cancels drafts, and restores them through history", async () => {
    const render = (frame: number) =>
      root.render(<InteractiveImageViewer frame={frame} recordId="DEMO-1" />);
    await act(() => render(0));
    await act(() => button("框选标注").click());
    await pointer("pointerdown", 1, 80, 80);
    await pointer("pointermove", 1, 200, 240);
    await pointer("pointerup", 1, 200, 240);
    expect(count()).toBe(1);
    await act(() => render(1));
    expect(count()).toBe(0);
    await act(() => render(0));
    expect(count()).toBe(1);
    await pointer("pointerdown", 2, 100, 100);
    await pointer("pointermove", 2, 250, 250);
    await pointer("pointercancel", 2, 250, 250);
    expect(count()).toBe(1);
    expect(container.querySelector(".annotation-draft")).toBeNull();
    await act(() => button("撤销标注").click());
    expect(count()).toBe(0);
    await act(() => button("重做标注").click());
    expect(count()).toBe(1);
  });
  it("coalesces pan frames, cancels annotation when a second touch pinches, and cleans RAF on unmount", async () => {
    await act(() =>
      root.render(<InteractiveImageViewer frame={0} recordId="DEMO-1" />),
    );
    await act(() => button("框选标注").click());
    await pointer("pointerdown", 1, 120, 200);
    await pointer("pointerdown", 2, 280, 200);
    await pointer("pointermove", 1, 80, 200);
    await pointer("pointermove", 2, 320, 200);
    expect(queue.size).toBe(1);
    await flush();
    expect(container.querySelector("output")!.textContent).toBe("150%");
    await pointer("pointerup", 2, 320, 200);
    await pointer("pointermove", 1, 120, 200);
    await pointer("pointermove", 1, 140, 200);
    expect(queue.size).toBe(1);
    await flush();
    const transform = container.querySelector<HTMLElement>(
      ".viewer-image-plane",
    )!.style.transform;
    expect(Number.parseFloat(transform.slice("translate(".length))).toBeCloseTo(
      15,
    );
    expect(count()).toBe(0);
    await pointer("pointermove", 1, 160, 200);
    expect(queue.size).toBe(1);
    await act(() => root.unmount());
    expect(queue.size).toBe(0);
    root = createRoot(container);
  });
  it("exports normalized annotations and revokes the download URL", async () => {
    vi.useFakeTimers();
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: vi.fn(() => "blob:demo") },
      revokeObjectURL: { configurable: true, value: vi.fn() },
    });
    const download = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    try {
      await act(() =>
        root.render(<InteractiveImageViewer frame={0} recordId="DEMO-1" />),
      );
      await act(() => button("框选标注").click());
      await pointer("pointerdown", 1, 80, 80);
      await pointer("pointerup", 1, 160, 200);
      await act(() => button("导出示意标注").click());
      expect(download).toHaveBeenCalledOnce();
      expect(URL.createObjectURL).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(1000);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:demo");
    } finally {
      vi.useRealTimers();
    }
  });
});
