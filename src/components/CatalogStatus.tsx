import { useCatalog } from "../hooks/useCatalog";
export function CatalogStatus() {
  const { loading, error, retry } = useCatalog();
  if (loading)
    return (
      <div className="catalog-skeleton" role="status" aria-label="正在加载作品">
        {[1, 2, 3].map((i) => (
          <div key={i} />
        ))}
      </div>
    );
  if (error)
    return (
      <div className="catalog-error" role="alert">
        <h2>暂时没能打开作品。</h2>
        <p>{error}</p>
        <button className="button button-dark" onClick={retry}>
          重新加载 ↗
        </button>
      </div>
    );
  return null;
}
