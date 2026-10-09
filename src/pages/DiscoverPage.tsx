import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCatalog } from "../hooks/useCatalog";
import { useMotionPreference } from "../hooks/useMotionPreference";
import { useStudio } from "../state/StudioContext";
import { Poster } from "../components/Poster";
import { ProjectCard } from "../components/ProjectCard";
import { TransitionLink } from "../components/TransitionLink";
import { CatalogStatus } from "../components/CatalogStatus";
import { Icon } from "../components/Icon";
gsap.registerPlugin(ScrollTrigger);
export default function DiscoverPage() {
  const { projects } = useCatalog(),
    studio = useStudio(),
    reduced = useMotionPreference();
  const [selected, setSelected] = useState(0);
  const root = useRef<HTMLElement>(null);
  const focusNewCard = useRef(false);
  const featured = projects.slice(0, 3),
    currentIndex = selected % Math.max(1, featured.length),
    current = featured[currentIndex];
  const change = (direction: number) => {
    if (!featured.length) return;
    focusNewCard.current =
      root.current
        ?.querySelector(".hero-deck")
        ?.contains(document.activeElement) ?? false;
    setSelected((i) => (i + direction + featured.length) % featured.length);
  };
  useLayoutEffect(() => {
    if (focusNewCard.current)
      root.current?.querySelector<HTMLAnchorElement>(".deck-card--0")?.focus();
    focusNewCard.current = false;
  }, [selected]);
  useLayoutEffect(() => {
    if (!root.current || reduced || !projects.length) return;
    const context = gsap.context(() => {
      // Navigation already animates a snapshot; don't capture invisible entry art.
      if (document.documentElement.dataset.navigationTransition !== "true") {
        gsap.from(
          ".hero-eyebrow, .hero-title, .hero-description, .hero-actions",
          {
            y: 28,
            opacity: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
        gsap.from(".hero-deck", {
          y: 50,
          rotation: 3,
          opacity: 0,
          duration: 1.15,
          delay: 0.12,
          ease: "power3.out",
        });
      }
      gsap.from(".selected-heading", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ".selected-heading",
          start: "top 92%",
          once: true,
        },
      });
      gsap.from(".featured-grid .project-card", {
        y: 48,
        opacity: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".featured-grid",
          start: "top 90%",
          once: true,
        },
      });
    }, root);
    return () => context.revert();
  }, [projects, reduced]);
  return (
    <main className="discover-page" ref={root}>
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">
            <span className="orange-dot" /> A SMALL SPACE FOR BIG IDEAS
          </div>
          <h1 id="hero-title" className="hero-title">
            <span>Ideas,</span>
            <span>
              in <em>motion.</em>
              <svg
                className="hero-spark"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <path d="M50 8v84M8 50h84M20 20l60 60M20 80l60-60" />
              </svg>
            </span>
          </h1>
          <p className="hero-description">
            让想法动起来。
            <br />
            探索、收藏，或者把它变成你的版本。
          </p>
          <div className="hero-actions">
            <TransitionLink className="button button-dark" to="/works">
              探索作品 <Icon name="arrow" />
            </TransitionLink>
            <TransitionLink className="text-link" to="/about">
              这里怎么玩 <span>↗</span>
            </TransitionLink>
          </div>
          <div className="hero-footnote">
            <span className="tiny-cross">✳</span>
            <span>
              独立创意空间
              <br />
              <small>OPEN TO YOUR IMAGINATION.</small>
            </span>
          </div>
        </div>
        <div className="hero-art">
          {current ? (
            <>
              <div
                className="hero-deck"
                aria-label="精选作品轮播"
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                    event.preventDefault();
                    change(event.key === "ArrowRight" ? 1 : -1);
                  }
                }}
              >
                {featured.map((project, i) => {
                  const depth =
                    (i - currentIndex + featured.length) % featured.length;
                  return (
                    <TransitionLink
                      key={project.id}
                      className={`deck-card deck-card--${depth}`}
                      to={`/works/${project.id}`}
                      state={{ origin: "hero", from: "/" }}
                      tabIndex={depth === 0 ? 0 : -1}
                      aria-hidden={depth !== 0}
                      aria-label={`打开${project.title}`}
                    >
                      <Poster
                        project={project}
                        settings={studio.drafts[project.id]}
                        transitionName={
                          depth === 0 ? `hero-${project.id}` : undefined
                        }
                      />
                    </TransitionLink>
                  );
                })}
                <span className="deck-sticker">
                  GOOD
                  <br />
                  <em>things</em>
                  <br />
                  TAKE PLAY.
                </span>
              </div>
              <div className="deck-controls">
                <div aria-live="polite">
                  <span className="deck-counter">
                    0{currentIndex + 1} / 0{featured.length}
                  </span>
                  <strong>{current.english}</strong>
                </div>
                <div>
                  <button
                    aria-label="上一个精选作品"
                    onClick={() => change(-1)}
                  >
                    ←
                  </button>
                  <button aria-label="下一个精选作品" onClick={() => change(1)}>
                    →
                  </button>
                </div>
              </div>
            </>
          ) : (
            <CatalogStatus />
          )}
        </div>
      </section>
      <div className="studio-ticker" aria-hidden="true">
        <div>
          {[0, 1].map((i) => (
            <span key={i}>
              GOOD IDEAS DESERVE TO MOVE <b>✳</b> STAY CURIOUS. KEEP PLAYING.{" "}
              <b>✳</b>{" "}
            </span>
          ))}
        </div>
      </div>
      <section className="selected-section" aria-labelledby="selected-title">
        <div className="selected-heading">
          <div>
            <span className="eyebrow">01 / SELECTED EXPERIMENTS</span>
            <h2 id="selected-title">
              有些灵感，
              <br />
              <em>值得停留。</em>
            </h2>
          </div>
          <p>
            六个小实验，无数种可能。
            <br />
            点开一张卡片，开始自己的探索。
          </p>
          <TransitionLink className="text-link" to="/works">
            全部作品 <Icon name="arrow" />
          </TransitionLink>
        </div>
        <CatalogStatus />
        <div className="project-grid featured-grid">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
      <section className="studio-invitation">
        <span className="eyebrow">MAKE IT YOURS</span>
        <h2>
          下一种可能，
          <br />
          <em>由你开始。</em>
        </h2>
        <TransitionLink className="button button-dark" to="/collection">
          建立你的灵感收藏 <Icon name="arrow" />
        </TransitionLink>
        <span className="invitation-star" aria-hidden="true">
          ✳
        </span>
      </section>
    </main>
  );
}
