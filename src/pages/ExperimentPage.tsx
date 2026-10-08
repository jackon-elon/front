import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArtCanvas } from "../components/ArtCanvas";
import { ExperimentPanel } from "../components/ExperimentPanel";
import { CollectionModal } from "../components/CollectionModal";
import { Icon } from "../components/Icon";
import { findArtwork, artworks } from "../data/artworks";
import { useLab } from "../state/LabContext";

export default function ExperimentPage() {
  const { kind } = useParams();
  const art = findArtwork(kind);
  const [collection, setCollection] = useState(false);
  const { setAppearance, favorites, toggleFavorite, saved } = useLab();
  useEffect(() => {
    setAppearance("dark");
  }, [setAppearance]);
  if (!art) return <Navigate to="/works" replace />;
  return (
    <main className="experiment-page dark-page">
      <ArtCanvas mode="experiment" kind={art.kind} />
      <div className="experiment-intro">
        <Link className="back-link" to="/works">
          <Icon name="back" /> 全部作品
        </Link>
        <span className="eyebrow">
          {art.number} / {art.english}
        </span>
        <h1>{art.title}</h1>
        <p>{art.description}</p>
        <button
          className="text-button favorite-action"
          aria-pressed={favorites.includes(art.kind)}
          onClick={() => toggleFavorite(art.kind)}
        >
          <Icon name="heart" />
          {favorites.includes(art.kind) ? "已收藏作品" : "收藏这个作品"}
        </button>
      </div>
      <ExperimentPanel kind={art.kind} />
      <div className="experiment-bottom">
        <div className="kind-tabs" aria-label="切换实验">
          {artworks.map((item) => (
            <Link
              key={item.kind}
              className={art.kind === item.kind ? "active" : ""}
              to={"/experiment/" + item.kind}
            >
              {item.number} / {item.title}
            </Link>
          ))}
        </div>
        <button className="text-button" onClick={() => setCollection(true)}>
          我的实验 <span className="count-badge">{saved.length}</span>
          <Icon name="arrow" />
        </button>
      </div>
      <CollectionModal open={collection} onClose={() => setCollection(false)} />
    </main>
  );
}
