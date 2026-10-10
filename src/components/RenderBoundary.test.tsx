// @vitest-environment jsdom
import { act, lazy, Suspense, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RenderBoundary } from "./RenderBoundary";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container, { onCaughtError: () => {} });
});
afterEach(async () => {
  await act(() => root.unmount());
  container.remove();
});

describe("render failure containment", () => {
  it("keeps the surrounding interface usable when a child throws", async () => {
    function Broken() {
      throw new Error("sensitive internal detail");
      return null;
    }
    await act(() =>
      root.render(
        <>
          <button>外部导航</button>
          <RenderBoundary>
            <Broken />
          </RenderBoundary>
        </>,
      ),
    );
    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      "重试显示",
    );
    expect(container.textContent).not.toContain("sensitive internal detail");
    expect(container.querySelector("button")?.textContent).toBe("外部导航");
  });
  it("remounts recovered content with fresh local state on retry", async () => {
    let fail = false;
    function Child() {
      const [count, setCount] = useState(0);
      if (fail) throw new Error("failed");
      return (
        <button onClick={() => setCount((value) => value + 1)}>
          计数 {count}
        </button>
      );
    }
    const view = () => (
      <RenderBoundary>
        <Child />
      </RenderBoundary>
    );
    await act(() => root.render(view()));
    await act(() => container.querySelector("button")!.click());
    expect(container.textContent).toBe("计数 1");
    fail = true;
    await act(() => root.render(view()));
    fail = false;
    await act(() => container.querySelector("button")!.click());
    expect(container.textContent).toBe("计数 0");
  });
  it("catches a rejected lazy import outside Suspense", async () => {
    const BrokenModule = lazy(() => Promise.reject(new Error("module failed")));
    await act(async () => {
      root.render(
        <RenderBoundary>
          <Suspense fallback={<p>加载中</p>}>
            <BrokenModule />
          </Suspense>
        </RenderBoundary>,
      );
    });
    expect(container.querySelector('[role="alert"]')).not.toBeNull();
    expect(container.textContent).toContain("重新加载页面");
  });
});
