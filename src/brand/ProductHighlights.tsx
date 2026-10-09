import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { media } from "./content";
import { Reveal, usePresentationMotion } from "./ui";
import { ImageFrame } from "./ImageFrame";
import { DigitalFilm } from "./DigitalFilm";
const cards = [
  {
    name: "区域影像云",
    title: "一份影像。\n连接一张医疗网络。",
    type: "cloud",
    product: 0,
  },
  {
    name: "数字影像",
    title: "你的影像。\n不必随身带着胶片。",
    type: "film",
    product: 0,
  },
  {
    name: "影像智能",
    title: "让智能，\n走进专业的每一步。",
    type: "ai",
    product: 1,
  },
  {
    name: "远程协作",
    title: "相隔千里。\n专业支持，始终在场。",
    type: "care",
    product: 0,
  },
];
export function ProductHighlights({
  onExplore,
}: {
  onExplore: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduce = usePresentationMotion();
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let tick = 0;
    const update = () => {
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(() => {
        const items = Array.from(element.children) as HTMLElement[];
        const first = items[0];
        if (!first) return;
        const max = element.scrollWidth - element.clientWidth;
        const distances = items.map((card) =>
          Math.abs(
            element.scrollLeft -
              Math.min(max, card.offsetLeft - first.offsetLeft),
          ),
        );
        setActive(distances.indexOf(Math.min(...distances)));
      });
    };
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
      cancelAnimationFrame(tick);
    };
  }, []);
  const go = (index: number) => {
    const element = track.current;
    const card = element?.children[index] as HTMLElement | undefined;
    if (element && card)
      element.scrollTo({
        left:
          card.offsetLeft -
          (element.firstElementChild as HTMLElement).offsetLeft,
        behavior: reduce ? "instant" : "smooth",
      });
  };
  return (
    <section
      className="product-highlights"
      id="products"
      aria-labelledby="highlights-title"
    >
      <Reveal className="highlight-heading wrap">
        <h2 id="highlights-title">值得看见的进步。</h2>
        <a href="#cloud">
          深入了解产品 <ArrowUpRight size={18} />
        </a>
      </Reveal>
      <div
        className="highlight-track"
        ref={track}
        tabIndex={0}
        role="region"
        aria-label="产品亮点"
        aria-roledescription="轮播"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            go(
              Math.min(
                cards.length - 1,
                Math.max(0, active + (e.key === "ArrowRight" ? 1 : -1)),
              ),
            );
          }
        }}
      >
        {cards.map((card, i) => (
          <article
            className={`highlight-card highlight-${card.type}`}
            key={card.name}
            aria-label={`${i + 1} / ${cards.length}，${card.name}`}
          >
            <div className="highlight-copy">
              <p>{card.name}</p>
              <h3>{card.title}</h3>
            </div>
            {card.type === "cloud" && (
              <img
                src={media.imagingHero}
                loading="lazy"
                alt="影像阅片工作站与移动影像的合成产品场景"
              />
            )}
            {card.type === "film" && (
              <>
                <div className="highlight-film-sheet" aria-hidden="true">
                  <FileText size={27} />
                  <span>检查报告</span>
                  <h4>
                    影像与信息。
                    <br />
                    一起随行。
                  </h4>
                  <i />
                  <i />
                  <i />
                </div>
                <div className="highlight-phone">
                  <DigitalFilm compact />
                </div>
              </>
            )}
            {card.type === "ai" && (
              <div className="highlight-ai-art" aria-hidden="true">
                <ImageFrame frame={2} />
                <div>
                  <FileText size={22} />
                  <span>从影像，到信息。</span>
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}
            {card.type === "care" && (
              <img
                src={media.care}
                loading="lazy"
                alt="远程阅片协作的合成场景"
              />
            )}
            <button
              className="highlight-more"
              aria-label={`了解${card.name}`}
              onClick={() => onExplore(card.product)}
            >
              <Plus size={22} />
            </button>
          </article>
        ))}
      </div>
      <div className="highlight-controls wrap">
        <p aria-live="polite">
          {cards[active].name}
          <span>0{active + 1} / 04</span>
        </p>
        <div>
          <button
            aria-label="上一项产品亮点"
            disabled={active === 0}
            onClick={() => go(active - 1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="下一项产品亮点"
            disabled={active === cards.length - 1}
            onClick={() => go(active + 1)}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>
    </section>
  );
}
