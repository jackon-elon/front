import { ArrowUpRight, ChevronDown } from "lucide-react";
import { media } from "./content";
export function CinemaHero() {
  return (
    <section className="launch-hero" id="top" aria-labelledby="launch-title">
      <div className="launch-art">
        <img
          src={media.imagingHero}
          width="1672"
          height="941"
          fetchPriority="high"
          alt="白色摄影背景上的银色阅片终端，展示影像与报告界面"
        />
      </div>
      <div className="launch-copy wrap">
        <div>
          <p className="launch-brand">讯飞影联</p>
          <h1 id="launch-title">
            影像相连。
            <br />
            <span>专业，更近。</span>
          </h1>
          <p className="launch-subtitle">区域影像云 · 数字影像 · 智能协作</p>
        </div>
        <div className="launch-actions">
          <a href="#products">
            探索产品 <ArrowUpRight size={20} />
          </a>
          <p>让影像资源，走进每一次协作。</p>
        </div>
      </div>
      <a href="#products" className="launch-down" aria-label="浏览产品亮点">
        <ChevronDown size={22} />
      </a>
    </section>
  );
}
