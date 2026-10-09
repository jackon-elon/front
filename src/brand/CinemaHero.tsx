import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { usePresentationMotion } from "./ui";
import { media } from "./content";

export function CinemaHero() {
  const target = useRef<HTMLElement>(null);
  const reduce = usePresentationMotion();
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  return (
    <section
      className="cinema-hero"
      ref={target}
      id="top"
      aria-labelledby="cinema-title"
    >
      <div className="cinema-heading">
        <p>讯飞影联</p>
        <h1 id="cinema-title">
          影像，
          <br className="cinema-mobile-break" />
          <span>不止于所见。</span>
        </h1>
        <p className="cinema-subtitle">连接云端。洞察细节。协同每一步。</p>
        <a href="#cloud" className="cinema-start">
          开启探索 <ArrowDown size={17} />
        </a>
      </div>
      <motion.div
        className="cinema-hero-image"
        style={reduce ? {} : { scale, y }}
      >
        <img
          src={media.imagingHero}
          width="1672"
          height="941"
          fetchPriority="high"
          alt="明亮空间中，三块银灰影像板呈现关节 MRI 的多视图设计示意"
        />
      </motion.div>
      <div className="cinema-hero-foot">
        <span>让影像，连接更好的医疗。</span>
        <a href="#solutions">
          看见真实的协作场景 <ArrowUpRight size={16} />
        </a>
      </div>
    </section>
  );
}
