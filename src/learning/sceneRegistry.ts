export interface InspectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
export interface SceneInspection {
  title: string;
  selector: string;
  source: string;
  note: string;
  rect: InspectionRect;
}
const scenes = new Map<
  HTMLElement,
  (x: number, y: number) => SceneInspection | null
>();
export function registerSceneInspector(
  host: HTMLElement,
  inspect: (x: number, y: number) => SceneInspection | null,
) {
  scenes.set(host, inspect);
  return () => {
    scenes.delete(host);
  };
}
export function inspectSceneAt(x: number, y: number): SceneInspection | null {
  for (const [host, inspect] of scenes) {
    if (!host.isConnected) continue;
    const bounds = host.getBoundingClientRect();
    if (
      x < bounds.left ||
      x > bounds.right ||
      y < bounds.top ||
      y > bounds.bottom
    )
      continue;
    const result = inspect(x, y);
    if (result) return result;
  }
  return null;
}
