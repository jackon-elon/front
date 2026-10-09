import { describe, expect, it } from "vitest";
import {
  initialDesign,
  normalizeStudio,
  studioReducer,
  type SavedDesign,
} from "./studioModel";

const saved: SavedDesign = {
  id: "version-1",
  projectId: "soft-signal",
  title: "春天",
  note: "绿色版本",
  settings: { accent: "#b8cbb2", intensity: 1.2, paused: true },
  createdAt: "2026-10-09T01:00:00Z",
};

describe("design state", () => {
  it("isolates drafts and keeps saved snapshots when the live design changes", () => {
    const first = studioReducer(normalizeStudio(null), {
      type: "edit",
      id: "soft-signal",
      patch: saved.settings,
    });
    const withVersion = studioReducer(first, { type: "save", entry: saved });
    const edited = studioReducer(withVersion, {
      type: "edit",
      id: "soft-signal",
      patch: { accent: "#eee178" },
    });
    const other = studioReducer(edited, {
      type: "edit",
      id: "off-grid",
      patch: { intensity: 0.5 },
    });
    expect(other.saved[0].settings.accent).toBe("#b8cbb2");
    expect(other.drafts["soft-signal"]?.accent).toBe("#eee178");
    expect(other.drafts["off-grid"]).toEqual({
      ...initialDesign,
      intensity: 0.5,
    });
    expect(first.drafts["soft-signal"]?.accent).toBe("#b8cbb2");
  });
  it("restores only the selected design and resumes animation", () => {
    const state = normalizeStudio({
      saved: [saved],
      drafts: {
        "off-grid": { intensity: 0.7 },
        "soft-signal": { accent: "#ffffff" },
      },
    });
    const restored = studioReducer(state, { type: "restore", id: saved.id });
    expect(restored.drafts["soft-signal"]).toEqual({
      ...saved.settings,
      paused: false,
    });
    expect(restored.drafts["off-grid"]).toEqual(state.drafts["off-grid"]);
    expect(studioReducer(restored, { type: "restore", id: "missing" })).toBe(
      restored,
    );
    const reset = studioReducer(restored, { type: "reset", id: "soft-signal" });
    expect(reset.drafts["soft-signal"]).toBeUndefined();
    expect(reset.saved).toEqual(restored.saved);
  });
  it("reorders favorites without duplicating or dropping a card", () => {
    const state = normalizeStudio({
      favorites: ["off-grid", "soft-signal", "color-field"],
    });
    const reordered = studioReducer(state, {
      type: "reorder",
      from: "color-field",
      to: "off-grid",
    });
    expect(reordered.favorites).toEqual([
      "color-field",
      "off-grid",
      "soft-signal",
    ]);
    expect(state.favorites).toEqual(["off-grid", "soft-signal", "color-field"]);
    expect(
      studioReducer(reordered, {
        type: "reorder",
        from: "type-wave",
        to: "off-grid",
      }),
    ).toBe(reordered);
    expect(
      studioReducer(reordered, { type: "favorite", id: "off-grid" }).favorites,
    ).toEqual(["color-field", "soft-signal"]);
  });
  it("recovers corrupt storage and clamps unsafe design values", () => {
    const state = normalizeStudio({
      favorites: ["off-grid", "off-grid", "unknown"],
      drafts: {
        "off-grid": { accent: "bad", intensity: Infinity, paused: "yes" },
        "soft-signal": { accent: "#ABCDEF", intensity: 100 },
        unknown: {},
      },
      saved: [
        null,
        { ...saved, createdAt: "invalid" },
        saved,
        saved,
        { ...saved, id: "unknown", projectId: "unknown" },
      ],
    });
    expect(state.favorites).toEqual(["off-grid"]);
    expect(state.drafts["off-grid"]).toEqual(initialDesign);
    expect(state.drafts["soft-signal"]).toEqual({
      accent: "#abcdef",
      intensity: 1.5,
      paused: false,
    });
    expect(Object.keys(state.drafts)).toHaveLength(2);
    expect(state.saved).toEqual([saved]);
    expect(normalizeStudio(null).saved).toEqual([]);
  });
  it("persists ordered favorites, settings and saved versions through JSON", () => {
    const state = normalizeStudio({
      favorites: ["color-field", "off-grid"],
      saved: [saved],
      reducedMotion: true,
      drafts: { "soft-signal": saved.settings },
    });
    expect(normalizeStudio(JSON.parse(JSON.stringify(state)))).toEqual(state);
  });
  it("keeps the newest 30 versions and removes the requested version", () => {
    const state = normalizeStudio({
      saved: Array.from({ length: 30 }, (_, i) => ({
        ...saved,
        id: `old-${i}`,
      })),
    });
    const next = studioReducer(state, { type: "save", entry: saved });
    expect(next.saved).toHaveLength(30);
    expect(next.saved[0].id).toBe(saved.id);
    expect(next.saved.some((item) => item.id === "old-29")).toBe(false);
    expect(
      studioReducer(next, { type: "delete", id: saved.id }).saved,
    ).toHaveLength(29);
  });
});
