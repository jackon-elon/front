import { createElement, lazy, useRef, type ComponentType } from "react";

// Share one request between proximity/intent preloading and the first render.
// A warm instance renders synchronously, avoiding a one-frame Suspense flash.
export function preloadable<Props extends object>(
  loader: () => Promise<{ default: ComponentType<Props> }>,
) {
  let ready: ComponentType<Props> | undefined;
  let pending: ReturnType<typeof loader> | undefined;
  const load = () => {
    if (!pending) {
      pending = loader().then(
        (module) => {
          ready = module.default;
          return module;
        },
        (error) => {
          pending = undefined;
          throw error;
        },
      );
    }
    return pending;
  };
  const Lazy = lazy(load);
  function Component(props: Props) {
    // Keep the selected type for this instance: resolving a cold request must
    // not remount an already-open form on its next parent update.
    const selected = useRef<ComponentType<Props>>(ready ?? Lazy);
    return createElement(selected.current, props);
  }
  return {
    Component,
    preload: () =>
      load().then(
        () => {},
        () => {},
      ),
    isReady: () => !!ready,
  };
}
