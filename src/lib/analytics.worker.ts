import { analyze, type Filters } from "../../shared/analytics";
import type { Session } from "../../shared/schema";
self.onmessage = (
  event: MessageEvent<{ id: number; sessions: Session[]; filters: Filters }>,
) => {
  const { id, sessions, filters } = event.data;
  self.postMessage({ id, result: analyze(sessions, filters) });
};
