import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArtCanvas } from "../components/ArtCanvas";
import { Icon } from "../components/Icon";
import { artworks } from "../data/artworks";
import { useLab } from "../state/LabContext";

export default function WorksGallery() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const onlyFavorites = params.get("filter") === "favorites";
  const { favorites, toggleFavorite, setAppearance } = useLab();
  useEffect(() => {
    setAppearance("dark");
  }, [setAppearance]);
  const filtered = useMemo(
    () =>
      artworks.filter(
        (art) =>
          (!onlyFavorites || favorites.includes(art.kind)) &&
          [art.title, art.english, ...art.tags]
            .join(" ")
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [query, onlyFavorites, favorites],
  );
  const available = useMemo(() => filtered.map((art) => art.kind), [filtered]);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  return (
    <main className="works-page dark-page">
      <ArtCanvas mode="gallery" available={available} />
      <div className="page-heading">
        <span className="eyebrow">THE COLLECTION / 01—03</span>
        <h1>
          形态的三种可能<span className="heading-dot">.</span>
        </h1>
        <p>从微小的粒子，到流动的光。找到让你停留的那一个。</p>
      </div>
      <div className="gallery-tools">
        <div className="filter-tabs" aria-label="作品筛选">
          <button
            aria-pressed={!onlyFavorites}
            onClick={() => update("filter", "")}
          >
            全部作品 <small>03</small>
          </button>
          <button
            aria-pressed={onlyFavorites}
            onClick={() => update("filter", "favorites")}
          >
            我的收藏{" "}
            <small>{favorites.length.toString().padStart(2, "0")}</small>
          </button>
        </div>
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="搜索作品"
            placeholder="寻找一种形态"
            value={query}
            onChange={(event) => update("q", event.target.value)}
          />
          {query && (
            <button aria-label="清空搜索" onClick={() => update("q", "")}>
              <Icon name="close" />
            </button>
          )}
        </label>
      </div>
      {filtered.length === 0 ? (
        <div className="gallery-empty">
          <h2>暂时没有找到。</h2>
          <p>
            {onlyFavorites
              ? "先收藏一个作品，再回来看看。"
              : "试试搜索“粒子”、“材质”或“光影”。"}
          </p>
          <button className="button button-light" onClick={() => setParams({})}>
            查看全部作品 <Icon name="arrow" />
          </button>
        </div>
      ) : (
        <div className="works-labels">
          {artworks.map((art) => (
            <div
              key={art.kind}
              className={
                "work-slot " +
                (available.includes(art.kind) ? "" : "filtered-out")
              }
            >
              {available.includes(art.kind) && (
                <>
                  <div className="work-meta">
                    <span>
                      {art.number} / {art.english}
                    </span>
                    <button
                      aria-label={
                        (favorites.includes(art.kind) ? "取消收藏" : "收藏") +
                        art.title
                      }
                      aria-pressed={favorites.includes(art.kind)}
                      className="icon-button"
                      onClick={() => toggleFavorite(art.kind)}
                    >
                      <Icon name="heart" />
                    </button>
                  </div>
                  <Link to={"/experiment/" + art.kind} className="work-link">
                    <h2>{art.title}</h2>
                    <Icon name="arrow" />
                  </Link>
                  <p>{art.tagline}</p>
                  <span className="work-tags">{art.tags.join(" / ")}</span>
                  <Link
                    to={"/experiment/" + art.kind}
                    className="scene-hit-area"
                    aria-label={"进入" + art.title + "实验"}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <footer className="page-footer">
        <span>THREE STUDIES. ENDLESS VARIATIONS.</span>
        <Link to="/">回到空间 ↗</Link>
      </footer>
    </main>
  );
}
