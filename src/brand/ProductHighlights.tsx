import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, ArrowUpRight } from "lucide-react";
import { Reveal, usePresentationMotion } from "./ui";
import { media } from "./content";
import { motion } from "motion/react";
import { canPreloadNearby } from "./productResources";
export const highlightCards = [
  {
    name: "区域影像云",
    title: "一份影像。\n联结更多专业。",
    type: "cloud",
    image: media.cloud,
    alt: "夜色中的医疗建筑，生成的区域协作场景示意",
    product: 0,
  },
  {
    name: "数字影像",
    title: "影像在手。\n从容前行。",
    type: "film",
    image: media.film,
    alt: "手机屏幕呈现合成关节影像，数字影像场景示意",
    product: 0,
  },
  {
    name: "影像智能",
    title: "多一份洞察。\n看见更多细节。",
    type: "ai",
    image: media.intelligence,
    alt: "影像显示屏的玻璃与局部图像细节，生成的视觉示意",
    product: 1,
  },
] as const;
export type HighlightCard = (typeof highlightCards)[number];
const cards = highlightCards;
export function ProductHighlights({
  onExplore,
  onPreload,
}: {
  onExplore: (index: number, origin?: HighlightCard) => void;
  onPreload: (index: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [overflow, setOverflow] = useState(false);
  const reduce = usePresentationMotion();
  useEffect(() => {
    if (!track.current || !canPreloadNearby()) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          new Set(cards.map((card) => card.product)).forEach(onPreload);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(track.current);
    return () => observer.disconnect();
  }, [onPreload]);
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
        setOverflow(max > 2);
        if (max <= 2) {
          setActive(0);
          return;
        }
        if (element.scrollLeft >= max - 2) {
          setActive(cards.length - 1);
          return;
        }
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
      className="feature-gallery"
      id="products"
      aria-labelledby="highlights-title"
    >
      <Reveal className="feature-gallery-heading wrap">
        <h2 id="highlights-title">值得看见的进步。</h2>
        <a href="#cloud">
          深入了解产品 <ArrowUpRight size={18} />
        </a>
      </Reveal>
      <motion.div
        layoutScroll
        className="feature-gallery-track wrap"
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
          <motion.article
            layoutId={reduce ? undefined : `product-${card.type}`}
            style={{ borderRadius: 24 }}
            className={`feature-card feature-${card.type}`}
            key={card.name}
            aria-label={`${i + 1} / ${cards.length}，${card.name}`}
          >
            <div className="feature-copy">
              <p>{card.name}</p>
              <motion.h3 layoutId={reduce ? undefined : `title-${card.type}`}>
                {card.title}
              </motion.h3>
            </div>
            <motion.img
              layoutId={reduce ? undefined : `image-${card.type}`}
              src={card.image}
              width="1122"
              height="1402"
              alt={card.alt}
              loading="lazy"
            />
            <button
              className="feature-more"
              aria-label={`了解${card.name}`}
              onPointerEnter={() => onPreload(card.product)}
              onFocus={() => onPreload(card.product)}
              onPointerDown={() => onPreload(card.product)}
              onClick={() => onExplore(card.product, card)}
            >
              <Plus size={22} />
            </button>
          </motion.article>
        ))}
      </motion.div>
      {overflow && (
        <div className="feature-controls wrap">
          <p aria-live="polite">
            {cards[active].name}
            <span>
              {active + 1} / {cards.length}
            </span>
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
      )}
    </section>
  );
}
