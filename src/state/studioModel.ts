import { isProjectId, type ProjectId } from "../data/projects";
export interface DesignSettings {
  accent: string | null;
  intensity: number;
  paused: boolean;
}
export interface SavedDesign {
  id: string;
  projectId: ProjectId;
  title: string;
  note: string;
  settings: DesignSettings;
  createdAt: string;
}
export interface StudioState {
  favorites: ProjectId[];
  drafts: Partial<Record<ProjectId, DesignSettings>>;
  saved: SavedDesign[];
  reducedMotion: boolean;
}
export const initialDesign: DesignSettings = {
  accent: null,
  intensity: 1,
  paused: false,
};
export const studioStorageKey = "form-flow:studio:v1";
export function normalizeDesign(value: unknown): DesignSettings {
  const v =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    accent:
      typeof v.accent === "string" && /^#[\da-f]{6}$/i.test(v.accent)
        ? v.accent.toLowerCase()
        : null,
    intensity:
      typeof v.intensity === "number" && Number.isFinite(v.intensity)
        ? Math.max(0.3, Math.min(1.5, v.intensity))
        : 1,
    paused: v.paused === true,
  };
}
export function normalizeStudio(value: unknown): StudioState {
  const v =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const favorites = Array.isArray(v.favorites)
    ? [...new Set(v.favorites.filter(isProjectId))]
    : [];
  const drafts: StudioState["drafts"] = {};
  if (v.drafts && typeof v.drafts === "object")
    for (const [id, settings] of Object.entries(v.drafts))
      if (isProjectId(id)) drafts[id] = normalizeDesign(settings);
  const ids = new Set<string>();
  const saved: SavedDesign[] = Array.isArray(v.saved)
    ? v.saved
        .flatMap((item) => {
          if (
            !item ||
            typeof item.id !== "string" ||
            ids.has(item.id) ||
            !isProjectId(item.projectId) ||
            typeof item.title !== "string" ||
            !item.title.trim() ||
            typeof item.createdAt !== "string" ||
            !Number.isFinite(Date.parse(item.createdAt))
          )
            return [];
          ids.add(item.id);
          return [
            {
              id: item.id,
              projectId: item.projectId,
              title: item.title.trim().slice(0, 40),
              note:
                typeof item.note === "string" ? item.note.slice(0, 200) : "",
              settings: normalizeDesign(item.settings),
              createdAt: item.createdAt,
            },
          ];
        })
        .slice(0, 30)
    : [];
  return { favorites, drafts, saved, reducedMotion: v.reducedMotion === true };
}
export type StudioAction =
  | { type: "favorite"; id: ProjectId }
  | { type: "reorder"; from: ProjectId; to: ProjectId }
  | { type: "edit"; id: ProjectId; patch: Partial<DesignSettings> }
  | { type: "reset"; id: ProjectId }
  | { type: "save"; entry: SavedDesign }
  | { type: "restore"; id: string }
  | { type: "delete"; id: string }
  | { type: "motion"; reduced: boolean };
export function studioReducer(
  state: StudioState,
  action: StudioAction,
): StudioState {
  switch (action.type) {
    case "favorite":
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };
    case "reorder": {
      const from = state.favorites.indexOf(action.from),
        to = state.favorites.indexOf(action.to);
      if (from < 0 || to < 0 || from === to) return state;
      const favorites = [...state.favorites];
      favorites.splice(from, 1);
      favorites.splice(to, 0, action.from);
      return { ...state, favorites };
    }
    case "edit":
      return {
        ...state,
        drafts: {
          ...state.drafts,
          [action.id]: normalizeDesign({
            ...(state.drafts[action.id] ?? initialDesign),
            ...action.patch,
          }),
        },
      };
    case "reset": {
      const drafts = { ...state.drafts };
      delete drafts[action.id];
      return { ...state, drafts };
    }
    case "save":
      return {
        ...state,
        saved: [
          action.entry,
          ...state.saved.filter((item) => item.id !== action.entry.id),
        ].slice(0, 30),
      };
    case "restore": {
      const entry = state.saved.find((item) => item.id === action.id);
      return entry
        ? {
            ...state,
            drafts: {
              ...state.drafts,
              [entry.projectId]: { ...entry.settings, paused: false },
            },
          }
        : state;
    }
    case "delete":
      return {
        ...state,
        saved: state.saved.filter((item) => item.id !== action.id),
      };
    case "motion":
      return { ...state, reducedMotion: action.reduced };
  }
}
