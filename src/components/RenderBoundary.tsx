import { Component, Fragment, type ReactNode } from "react";
import { RotateCcw, RefreshCw } from "lucide-react";

/** Isolates rendering and lazy-import failures; retry remounts this subtree. */
export class RenderBoundary extends Component<
  { children: ReactNode; title?: string },
  { failed: boolean; attempt: number }
> {
  state = { failed: false, attempt: 0 };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <section className="render-fallback" role="alert">
          <p className="eyebrow">暂时无法显示</p>
          <h3>{this.props.title ?? "这个体验暂时未能打开。"}</h3>
          <p>可以重试显示，或重新加载页面后再打开。</p>
          <div>
            <button
              className="button blue-button"
              onClick={() =>
                this.setState((state) => ({
                  failed: false,
                  attempt: state.attempt + 1,
                }))
              }
            >
              <RotateCcw size={17} /> 重试显示
            </button>
            <button
              className="text-link"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={17} /> 重新加载页面
            </button>
          </div>
        </section>
      );
    }
    return <Fragment key={this.state.attempt}>{this.props.children}</Fragment>;
  }
}
