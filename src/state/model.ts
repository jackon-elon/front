import { isArtworkKind, type ArtworkKind } from "../data/artworks";

export type Quality = "auto" | "high" | "eco";
export interface LabSettings {
  density: number;
  speed: number;
  color: string;
  paused: boolean;
  quality: Quality;
  motion: "auto" | "reduced";
  formation: "sphere" | "helix" | "vortex";
  interaction: "repel" | "attract";
}
export interface SavedExperiment {
  id: string;
  title: string;
  kind: ArtworkKind;
  settings: LabSettings;
  createdAt: string;
}
export interface PersistedLab {
  settings: LabSettings;
  favorites: ArtworkKind[];
  saved: SavedExperiment[];
}

export const storageKey = "form-flow:lab:v1";
export const defaultSettings: LabSettings = {
  density: 0.72,
  speed: 0.75,
  color: "#2455ff",
  paused: false,
  quality: "auto",
  motion: "auto",
  formation: "sphere",
  interaction: "repel",
};

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function boundedNumber(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(min, Math.min(max, value))
    : fallback;
}

export function normalizeSettings(value: unknown): LabSettings {
  const input = record(value);
  return {
    density: boundedNumber(input.density, defaultSettings.density, 0.15, 1),
    speed: boundedNumber(input.speed, defaultSettings.speed, 0.2, 2),
    color:
      typeof input.color === "string" && /^#[\da-f]{6}$/i.test(input.color)
        ? input.color.toLowerCase()
        : defaultSettings.color,
    paused:
      typeof input.paused === "boolean" ? input.paused : defaultSettings.paused,
    quality: ["auto", "high", "eco"].includes(String(input.quality))
      ? (input.quality as Quality)
      : defaultSettings.quality,
    motion: input.motion === "reduced" ? "reduced" : "auto",
    formation: ["sphere", "helix", "vortex"].includes(String(input.formation))
      ? (input.formation as LabSettings["formation"])
      : defaultSettings.formation,
    interaction: input.interaction === "attract" ? "attract" : "repel",
  };
}

export function normalizePersisted(value: unknown): PersistedLab {
  const input = record(value);
  const favorites = Array.isArray(input.favorites)
    ? [...new Set(input.favorites.filter(isArtworkKind))]
    : [];
  const saved = Array.isArray(input.saved)
    ? input.saved
        .flatMap((entry) => {
          const item = record(entry);
          if (
            typeof item.id !== "string" ||
            !item.id ||
            !isArtworkKind(item.kind) ||
            typeof item.title !== "string" ||
            !item.title.trim() ||
            typeof item.createdAt !== "string" ||
            !Number.isFinite(Date.parse(item.createdAt))
          )
            return [];
          return [
            {
              id: item.id.slice(0, 100),
              kind: item.kind,
              title: item.title.trim().slice(0, 40),
              createdAt: item.createdAt,
              settings: normalizeSettings(item.settings),
            },
          ];
        })
        .slice(0, 30)
    : [];
  return { settings: normalizeSettings(input.settings), favorites, saved };
}

export type LabAction =
  | { type: "settings"; value: Partial<LabSettings> }
  | { type: "favorite"; kind: ArtworkKind }
  | { type: "save"; entry: SavedExperiment }
  | { type: "delete"; id: string }
  | { type: "restore"; id: string }
  | { type: "reset" };

export function labReducer(
  state: PersistedLab,
  action: LabAction,
): PersistedLab {
  switch (action.type) {
    case "settings":
      return {
        ...state,
        settings: normalizeSettings({ ...state.settings, ...action.value }),
      };
    case "favorite":
      return {
        ...state,
        favorites: state.favorites.includes(action.kind)
          ? state.favorites.filter((kind) => kind !== action.kind)
          : [...state.favorites, action.kind],
      };
    case "save":
      return { ...state, saved: [action.entry, ...state.saved].slice(0, 30) };
    case "delete":
      return {
        ...state,
        saved: state.saved.filter((entry) => entry.id !== action.id),
      };
    case "restore": {
      const entry = state.saved.find((item) => item.id === action.id);
      return entry
        ? { ...state, settings: { ...entry.settings, paused: false } }
        : state;
    }
    case "reset":
      return {
        ...state,
        settings: {
          ...defaultSettings,
          quality: state.settings.quality,
          motion: state.settings.motion,
        },
      };
  }
}
