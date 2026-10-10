// @vitest-environment jsdom
import { act, Suspense, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { preloadable } from "./preloadable";
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let host: HTMLDivElement, root: Root;
beforeEach(() => {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(() => root.unmount());
  host.remove();
});
it("shares preload requests and renders a warm module without mounting the loading fallback", async () => {
  function Content({ name }: { name: string }) {
    return <p>{name}</p>;
  }
  const loader = vi.fn(async () => ({ default: Content }));
  const resource = preloadable(loader);
  await Promise.all([resource.preload(), resource.preload()]);
  const fallback = vi.fn(() => <span>加载中</span>);
  const Fallback = fallback;
  await act(() =>
    root.render(
      <Suspense fallback={<Fallback />}>
        <resource.Component name="产品" />
      </Suspense>,
    ),
  );
  expect(loader).toHaveBeenCalledOnce();
  expect(fallback).not.toHaveBeenCalled();
  expect(host.textContent).toBe("产品");
});
it("keeps edits after a cold lazy load resolves and its parent updates", async () => {
  function Content({ name }: { name: string }) {
    const [count, setCount] = useState(0);
    return (
      <button onClick={() => setCount((value) => value + 1)}>
        {name} {count}
      </button>
    );
  }
  let resolve!: (module: { default: typeof Content }) => void;
  const resource = preloadable<{ name: string }>(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const view = (name: string) => (
    <Suspense fallback={<span>加载中</span>}>
      <resource.Component name={name} />
    </Suspense>
  );
  await act(() => root.render(view("原内容")));
  expect(host.textContent).toBe("加载中");
  await act(async () => {
    resolve({ default: Content });
  });
  await act(() => host.querySelector("button")!.click());
  expect(host.textContent).toBe("原内容 1");
  await act(() => root.render(view("新内容")));
  expect(host.textContent).toBe("新内容 1");
});
it("allows a real load after a speculative preload fails", async () => {
  function Content() {
    return <span>已恢复</span>;
  }
  const loader = vi
    .fn<() => Promise<{ default: typeof Content }>>()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValue({ default: Content });
  const resource = preloadable(loader);
  await resource.preload();
  expect(resource.isReady()).toBe(false);
  await resource.preload();
  expect(resource.isReady()).toBe(true);
  expect(loader).toHaveBeenCalledTimes(2);
  await act(() =>
    root.render(
      <Suspense fallback="等待">
        <resource.Component />
      </Suspense>,
    ),
  );
  expect(host.textContent).toBe("已恢复");
});
