import { describe, expect, it } from "vitest";
import { catalog, filterCatalog, type CatalogFilter } from "./catalog";

const filter: CatalogFilter = {
  query: "",
  group: "",
  onlyBookmarks: false,
  order: "id",
};
const bookmarks = new Set(["DEMO-00002", "DEMO-06000"]);
describe("catalog filtering", () => {
  it("has stable unique IDs through the final entry", () => {
    expect(new Set(catalog.map((study) => study.id)).size).toBe(6000);
    expect(catalog.at(-1)?.id).toBe("DEMO-06000");
  });
  it("matches an exact ID without depending on mounted rows", () => {
    expect(
      filterCatalog(catalog, { ...filter, query: "demo-06000" }, bookmarks).map(
        (study) => study.id,
      ),
    ).toEqual(["DEMO-06000"]);
  });
  it("combines trimmed search terms and grouping", () => {
    const result = filterCatalog(
      catalog,
      { ...filter, query: "  DEMO-0000 序列  ", group: "演示资料 B" },
      bookmarks,
    );
    expect(result.map((study) => study.id)).toEqual([
      "DEMO-00002",
      "DEMO-00005",
      "DEMO-00008",
    ]);
  });
  it("intersects bookmarked-only filtering with the search", () => {
    expect(
      filterCatalog(
        catalog,
        { ...filter, onlyBookmarks: true, query: "06000" },
        bookmarks,
      ).map((study) => study.id),
    ).toEqual(["DEMO-06000"]);
    expect(
      filterCatalog(catalog, { ...filter, onlyBookmarks: true }, new Set()),
    ).toEqual([]);
  });
  it("sorts by time without mutating the shared catalog", () => {
    const result = filterCatalog(
      catalog,
      { ...filter, order: "recent" },
      bookmarks,
    );
    expect(result[0]).toBe(catalog[5999]);
    expect(result.at(-1)).toBe(catalog[0]);
    expect(catalog[0].id).toBe("DEMO-00001");
  });
  it("returns an empty result for unmatched multi-term searches", () => {
    expect(
      filterCatalog(
        catalog,
        { ...filter, query: "DEMO-06000 不存在" },
        bookmarks,
      ),
    ).toEqual([]);
  });
});
