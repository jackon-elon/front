export type Point = { x: number; y: number };
export type View = { scale: number; pan: Point };
export const initialView: View = { scale: 1, pan: { x: 0, y: 0 } };
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export function constrain(view: View): View {
  const scale = clamp(view.scale, 1, 4);
  if (scale === 1) return initialView;
  const edge = (scale - 1) / 2;
  return {
    scale,
    pan: {
      x: clamp(view.pan.x, -edge, edge),
      y: clamp(view.pan.y, -edge, edge),
    },
  };
}
// All coordinates are fractions of the square viewport. Resizing requires no
// pixel-coordinate migration, including for annotations and pinch gestures.
export function imagePoint(view: View, point: Point): Point {
  return {
    x: (point.x - 0.5 - view.pan.x) / view.scale + 0.5,
    y: (point.y - 0.5 - view.pan.y) / view.scale + 0.5,
  };
}
export function zoomAt(
  view: View,
  scale: number,
  anchor: Point,
  target = anchor,
): View {
  const next = clamp(scale, 1, 4);
  const image = imagePoint(view, anchor);
  return constrain({
    scale: next,
    pan: {
      x: target.x - 0.5 - (image.x - 0.5) * next,
      y: target.y - 0.5 - (image.y - 0.5) * next,
    },
  });
}
export type Annotation = { id: string; frame: number; from: Point; to: Point };
export type History = {
  past: readonly (readonly Annotation[])[];
  present: readonly Annotation[];
  future: readonly (readonly Annotation[])[];
};
export const initialHistory: History = { past: [], present: [], future: [] };
export type AnnotationAction =
  | { type: "add"; annotation: Annotation }
  | { type: "clear"; frame: number }
  | { type: "undo" }
  | { type: "redo" };
const commit = (state: History, present: readonly Annotation[]): History => ({
  past: [...state.past.slice(-49), state.present],
  present,
  future: [],
});
export function annotationsReducer(
  state: History,
  action: AnnotationAction,
): History {
  switch (action.type) {
    case "add":
      return commit(state, [...state.present, action.annotation]);
    case "clear": {
      const remaining = state.present.filter(
        (mark) => mark.frame !== action.frame,
      );
      return remaining.length === state.present.length
        ? state
        : commit(state, remaining);
    }
    case "undo": {
      const previous = state.past.at(-1);
      return previous
        ? {
            past: state.past.slice(0, -1),
            present: previous,
            future: [state.present, ...state.future],
          }
        : state;
    }
    case "redo": {
      const next = state.future[0];
      return next
        ? {
            past: [...state.past, state.present],
            present: next,
            future: state.future.slice(1),
          }
        : state;
    }
  }
}
