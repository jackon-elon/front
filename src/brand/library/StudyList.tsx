import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { catalog, filterCatalog, type CatalogFilter } from "./catalog";
import { StudyRow } from "./StudyRow";
import { StudyPreview } from "./StudyPreview";

const ROW_HEIGHT = 88;
const estimateSize = () => ROW_HEIGHT;
const emptyBookmarks: ReadonlySet<string> = new Set();

export const StudyList = memo(function StudyList({
  query,
  group,
  onlyBookmarks,
  order,
  bookmarks,
  onBookmark,
  onReset,
}: CatalogFilter & {
  bookmarks: ReadonlySet<string>;
  onBookmark: (id: string) => void;
  onReset: () => void;
}) {
  const filterBookmarks = onlyBookmarks ? bookmarks : emptyBookmarks;
  const items = useMemo(
    () =>
      filterCatalog(
        catalog,
        { query, group, onlyBookmarks, order },
        filterBookmarks,
      ),
    [query, group, onlyBookmarks, order, filterBookmarks],
  );
  const indexById = useMemo(
    () => new Map(items.map((item, index) => [item.id, index])),
    [items],
  );
  const [selectedId, setSelectedId] = useState(catalog[0].id);
  const selectedIndex = indexById.get(selectedId) ?? 0;
  const selected = items[selectedIndex];
  const scrollElement = useRef<HTMLDivElement>(null);
  const helpId = useId();
  const getItemKey = useCallback((index: number) => items[index].id, [items]);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement.current,
    estimateSize,
    getItemKey,
    overscan: 5,
  });
  const rows = virtualizer.getVirtualItems();

  // Search, ordering and bookmark filters change the result set. Restart at its
  // beginning so a deep scroll cannot leave an empty-looking viewport.
  useEffect(() => {
    virtualizer.scrollToOffset(0);
    setSelectedId(items[0]?.id ?? "");
  }, [items, virtualizer]);

  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    scrollElement.current?.focus({ preventScroll: true });
  }, []);
  const bookmarkCurrent = useCallback(
    (id: string) => {
      // Removing the current item from a bookmarked-only view also removes its
      // focused button. Move focus to the surviving list before that unmount.
      if (onlyBookmarks && bookmarks.has(id))
        scrollElement.current?.focus({ preventScroll: true });
      onBookmark(id);
    },
    [onlyBookmarks, bookmarks, onBookmark],
  );

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!items.length || event.altKey || event.ctrlKey || event.metaKey) return;
    const page = Math.max(
      1,
      Math.floor(
        (scrollElement.current?.clientHeight ?? ROW_HEIGHT) / ROW_HEIGHT,
      ),
    );
    const destinations: Record<string, number> = {
      ArrowDown: selectedIndex + 1,
      ArrowUp: selectedIndex - 1,
      PageDown: selectedIndex + page,
      PageUp: selectedIndex - page,
      Home: 0,
      End: items.length - 1,
    };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    const index = Math.min(
      items.length - 1,
      Math.max(0, destinations[event.key]),
    );
    setSelectedId(items[index].id);
    virtualizer.scrollToIndex(index, { align: "auto" });
  };

  return (
    <div className="library-results">
      <div className="study-list-panel">
        <div className="study-list-summary" role="status">
          <strong>{items.length.toLocaleString("zh-CN")}</strong> 条资料
          {onlyBookmarks && " · 已收藏"}
        </div>
        <p id={helpId} className="study-keyboard-help">
          ↑ ↓ 选择 · Home / End 跳转 · Page Up / Down 翻页
        </p>
        <div
          ref={scrollElement}
          className="study-scroll"
          role="listbox"
          aria-label="影像资料列表"
          aria-describedby={helpId}
          aria-activedescendant={
            selected && rows.some((row) => row.index === selectedIndex)
              ? `study-${selected.id}`
              : undefined
          }
          tabIndex={0}
          onKeyDown={handleKey}
        >
          <div
            className="study-list-space"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {rows.map((row) => (
              <div
                key={row.key}
                className="study-position"
                style={{
                  height: row.size,
                  transform: `translateY(${row.start}px)`,
                }}
              >
                <StudyRow
                  study={items[row.index]}
                  selected={row.index === selectedIndex}
                  bookmarked={bookmarks.has(items[row.index].id)}
                  position={row.index + 1}
                  total={items.length}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
        {!items.length && (
          <div className="library-empty">
            <h4>没有找到资料。</h4>
            <p>
              {onlyBookmarks
                ? "先收藏一条资料，或调整筛选条件。"
                : "试试其他编号或分组名称。"}
            </p>
            <button className="text-link" onClick={onReset}>
              显示全部资料
            </button>
          </div>
        )}
      </div>
      {selected ? (
        <StudyPreview
          key={selected.id}
          study={selected}
          bookmarked={bookmarks.has(selected.id)}
          onBookmark={bookmarkCurrent}
        />
      ) : (
        <div className="study-preview study-preview-empty">
          选择资料后，在这里预览影像。
        </div>
      )}
    </div>
  );
});
