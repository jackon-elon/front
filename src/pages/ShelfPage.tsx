import { useRef } from "react";
import { useStudio } from "../state/StudioContext";
import { useCatalog } from "../hooks/useCatalog";
import { useFlipList } from "../hooks/useFlipList";
import { Poster } from "../components/Poster";
import { ProjectCard } from "../components/ProjectCard";
import { TransitionLink } from "../components/TransitionLink";
import { CatalogStatus } from "../components/CatalogStatus";
import { Icon } from "../components/Icon";
export default function ShelfPage() {
  const studio = useStudio(),
    { projects, loading, error } = useCatalog();
  const grid = useRef<HTMLDivElement>(null),
    capture = useFlipList(grid, studio.favorites.join(","));
  const favorites = studio.favorites.flatMap((id) => {
    const project = projects.find((p) => p.id === id);
    return project ? [project] : [];
  });
  return (
    <main className="shelf-page page-enter">
      <header className="page-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL MOODBOARD</span>
          <h1>
            属于你的，
            <br />
            <em>灵感片段。</em>
          </h1>
        </div>
        <p>
          把喜欢的留下，把自己的想法加进去。
          <br />
          收藏与版本保存在这台设备。
        </p>
      </header>
      <div className="shelf-heading">
        <h2>
          灵感收藏 <sup>{favorites.length}</sup>
        </h2>
        <TransitionLink className="text-link" to="/works">
          发现更多 <Icon name="arrow" />
        </TransitionLink>
      </div>
      <CatalogStatus />
      <div ref={grid} className="project-grid shelf-grid">
        {favorites.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            collection
            beforeChange={capture}
          />
        ))}
      </div>
      {!loading && !error && !favorites.length && (
        <div className="shelf-empty">
          <span>♡</span>
          <h2>先留下一点心动。</h2>
          <p>在作品卡片上点一下爱心，就能把它收进这里。</p>
          <TransitionLink className="button button-dark" to="/works">
            去发现作品 <Icon name="arrow" />
          </TransitionLink>
        </div>
      )}
      <section className="saved-section">
        <div className="shelf-heading">
          <h2>
            我的设计版本 <sup>{studio.saved.length}</sup>
          </h2>
          <span>EVERY IDEA COUNTS.</span>
        </div>
        {!studio.saved.length ? (
          <p className="saved-empty">
            点开作品，调整主色与节奏，再保存你的第一个版本。
          </p>
        ) : (
          <div className="saved-grid">
            {studio.saved.map((item) => {
              const project = projects.find((p) => p.id === item.projectId);
              return project ? (
                <article className="saved-card" key={item.id}>
                  <TransitionLink
                    className="saved-cover"
                    to={`/works/${item.projectId}`}
                    state={{
                      origin: "saved",
                      from: "/collection",
                      savedId: item.id,
                    }}
                    onClick={() => studio.restore(item.id)}
                    aria-label={`恢复${item.title}`}
                  >
                    <Poster
                      project={project}
                      settings={{ ...item.settings, paused: true }}
                      transitionName={`saved-${item.id}`}
                      interactive={false}
                    />
                  </TransitionLink>
                  <div>
                    <span className="eyebrow">
                      {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <h3>{item.title}</h3>
                    {item.note && <p>{item.note}</p>}
                    <div className="saved-actions">
                      <TransitionLink
                        to={`/works/${item.projectId}`}
                        state={{
                          origin: "saved",
                          from: "/collection",
                          savedId: item.id,
                        }}
                        onClick={() => studio.restore(item.id)}
                      >
                        恢复版本 ↗
                      </TransitionLink>
                      <button
                        aria-label={`删除版本${item.title}`}
                        onClick={() => studio.remove(item.id)}
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                </article>
              ) : null;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
