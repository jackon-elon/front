import { useDeferredValue, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { useFlipList } from "../hooks/useFlipList";
import { useStudio } from "../state/StudioContext";
import { CatalogStatus } from "../components/CatalogStatus";
import { ProjectCard } from "../components/ProjectCard";
import { Icon } from "../components/Icon";
export default function CatalogPage() {
  const { projects, loading, error } = useCatalog(),
    studio = useStudio();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? ""),
    deferred = useDeferredValue(search);
  const category = ["排版", "交互", "色彩"].includes(
    params.get("category") ?? "",
  )
    ? params.get("category")!
    : "全部";
  const favoritesOnly = params.get("saved") === "1";
  const [sort, setSort] = useState("精选排序");
  const grid = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => {
    const term = deferred.trim().toLowerCase();
    const result = projects.filter(
      (p) =>
        (category === "全部" || category === p.category) &&
        (!favoritesOnly || studio.favorites.includes(p.id)) &&
        (!term ||
          [p.title, p.english, ...p.tags]
            .join(" ")
            .toLowerCase()
            .includes(term)),
    );
    return sort === "名称排序"
      ? result.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"))
      : result;
  }, [projects, category, favoritesOnly, studio.favorites, deferred, sort]);
  const capture = useFlipList(grid, visible.map((p) => p.id).join(","));
  function updateCategory(value: string) {
    capture();
    const next = new URLSearchParams(params);
    value === "全部" ? next.delete("category") : next.set("category", value);
    setParams(next, { replace: true, preventScrollReset: true });
  }
  function updateSearch(value: string) {
    capture();
    setSearch(value);
    const next = new URLSearchParams(params);
    value ? next.set("q", value) : next.delete("q");
    setParams(next, { replace: true, preventScrollReset: true });
  }
  return (
    <main className="catalog-page page-enter">
      <header className="page-heading">
        <div>
          <span className="eyebrow">THE PLAYGROUND / 06 DIGITAL STUDIES</span>
          <h1>
            保持好奇。
            <br />
            <em>随意探索。</em>
          </h1>
        </div>
        <p>
          不必寻找标准答案。
          <br />
          从一张让你心动的卡片开始。
        </p>
      </header>
      <div className="catalog-toolbar">
        <div className="category-tabs" aria-label="作品分类">
          {["全部", "排版", "交互", "色彩"].map((label, i) => (
            <button
              key={label}
              onClick={() => updateCategory(label)}
              aria-pressed={category === label}
            >
              {label}
              <sup>
                {i === 0
                  ? projects.length
                  : projects.filter((p) => p.category === label).length}
              </sup>
            </button>
          ))}
        </div>
        <div className="catalog-tools">
          <label className="catalog-search">
            <Icon name="search" />
            <input
              aria-label="搜索作品"
              placeholder="寻找一点灵感…"
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
            />
            {search && (
              <button aria-label="清空搜索" onClick={() => updateSearch("")}>
                ×
              </button>
            )}
          </label>
          <button
            className={`favorite-filter ${favoritesOnly ? "active" : ""}`}
            aria-pressed={favoritesOnly}
            onClick={() => {
              capture();
              const next = new URLSearchParams(params);
              favoritesOnly ? next.delete("saved") : next.set("saved", "1");
              setParams(next, { replace: true, preventScrollReset: true });
            }}
          >
            <Icon name="heart" />
            仅收藏
          </button>
        </div>
      </div>
      <div className="catalog-count">
        <span>
          {visible.length.toString().padStart(2, "0")} 件作品
          {search !== deferred ? " · 正在筛选" : ""}
        </span>
        <label>
          排序{" "}
          <select
            aria-label="作品排序"
            value={sort}
            onChange={(e) => {
              capture();
              setSort(e.target.value);
            }}
          >
            <option>精选排序</option>
            <option>名称排序</option>
          </select>
        </label>
      </div>
      <CatalogStatus />
      <div
        ref={grid}
        className="project-grid catalog-grid"
        aria-busy={loading || search !== deferred}
      >
        {visible.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            beforeChange={favoritesOnly ? capture : undefined}
          />
        ))}
      </div>
      {!loading && !error && !visible.length && (
        <div className="empty-state">
          <span>↗</span>
          <h2>换个方向，也许就有灵感。</h2>
          <p>试试其他关键词，或查看全部作品。</p>
          <button
            className="button button-dark"
            onClick={() => {
              capture();
              setSearch("");
              setParams({}, { replace: true });
            }}
          >
            查看全部作品
          </button>
        </div>
      )}
    </main>
  );
}
