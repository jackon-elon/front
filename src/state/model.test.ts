import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  labReducer,
  normalizePersisted,
  normalizeSettings,
} from "./model";

describe("persisted experimental controls", () => {
  it("bounds GPU density/speed and rejects malformed colors and non-finite values", () => {
    expect(
      normalizeSettings({ density: 500, speed: -9, color: "<script>" }),
    ).toMatchObject({ density: 1, speed: 0.2, color: defaultSettings.color });
    expect(normalizeSettings({ density: Infinity, speed: NaN })).toMatchObject({
      density: defaultSettings.density,
      speed: defaultSettings.speed,
    });
  });

  it("recovers from malformed storage without treating invalid entries as experiments", () => {
    expect(normalizePersisted(null)).toEqual({
      settings: defaultSettings,
      favorites: [],
      saved: [],
    });
    const state = normalizePersisted({
      favorites: ["particles", "particles", "unknown"],
      saved: [{ id: "bad", kind: "unknown", title: "Bad", createdAt: "now" }],
    });
    expect(state.favorites).toEqual(["particles"]);
    expect(state.saved).toEqual([]);
    // Existing v1 browser saves predate force/formation controls and must migrate.
    expect(normalizeSettings({ speed: 1.4 })).toMatchObject({
      speed: 1.4,
      formation: "sphere",
      interaction: "repel",
    });
    expect(
      normalizeSettings({ formation: "unknown", interaction: null }),
    ).toMatchObject({
      formation: "sphere",
      interaction: "repel",
    });
  });

  it("restores saved controls, resumes motion and keeps favorites independent of reset", () => {
    const initial = normalizePersisted({
      favorites: ["light"],
      saved: [
        {
          id: "preset",
          title: "我的实验",
          kind: "particles",
          createdAt: "2026-10-09T00:00:00Z",
          settings: {
            density: 0.4,
            speed: 1.4,
            color: "#abcdef",
            paused: true,
            formation: "vortex",
            interaction: "attract",
          },
        },
      ],
    });
    const restored = labReducer(initial, { type: "restore", id: "preset" });
    expect(restored.settings).toMatchObject({
      density: 0.4,
      speed: 1.4,
      color: "#abcdef",
      paused: false,
      formation: "vortex",
      interaction: "attract",
    });
    const reset = labReducer(restored, { type: "reset" });
    expect(reset.favorites).toEqual(["light"]);
    expect(reset.saved).toHaveLength(1);
    expect(reset.settings.density).toBe(defaultSettings.density);
  });
});
