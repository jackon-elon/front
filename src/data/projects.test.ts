import catalog from "../../public/catalog.json";
import { describe, expect, it } from "vitest";
import { readCatalog, projectIds } from "./projects";
describe("catalog boundary", () => {
  it("loads all six real catalog entries with unique identities", () => {
    expect(readCatalog(catalog).map((project) => project.id)).toEqual([
      ...projectIds,
    ]);
  });
  it("rejects unknown identities, duplicate identities and malformed response fields", () => {
    expect(() => readCatalog({ projects: catalog })).toThrow();
    expect(() => readCatalog([catalog[0], catalog[0]])).toThrow();
    for (const patch of [
      { id: "unknown" },
      { year: null },
      { category: "unknown" },
      { color: 123 },
      { tags: [null] },
    ]) {
      expect(() => readCatalog([{ ...catalog[0], ...patch }])).toThrow();
    }
  });
});
