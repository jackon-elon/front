import { useCallback, useDeferredValue, useRef, useState } from "react";
import { Search, X, Bookmark } from "lucide-react";
import { groups, type CatalogFilter } from "./catalog";
import { StudyList } from "./StudyList";
import "./library.css";

export default function ImagingLibrary() {
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [group, setGroup] = useState("");
  const [order, setOrder] = useState<CatalogFilter["order"]>("id");
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    setQuery("");
    setGroup("");
    setOnlyBookmarks(false);
    setOrder("id");
    searchInput.current?.focus();
  }, []);

  return (
    <div className="imaging-library">
      <div className="library-toolbar">
        <div className="library-search">
          <Search size={20} aria-hidden="true" />
          <input
            ref={searchInput}
            aria-label="搜索资料编号或分组"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索编号、序列或分组"
            type="search"
          />
          {query && (
            <button aria-label="清空资料搜索" onClick={() => setQuery("")}>
              <X size={17} />
            </button>
          )}
        </div>
        <label>
          <span className="sr-only">资料分组</span>
          <select
            aria-label="资料分组"
            value={group}
            onChange={(event) => setGroup(event.target.value)}
          >
            <option value="">全部分组</option>
            {groups.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">资料排序</span>
          <select
            aria-label="资料排序"
            value={order}
            onChange={(event) =>
              setOrder(event.target.value as CatalogFilter["order"])
            }
          >
            <option value="id">编号顺序</option>
            <option value="recent">时间倒序</option>
          </select>
        </label>
        <button
          className="library-bookmarks"
          aria-pressed={onlyBookmarks}
          onClick={() => setOnlyBookmarks((value) => !value)}
        >
          <Bookmark size={17} fill={onlyBookmarks ? "currentColor" : "none"} />
          已收藏 <span>{bookmarks.size}</span>
        </button>
      </div>
      <div
        aria-busy={query !== deferredQuery}
        className={query !== deferredQuery ? "library-updating" : undefined}
      >
        <StudyList
          query={deferredQuery}
          group={group}
          onlyBookmarks={onlyBookmarks}
          order={order}
          bookmarks={bookmarks}
          onBookmark={toggleBookmark}
          onReset={reset}
        />
      </div>
      <p className="library-disclosure">
        演示数据：6,000
        条生成的资料索引，共用六帧合成影像。收藏仅保留在本次打开期间。
      </p>
    </div>
  );
}
