import { describe, expect, it } from "vitest";
import {
  annotationsReducer,
  constrain,
  imagePoint,
  initialHistory,
  initialView,
  zoomAt,
  type Annotation,
} from "./viewerModel";
describe("normalized viewer geometry", () => {
  it("keeps the image coordinate beneath a zoom anchor", () => {
    const anchor = { x: 0.7, y: 0.3 };
    const next = zoomAt(initialView, 2, anchor);
    expect(imagePoint(next, anchor)).toEqual(anchor);
    expect(next.pan.x).toBeCloseTo(-0.2);
    expect(next.pan.y).toBeCloseTo(0.2);
  });
  it("moves a pinch anchor to its new center", () => {
    const anchor = { x: 0.45, y: 0.55 },
      target = { x: 0.6, y: 0.4 };
    const next = zoomAt(initialView, 2.5, anchor, target);
    expect(imagePoint(next, target).x).toBeCloseTo(anchor.x);
    expect(imagePoint(next, target).y).toBeCloseTo(anchor.y);
  });
  it("clamps zoom and pan so the image cannot leave an empty edge", () => {
    expect(constrain({ scale: 0.3, pan: { x: 2, y: -2 } })).toEqual(
      initialView,
    );
    expect(constrain({ scale: 20, pan: { x: 5, y: -5 } })).toEqual({
      scale: 4,
      pan: { x: 1.5, y: -1.5 },
    });
    expect(
      zoomAt({ scale: 3, pan: { x: 0.8, y: -0.7 } }, 1, { x: 0, y: 1 }),
    ).toEqual(initialView);
  });
  it("preserves the same image point after viewport resizing", () => {
    const view = { scale: 2, pan: { x: 0.1, y: -0.1 } };
    const desktop = imagePoint(view, { x: 280 / 400, y: 120 / 400 });
    const mobile = imagePoint(view, { x: 210 / 300, y: 90 / 300 });
    expect(mobile).toEqual(desktop);
  });
});
describe("annotation command history", () => {
  const mark = (id: string, frame = 0): Annotation => ({
    id,
    frame,
    from: { x: 0.2, y: 0.2 },
    to: { x: 0.4, y: 0.5 },
  });
  it("undoes and redoes frame-specific clearing without changing another frame", () => {
    const first = annotationsReducer(initialHistory, {
      type: "add",
      annotation: mark("one"),
    });
    const both = annotationsReducer(first, {
      type: "add",
      annotation: mark("two", 1),
    });
    const cleared = annotationsReducer(both, { type: "clear", frame: 0 });
    expect(cleared.present.map((m) => m.id)).toEqual(["two"]);
    const undone = annotationsReducer(cleared, { type: "undo" });
    expect(undone.present).toEqual(both.present);
    expect(annotationsReducer(undone, { type: "redo" }).present).toEqual(
      cleared.present,
    );
    expect(annotationsReducer(cleared, { type: "clear", frame: 0 })).toBe(
      cleared,
    );
  });
  it("discards redo after editing an earlier snapshot and bounds history", () => {
    const first = annotationsReducer(initialHistory, {
      type: "add",
      annotation: mark("one"),
    });
    const undone = annotationsReducer(first, { type: "undo" });
    const branch = annotationsReducer(undone, {
      type: "add",
      annotation: mark("new"),
    });
    expect(branch.future).toHaveLength(0);
    expect(annotationsReducer(branch, { type: "redo" })).toBe(branch);
    let state = branch;
    for (let i = 0; i < 70; i++)
      state = annotationsReducer(state, {
        type: "add",
        annotation: mark(String(i)),
      });
    expect(state.past).toHaveLength(50);
    expect(initialHistory.present).toHaveLength(0);
  });
});
