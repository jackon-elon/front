import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { media, solutions } from "./content";
import { Reveal, Tabs, usePresentationMotion } from "./ui";

export function CareScene({
  mode,
  onChange,
  onContact,
}: {
  mode: number;
  onChange: (mode: number) => void;
  onContact: () => void;
}) {
  const current = solutions[mode];
  const reduce = usePresentationMotion();
  return (
    <section className="care-scene" id="solutions" aria-labelledby="care-title">
      <Reveal className="care-heading wrap">
        <p className="eyebrow">连接技术，更连接人与人。</p>
        <h2 id="care-title">
          技术的终点。
          <br />
          <span>始终是人。</span>
        </h2>
        <p>影像的价值，在每一次真实的医疗协作中延伸。</p>
      </Reveal>
      <div className="care-layout wrap">
        <div className="care-content">
          <AnimatePresence mode="wait">
            <motion.div
              className="care-story"
              key={mode}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            >
              <p>{current.name}</p>
              <h3>{current.headline}</h3>
              <p>{current.text}</p>
              <button onClick={onContact}>
                一起探索合作
                <ArrowUpRight size={19} />
              </button>
            </motion.div>
          </AnimatePresence>
          <div className="care-selector">
            <Tabs
              labels={solutions.map((s) => s.name)}
              value={mode}
              onChange={onChange}
              label="医疗解决方案"
              panelId="care-description"
            />
            <span>协作场景 · 视觉示意</span>
          </div>
        </div>
        <div className="care-photograph">
          <img
            src={media.care}
            width="1672"
            height="941"
            alt="医生在明亮的阅片空间协作，场景为视觉设计示意"
            loading="lazy"
          />
        </div>
      </div>
      <div
        id="care-description"
        className="sr-only"
        role="tabpanel"
        aria-label={current.name}
      >
        {current.text}
      </div>
    </section>
  );
}
