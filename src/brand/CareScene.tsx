import { ArrowUpRight } from "lucide-react";
import { solutions } from "./content";
import { Reveal } from "./ui";

export function CareScene({ onContact }: { onContact: () => void }) {
  return (
    <section
      className="brand-solutions brand-section"
      id="solutions"
      aria-labelledby="care-title"
    >
      <Reveal className="brand-heading wrap">
        <p className="brand-kicker">解决方案</p>
        <h2 id="care-title">
          同一份专业。
          <br />
          <span>走进不同的日常。</span>
        </h2>
        <p className="brand-lead">
          从区域协同，到院内阅片。
          <br />
          把连接，落在每一个真实的工作场景。
        </p>
      </Reveal>
      <div className="solution-stories wrap">
        {solutions.map((solution, i) => (
          <Reveal key={solution.name} className="solution-story">
            <article id={`solution-${i}`}>
              <p className="solution-name">{solution.name}</p>
              <h3>{solution.headline}</h3>
              <p>{solution.text}</p>
              <button className="brand-text-link" onClick={onContact}>
                了解合作 <ArrowUpRight size={18} />
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
