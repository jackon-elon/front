export type WorkflowState = {
  mode: number;
  step: number;
  playing: boolean;
  runId: number;
};
export type WorkflowEvent =
  | { type: "start" | "reset" }
  | { type: "mode"; mode: number }
  | { type: "advance"; runId: number };
export const initialWorkflow: WorkflowState = {
  mode: 0,
  step: -1,
  playing: false,
  runId: 0,
};
// A generation number rejects callbacks from cancelled or superseded runs.
export function workflowReducer(
  state: WorkflowState,
  event: WorkflowEvent,
): WorkflowState {
  switch (event.type) {
    case "mode":
      if (!Number.isInteger(event.mode) || event.mode < 0 || event.mode > 2)
        return state;
      return {
        mode: event.mode,
        step: -1,
        playing: false,
        runId: state.runId + 1,
      };
    case "reset":
      return { ...state, step: -1, playing: false, runId: state.runId + 1 };
    case "start":
      return { ...state, step: 0, playing: true, runId: state.runId + 1 };
    case "advance":
      if (!state.playing || event.runId !== state.runId) return state;
      return state.step < 3
        ? { ...state, step: state.step + 1 }
        : { ...state, playing: false };
  }
}
