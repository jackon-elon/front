import { useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Cloud,
  Layers,
  Check,
} from "lucide-react";
import { media, products } from "./content";
import { Reveal } from "./ui";
export function Highlights({
  onDetail,
}: {
  onDetail: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrollTo = (index: number) => {
    const node = track.current?.children[index] as HTMLElement | undefined;
    if (node && track.current) {
      track.current.scrollTo({
        left:
          node.offsetLeft -
          track.current.offsetLeft -
          parseFloat(getComputedStyle(track.current).paddingLeft),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      setActive(index);
    }
  };
  return (
    <section
      className="highlights section-pad"
      id="products"
      aria-labelledby="highlights-title"
    >
      <Reveal className="section-heading wrap">
        <div>
          <p className="eyebrow">从连接，到洞察。</p>
          <h2 id="highlights-title">每一步，都更进一步。</h2>
        </div>
        <a className="text-link" href="#cloud">
          探索产品 <ArrowUpRight size={19} />
        </a>
      </Reveal>
      <div
        className="highlight-track"
        ref={track}
        onScroll={() => {
          const parent = track.current;
          if (!parent) return;
          const nodes = Array.from(parent.children) as HTMLElement[];
          if (
            parent.scrollLeft >=
            parent.scrollWidth - parent.clientWidth - 2
          ) {
            setActive(nodes.length - 1);
            return;
          }
          const padding = parseFloat(getComputedStyle(parent).paddingLeft);
          const nearest = nodes.reduce(
            (best, node, index) =>
              Math.abs(
                node.offsetLeft -
                  parent.offsetLeft -
                  parent.scrollLeft -
                  padding,
              ) <
              Math.abs(
                nodes[best].offsetLeft -
                  parent.offsetLeft -
                  parent.scrollLeft -
                  padding,
              )
                ? index
                : best,
            0,
          );
          setActive(nearest);
        }}
      >
        {products.map((product, index) => (
          <article
            key={product.id}
            className={`highlight-card highlight-${product.id}`}
          >
            <div className="highlight-copy">
              <p>{product.label}</p>
              <h3>{product.title}</h3>
            </div>
            {index === 0 ? (
              <div className="cloud-mini" aria-hidden="true">
                <div className="mini-window">
                  <div className="mini-top">
                    <i />
                    <i />
                    <i />
                    <span>影像协作空间</span>
                  </div>
                  <div className="mini-body">
                    <div className="mini-sidebar">
                      <Cloud size={24} />
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="mini-scans">
                      {[1, 2, 3, 4].map((i) => (
                        <div className="scan-tile" key={i}>
                          <img src={media.anatomy} alt="" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="cloud-mini-badge">
                  <Cloud size={18} /> 让影像，彼此连接
                </div>
              </div>
            ) : index === 1 ? (
              <img
                className="highlight-anatomy"
                src={media.anatomy}
                alt="玻璃切片构成的医学影像艺术模型"
                loading="lazy"
              />
            ) : (
              <div className="agent-mini" aria-hidden="true">
                <div className="agent-orb">
                  <Layers size={48} strokeWidth={1.3} />
                </div>
                <div className="mini-task">
                  <Check size={17} /> 资料整理
                </div>
                <div className="mini-task">
                  <Check size={17} /> 报告协作
                </div>
                <div className="mini-task">
                  <Check size={17} /> 人工复核
                </div>
              </div>
            )}
            <button
              className="card-plus"
              aria-label={`了解${product.label}`}
              onClick={() => onDetail(index)}
            >
              <Plus size={23} />
            </button>
          </article>
        ))}
      </div>
      <div className="carousel-controls wrap">
        <div className="carousel-dots" aria-label="产品亮点位置">
          {products.map((p, i) => (
            <button
              key={p.id}
              className={i === active ? "active" : ""}
              onClick={() => scrollTo(i)}
              aria-label={`查看${p.label}`}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
        <div className="carousel-arrows">
          <button
            className="round-button"
            disabled={active === 0}
            aria-label="上一张产品卡片"
            onClick={() => scrollTo(active - 1)}
          >
            <ChevronLeft />
          </button>
          <button
            className="round-button"
            disabled={active === 2}
            aria-label="下一张产品卡片"
            onClick={() => scrollTo(active + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
