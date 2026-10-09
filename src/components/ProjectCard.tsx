import type { Project } from "../data/projects";
import { useStudio } from "../state/StudioContext";
import { useLocation } from "react-router-dom";
import { Poster } from "./Poster";
import { Icon } from "./Icon";
import { TransitionLink } from "./TransitionLink";
export function ProjectCard({
  project,
  collection = false,
  beforeChange,
}: {
  project: Project;
  collection?: boolean;
  beforeChange?: () => void;
}) {
  const studio = useStudio(),
    { pathname, search } = useLocation();
  const from = pathname + search;
  const index = studio.favorites.indexOf(project.id),
    favorite = index >= 0;
  return (
    <article
      className="project-card"
      data-flip-id={project.id}
      draggable={collection}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", project.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragOver={(event) => {
        if (collection) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(event) => {
        if (!collection) return;
        event.preventDefault();
        const from = event.dataTransfer.getData("text/plain");
        if (studio.favorites.includes(from as Project["id"])) {
          beforeChange?.();
          studio.reorder(from as Project["id"], project.id);
        }
      }}
    >
      <TransitionLink
        className="project-cover-link"
        to={`/works/${project.id}`}
        state={{ origin: "card", from }}
        aria-label={`打开${project.title}`}
      >
        <Poster
          project={project}
          settings={studio.drafts[project.id]}
          transitionName={`card-${project.id}`}
        />
        <span className="project-open">
          打开作品 <Icon name="arrow" />
        </span>
      </TransitionLink>
      <button
        className={`favorite-button ${favorite ? "is-favorite" : ""}`}
        aria-label={`${favorite ? "取消收藏" : "收藏"}${project.title}`}
        aria-pressed={favorite}
        onClick={() => {
          beforeChange?.();
          studio.toggleFavorite(project.id);
        }}
      >
        <Icon name="heart" />
      </button>
      <div className="project-info">
        <div>
          <h3>
            <TransitionLink
              to={`/works/${project.id}`}
              state={{ origin: "card", from }}
            >
              {project.title}
            </TransitionLink>
          </h3>
          <span>
            {project.category} · {project.year}
          </span>
        </div>
        <span className="project-number">
          0
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
      {collection && (
        <div className="reorder-actions">
          <span>拖动调整顺序</span>
          <button
            disabled={index <= 0}
            aria-label={`前移${project.title}`}
            onClick={() => {
              beforeChange?.();
              studio.reorder(project.id, studio.favorites[index - 1]);
            }}
          >
            ←
          </button>
          <button
            disabled={index === studio.favorites.length - 1}
            aria-label={`后移${project.title}`}
            onClick={() => {
              beforeChange?.();
              studio.reorder(project.id, studio.favorites[index + 1]);
            }}
          >
            →
          </button>
        </div>
      )}
    </article>
  );
}
