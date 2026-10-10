import { ArrowRight } from "lucide-react";
import { media } from "./content";

export function CinemaHero() {
  return (
    <section className="brand-hero" id="top" aria-labelledby="launch-title">
      <div className="brand-hero-copy wrap">
        <p>讯飞影联</p>
        <h1 id="launch-title">
          影像相连。<span>专业，更近。</span>
        </h1>
        <p className="brand-hero-subtitle">让每一份影像，连接更好的医疗。</p>
        <a className="button blue-button" href="#products">
          探索产品 <ArrowRight size={18} />
        </a>
      </div>
      <div className="brand-hero-visual">
        <img
          src={media.hero}
          width="1672"
          height="941"
          alt="石墨色阅片终端呈现合成关节影像，软件展示场景示意"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
