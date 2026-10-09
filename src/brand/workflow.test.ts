import { describe, expect, it } from "vitest";
import { initialWorkflow, workflowReducer } from "./workflow";
describe("medical Agent scenario lifecycle", () => {
  it("advances four steps and stops without exceeding the final step", () => {
    let state = workflowReducer(initialWorkflow, { type: "start" });
    expect(state).toMatchObject({ step: 0, playing: true });
    for (let index = 0; index < 4; index++)
      state = workflowReducer(state, { type: "advance", runId: state.runId });
    expect(state).toMatchObject({ step: 3, playing: false });
    expect(
      workflowReducer(state, { type: "advance", runId: state.runId }),
    ).toBe(state);
  });
  it("switching scenario cancels the previous run and rejects a late callback", () => {
    const running = workflowReducer(initialWorkflow, { type: "start" });
    const switched = workflowReducer(running, { type: "mode", mode: 2 });
    expect(switched).toMatchObject({ mode: 2, step: -1, playing: false });
    const restarted = workflowReducer(switched, { type: "start" });
    expect(
      workflowReducer(restarted, { type: "advance", runId: running.runId }),
    ).toBe(restarted);
  });
  it("reset and restart reject a superseded timer", () => {
    const running = workflowReducer(initialWorkflow, { type: "start" });
    const reset = workflowReducer(running, { type: "reset" });
    expect(reset.step).toBe(-1);
    const fresh = workflowReducer(reset, { type: "start" });
    expect(
      workflowReducer(fresh, { type: "advance", runId: running.runId }),
    ).toBe(fresh);
    expect(
      workflowReducer(fresh, { type: "advance", runId: fresh.runId }).step,
    ).toBe(1);
  });
  it.each([-1, 3, 1.5, NaN])("rejects invalid scenario %s", (mode) => {
    expect(workflowReducer(initialWorkflow, { type: "mode", mode })).toBe(
      initialWorkflow,
    );
  });
});
