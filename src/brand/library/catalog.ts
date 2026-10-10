export const groups = ["演示资料 A", "演示资料 B", "演示资料 C"];
export type Study = {
  id: string;
  title: string;
  group: string;
  frame: number;
  updatedAt: number;
  dateLabel: string;
  searchText: string;
};
export type CatalogFilter = {
  query: string;
  group: string;
  onlyBookmarks: boolean;
  order: "id" | "recent";
};

// Generated only when this lazy feature is loaded. These are metadata entries,
// not 6,000 distinct medical images; all previews use the same six-frame atlas.
const formatter = new Intl.DateTimeFormat("zh-CN", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Shanghai",
});
export const catalog: readonly Study[] = Array.from(
  { length: 6000 },
  (_, index) => {
    const id = `DEMO-${String(index + 1).padStart(5, "0")}`;
    const title = `关节影像 · 序列 ${String((index % 12) + 1).padStart(2, "0")}`;
    const group = groups[index % groups.length];
    const updatedAt = Date.UTC(2026, 9, 1) + index * 60_000;
    return {
      id,
      title,
      group,
      frame: index % 6,
      updatedAt,
      dateLabel: formatter.format(updatedAt),
      searchText: `${id} ${title} ${group}`.toLocaleLowerCase(),
    };
  },
);

export function filterCatalog(
  items: readonly Study[],
  filter: CatalogFilter,
  bookmarks: ReadonlySet<string>,
) {
  const terms = filter.query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const result = items.filter(
    (item) =>
      (!filter.group || item.group === filter.group) &&
      (!filter.onlyBookmarks || bookmarks.has(item.id)) &&
      terms.every((term) => item.searchText.includes(term)),
  );
  return filter.order === "recent"
    ? result.sort((a, b) => b.updatedAt - a.updatedAt)
    : result;
}
