import { useId, useRef, type CSSProperties } from "react";
import type { Project } from "../data/projects";
import { initialDesign, type DesignSettings } from "../state/studioModel";
import { useMotionPreference } from "../hooks/useMotionPreference";

const star = Array.from({ length: 32 }, (_, i) => {
  const angle = (i * Math.PI) / 16 - Math.PI / 2,
    radius = i % 2 ? 118 : 174;
  return `${200 + Math.cos(angle) * radius},${200 + Math.sin(angle) * radius}`;
}).join(" ");
export function Poster({
  project,
  settings = initialDesign,
  transitionName,
  interactive = true,
}: {
  project: Project;
  settings?: DesignSettings;
  transitionName?: string;
  interactive?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null),
    gradient = useId().replace(/:/g, "");
  const reduced = useMotionPreference();
  const style = {
    "--accent": settings.accent ?? project.color,
    "--energy": settings.intensity,
    "--duration": `${12 / settings.intensity}s`,
    viewTransitionName: transitionName ?? "none",
  } as CSSProperties;
  return (
    <div
      ref={host}
      className={`poster poster--${project.id} ${settings.paused || reduced ? "is-still" : ""}`}
      style={style}
      aria-label={project.title + "封面"}
      onPointerMove={(event) => {
        if (!interactive || reduced) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5,
          y = (event.clientY - rect.top) / rect.height - 0.5;
        host.current?.style.setProperty("--pointer-x", `${x * 12}px`);
        host.current?.style.setProperty("--pointer-y", `${y * 12}px`);
      }}
      onPointerLeave={() => {
        host.current?.style.setProperty("--pointer-x", "0px");
        host.current?.style.setProperty("--pointer-y", "0px");
      }}
    >
      <div className="poster-topline">
        <span>FORM & FLOW®</span>
        <span>
          {project.year} / VOL. 0
          {[
            "off-grid",
            "type-wave",
            "soft-signal",
            "play-again",
            "color-field",
            "form-study",
          ].indexOf(project.id) + 1}
        </span>
      </div>
      {project.id === "off-grid" && (
        <>
          <h3 className="poster-heading">
            OFF
            <br />
            GRID<span>↗</span>
          </h3>
          <div className="poster-ribbons" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} style={{ "--i": i } as CSSProperties} />
            ))}
          </div>
          <div className="poster-caption">
            THINK OUTSIDE.
            <br />
            THEN GO FURTHER.
          </div>
        </>
      )}
      {project.id === "type-wave" && (
        <>
          <div className="poster-types" aria-hidden="true">
            {["MOVE", "MOVE", "MOVE", "MOVE", "MOVE"].map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </div>
          <div className="poster-caption">TYPE IS A FEELING.</div>
        </>
      )}
      {project.id === "soft-signal" && (
        <>
          <h3 className="poster-heading poster-heading--small">
            Soft
            <br />
            <em>signal.</em>
          </h3>
          <svg
            className="poster-signal"
            viewBox="0 0 400 400"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id={gradient}>
                <stop offset="0" stopColor="#ffe3bb" />
                <stop offset=".5" stopColor="#f7763e" />
                <stop offset="1" stopColor="#e84422" />
              </radialGradient>
            </defs>
            {[172, 148, 124, 100].map((r) => (
              <circle
                key={r}
                cx="200"
                cy="200"
                r={r}
                fill="none"
                stroke="#f1e8ff"
                strokeWidth="1.5"
              />
            ))}
            <circle cx="200" cy="200" r="76" fill={`url(#${gradient})`} />
          </svg>
          <div className="poster-caption">
            A LITTLE LESS NOISE.
            <br />A LITTLE MORE FEELING.
          </div>
        </>
      )}
      {project.id === "play-again" && (
        <>
          <h3 className="poster-heading poster-heading--small">
            PLAY
            <br />
            AGAIN.
          </h3>
          <svg className="poster-star" viewBox="0 0 400 400" aria-hidden="true">
            <polygon points={star} fill="#24231f" />
            <circle cx="200" cy="200" r="48" fill="var(--accent)" />
            <path
              d="M173 202h54m-19-19 19 19-19 19"
              fill="none"
              stroke="#24231f"
              strokeWidth="7"
            />
          </svg>
          <div className="poster-caption">NEVER LOSE YOUR PLAY.</div>
        </>
      )}
      {project.id === "color-field" && (
        <>
          <h3 className="poster-heading poster-heading--small">
            Color
            <br />
            <em>has gravity.</em>
          </h3>
          <svg
            className="poster-orbits"
            viewBox="0 0 400 400"
            aria-hidden="true"
          >
            {[152, 118, 84, 50].map((r, i) => (
              <circle
                key={r}
                cx="200"
                cy="200"
                r={r}
                stroke={i % 2 ? "#f9e2c2" : "#e46638"}
                strokeWidth="26"
                fill="none"
              />
            ))}
            <circle cx="200" cy="200" r="17" fill="#272c21" />
          </svg>
          <div className="poster-caption">FOLLOW THE ATTRACTION.</div>
        </>
      )}
      {project.id === "form-study" && (
        <>
          <h3 className="poster-heading">
            FORM
            <br />
            STUDY
          </h3>
          <svg className="poster-form" viewBox="0 0 400 400" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => (
              <path
                key={i}
                d={`M ${32 + i * 7} ${350 - i * 14} Q ${125 + i * 6} ${70 + i * 4}, ${340 - i * 2} ${60 + i * 22}`}
                fill="none"
                stroke="#263e5c"
                strokeWidth="1.6"
              />
            ))}
          </svg>
          <div className="poster-caption">LESS, BUT MORE.</div>
        </>
      )}
      <div className="poster-bottomline">
        <span>{project.category} / DIGITAL STUDY</span>
        <span>↗</span>
      </div>
    </div>
  );
}
