import { useId, useState, type FormEvent } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { useStudio } from "../state/StudioContext";
import { initialDesign } from "../state/studioModel";
import { Poster } from "../components/Poster";
import { CatalogStatus } from "../components/CatalogStatus";
import { TransitionLink } from "../components/TransitionLink";
import { Modal } from "../components/Modal";
import { Icon } from "../components/Icon";
export default function DesignPage() {
  const { id } = useParams(),
    location = useLocation(),
    { projects, loading, error } = useCatalog(),
    studio = useStudio();
  const project = projects.find((p) => p.id === id);
  const [saveOpen, setSaveOpen] = useState(false),
    [title, setTitle] = useState(""),
    [note, setNote] = useState("");
  const formId = useId();
  if (loading || error)
    return (
      <main className="design-page">
        <CatalogStatus />
      </main>
    );
  if (!project)
    return (
      <main className="empty-state">
        <h1>这张卡片还没有被创造。</h1>
        <TransitionLink className="button button-dark" to="/works">
          返回作品
        </TransitionLink>
      </main>
    );
  const settings = studio.drafts[project.id] ?? initialDesign;
  const source =
    location.state && typeof location.state === "object" ? location.state : {};
  const back =
    typeof source.from === "string" &&
    ["/", "/works", "/collection"].includes(source.from.split("?")[0])
      ? source.from
      : "/works";
  const name =
    source.origin === "hero"
      ? `hero-${project.id}`
      : source.origin === "card"
        ? `card-${project.id}`
        : source.origin === "saved" && typeof source.savedId === "string"
          ? `saved-${source.savedId}`
          : `detail-${project.id}`;
  const favorite = studio.favorites.includes(project.id);
  const next =
    projects[
      (projects.findIndex((p) => p.id === project.id) + 1) % projects.length
    ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    studio.save(project.id, title, note);
    setSaveOpen(false);
  };
  return (
    <main className="design-page page-enter">
      <div className="design-back">
        <TransitionLink
          className="text-link"
          to={back}
          state={{
            restoreScroll:
              typeof source.scroll === "number" ? source.scroll : 0,
          }}
        >
          <Icon name="back" />
          返回{back === "/collection" ? "收藏" : back === "/" ? "发现" : "作品"}
        </TransitionLink>
        <span>
          {project.english} / {project.year}
        </span>
      </div>
      <div className="design-layout">
        <section className="design-preview" aria-label="作品实时预览">
          <Poster project={project} settings={settings} transitionName={name} />
          <span className="preview-caption">
            移动鼠标，感受细微变化。你的修改会实时显示。
          </span>
        </section>
        <aside className="design-controls" aria-label="作品编辑区">
          <span className="eyebrow">
            {project.category} / DIGITAL EXPERIMENT
          </span>
          <h1>{project.title}</h1>
          <p className="design-description">{project.description}</p>
          <div className="design-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="design-control-heading">
            <h2>让它成为你的版本。</h2>
            <button
              className="icon-button"
              aria-label={settings.paused ? "继续动态效果" : "暂停动态效果"}
              aria-pressed={settings.paused}
              onClick={() =>
                studio.edit(project.id, { paused: !settings.paused })
              }
            >
              <Icon name={settings.paused ? "play" : "pause"} />
            </button>
          </div>
          <div className="design-color">
            <span>主色</span>
            <div>
              {[project.color, "#c5b5ef", "#b8cbb2", "#eee178"]
                .filter((c, i, a) => a.indexOf(c) === i)
                .map((c) => (
                  <button
                    key={c}
                    style={{ background: c }}
                    className={
                      (settings.accent ?? project.color) === c ? "selected" : ""
                    }
                    aria-label={`主色 ${c}`}
                    aria-pressed={(settings.accent ?? project.color) === c}
                    onClick={() => studio.edit(project.id, { accent: c })}
                  />
                ))}
              <label className="custom-color">
                <input
                  type="color"
                  aria-label="自定义主色"
                  value={settings.accent ?? project.color}
                  onChange={(e) =>
                    studio.edit(project.id, { accent: e.target.value })
                  }
                />
                <span>＋</span>
              </label>
            </div>
          </div>
          <label className="design-range" htmlFor={formId + "-intensity"}>
            <span>动态节奏</span>
            <output>{settings.intensity.toFixed(1)}×</output>
            <input
              id={formId + "-intensity"}
              type="range"
              min="30"
              max="150"
              step="10"
              value={Math.round(settings.intensity * 100)}
              onChange={(e) =>
                studio.edit(project.id, {
                  intensity: Number(e.target.value) / 100,
                })
              }
            />
          </label>
          <div className="design-actions">
            <button
              className="button button-dark"
              onClick={() => {
                setTitle(project.title + " · 我的版本");
                setNote("");
                setSaveOpen(true);
              }}
            >
              保存我的版本 <Icon name="arrow" />
            </button>
            <button
              className="icon-button reset-design"
              aria-label="恢复原始设计"
              onClick={() => studio.reset(project.id)}
            >
              <Icon name="reset" />
            </button>
          </div>
          <button
            className={`design-favorite ${favorite ? "is-favorite" : ""}`}
            aria-pressed={favorite}
            onClick={() => studio.toggleFavorite(project.id)}
          >
            <Icon name="heart" />
            {favorite ? "已加入灵感收藏" : "加入灵感收藏"}
          </button>
          <p className="local-note">
            {studio.persistent
              ? "你的修改自动保存在这台设备。"
              : "当前浏览器无法持久保存，关闭页面会丢失修改。"}
          </p>
        </aside>
      </div>
      <div className="design-next">
        <span>KEEP EXPLORING</span>
        <TransitionLink to={`/works/${next.id}`}>
          <span>下一个实验</span>
          <strong>{next.title}</strong>
          <Icon name="arrow" />
        </TransitionLink>
      </div>
      <Modal
        open={saveOpen}
        title="留下这个版本。"
        onClose={() => setSaveOpen(false)}
        className="save-modal"
      >
        <form className="save-form" onSubmit={submit}>
          <label htmlFor={formId + "-title"}>版本名称</label>
          <input
            id={formId + "-title"}
            data-autofocus
            value={title}
            maxLength={40}
            required
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor={formId + "-note"}>
            记下一点灵感 <span>选填</span>
          </label>
          <textarea
            id={formId + "-note"}
            value={note}
            maxLength={200}
            placeholder="这组颜色让我想到了…"
            onChange={(e) => setNote(e.target.value)}
          />
          <p>保存主色、动态节奏与备注，之后可在“我的收藏”恢复。</p>
          <button
            className="button button-dark"
            type="submit"
            disabled={!title.trim()}
          >
            保存版本 <Icon name="arrow" />
          </button>
        </form>
      </Modal>
    </main>
  );
}
