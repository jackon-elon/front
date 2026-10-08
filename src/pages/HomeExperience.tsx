import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArtCanvas, type ArtCanvasHandle } from "../components/ArtCanvas";
import { ExperimentPanel } from "../components/ExperimentPanel";
import { Icon } from "../components/Icon";
import { artworks, type ArtworkKind } from "../data/artworks";
import { useLab } from "../state/LabContext";
import { useMotionPreference } from "../hooks/useMotionPreference";

gsap.registerPlugin(ScrollTrigger);
const stages = ["进入", "解构", "探索", "改变"];

export default function HomeExperience() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<ArtCanvasHandle>(null);
  const [stage, setStage] = useState(0);
  const [kind, setKind] = useState<ArtworkKind>("particles");
  const { setAppearance } = useLab();
  const reduced = useMotionPreference();
  useEffect(() => {
    if (!root.current) return;
    let lastStage = -1;
    let dark = false;
    setAppearance("light");
    const drive = { progress: 0 };
    const update = () => {
      canvas.current?.setProgress(drive.progress);
      const nextStage = Math.min(3, Math.round(drive.progress));
      if (lastStage !== nextStage) {
        lastStage = nextStage;
        setStage(nextStage);
      }
      const nextDark = drive.progress >= 1.55;
      if (nextDark !== dark) {
        dark = nextDark;
        setAppearance(dark ? "dark" : "light");
      }
    };
    const tween = gsap.to(drive, {
      progress: 3,
      ease: "none",
      onUpdate: update,
      scrollTrigger: {
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: reduced ? true : 0.65,
      },
    });
    update();
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [setAppearance, reduced]);
  const go = (index: number) => {
    document
      .getElementById("stage-" + index)
      ?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
  };
  return (
    <main className="home-experience" ref={root}>
      <ArtCanvas ref={canvas} mode="story" kind={kind} />
      <div className="story-rail" aria-label="体验章节">
        {stages.map((title, i) => (
          <button
            key={title}
            onClick={() => go(i)}
            aria-label={"跳到" + title}
            aria-current={stage === i ? "step" : undefined}
          >
            <span className="rail-dot" />
            <span className="rail-label">
              0{i + 1} / {title}
            </span>
          </button>
        ))}
      </div>
      <section
        className="story-section hero-section"
        id="stage-0"
        aria-labelledby="hero-title"
      >
        <div className="eyebrow hero-eyebrow">
          <span className="live-dot" /> AN INDEPENDENT INTERACTIVE SPACE
        </div>
        <h1 id="hero-title" className="hero-title">
          FORM
          <br />
          <span>& FLOW</span>
          <sup>®</sup>
        </h1>
        <div className="hero-caption">
          <p>
            在形态与流动之间，
            <br />
            发现另一种可能。
          </p>
          <button className="button button-dark" onClick={() => go(1)}>
            进入空间
            <Icon name="arrow" />
          </button>
        </div>
        <span className="hero-coordinate">
          EST. 2026
          <br />
          DIGITAL / EXPERIMENTAL
        </span>
        <div className="story-bottom">
          <span>01 — SHAPE THE UNEXPECTED</span>
          <button onClick={() => go(1)}>
            向下滚动，改变视角 <Icon name="down" />
          </button>
          <span>REAL-TIME / 3D</span>
        </div>
      </section>
      <section
        className="story-section deconstruct-section"
        id="stage-1"
        aria-labelledby="deconstruct-title"
      >
        <div className="section-copy">
          <span className="eyebrow">02 / BEYOND THE SURFACE</span>
          <h2 id="deconstruct-title">
            每一种形态，
            <br />
            都有另一面。
          </h2>
          <p>
            靠近一点。
            <br />
            让层次展开，让边界松动。
            <br />
            熟悉的形状，会在运动中重新出现。
          </p>
          <button className="text-button" onClick={() => go(2)}>
            继续探索 <Icon name="arrow" />
          </button>
        </div>
        <div className="deconstruct-label">
          <span>BLUE / CHROME / GLASS</span>
          <span>Three materials. One continuous flow.</span>
        </div>
      </section>
      <section
        className="story-section gallery-section"
        id="stage-2"
        aria-labelledby="gallery-title"
      >
        <div className="gallery-heading">
          <span className="eyebrow">
            03 / A SMALL COLLECTION OF POSSIBILITIES
          </span>
          <h2 id="gallery-title">不止一种流动。</h2>
          <p>选择一个作品，把好奇变成一次实验。</p>
        </div>
        <div className="exhibit-labels">
          {artworks.map((art) => (
            <button
              className="exhibit-label"
              key={art.kind}
              onClick={() => {
                setKind(art.kind);
                go(3);
              }}
            >
              <span className="exhibit-number">{art.number} / EXPERIMENT</span>
              <strong>
                {art.title}
                <Icon name="arrow" />
              </strong>
              <span>{art.english}</span>
            </button>
          ))}
        </div>
        <div className="gallery-footer">
          <span>MOVE YOUR CURSOR. FIND YOUR PERSPECTIVE.</span>
          <Link className="text-button" to="/works">
            查看全部作品 <Icon name="arrow" />
          </Link>
        </div>
      </section>
      <section
        className="story-section change-section"
        id="stage-3"
        aria-labelledby="change-title"
      >
        <div className="change-copy">
          <span className="eyebrow">04 / YOUR TURN</span>
          <h2 id="change-title">
            现在，
            <br />
            轮到你了。
          </h2>
          <p>
            一点颜色。一种节奏。
            <br />
            让这片空间留下你的痕迹。
          </p>
          <div className="kind-tabs" aria-label="选择实验作品">
            {artworks.map((art) => (
              <button
                key={art.kind}
                aria-pressed={kind === art.kind}
                onClick={() => setKind(art.kind)}
              >
                {art.title}
              </button>
            ))}
          </div>
          <Link to={"/experiment/" + kind} className="text-button">
            打开完整实验 <Icon name="expand" />
          </Link>
        </div>
        <ExperimentPanel kind={kind} compact />
        <div className="story-bottom">
          <span>FORM & FLOW / 交互实验室</span>
          <button onClick={() => go(0)}>
            回到起点 <Icon name="reset" />
          </button>
          <Link to="/about">保持好奇 ↗</Link>
        </div>
      </section>
    </main>
  );
}
