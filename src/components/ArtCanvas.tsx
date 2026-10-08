import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  createArtScene,
  type ArtScene,
  type SceneMode,
} from "../scene/createArtScene";
import { artworkKinds, type ArtworkKind } from "../data/artworks";
import { useLab } from "../state/LabContext";
import { useMotionPreference } from "../hooks/useMotionPreference";

export interface ArtCanvasHandle {
  setProgress: (progress: number) => void;
}
interface Props {
  mode: SceneMode;
  kind?: ArtworkKind;
  available?: ArtworkKind[];
}

export const ArtCanvas = forwardRef<ArtCanvasHandle, Props>(function ArtCanvas(
  { mode, kind = "particles", available = [...artworkKinds] },
  ref,
) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<ArtScene | null>(null);
  const progress = useRef(0);
  const { settings } = useLab();
  const reduced = useMotionPreference();
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [attempt, setAttempt] = useState(0);
  const latest = useRef({ settings, reduced, kind, available });
  latest.current = { settings, reduced, kind, available };
  useImperativeHandle(
    ref,
    () => ({
      setProgress: (value) => {
        progress.current = value;
        scene.current?.setProgress(value);
      },
    }),
    [],
  );
  useEffect(() => {
    if (!host.current) return;
    setState("loading");
    try {
      const controller = createArtScene(host.current, {
        mode,
        kind: latest.current.kind,
        onLost: () => setState("fallback"),
      });
      scene.current = controller;
      controller.configure(latest.current.settings, latest.current.reduced);
      controller.setAvailable(latest.current.available);
      controller.setProgress(progress.current);
      setState("ready");
      return () => {
        scene.current = null;
        controller.dispose();
      };
    } catch (error) {
      console.warn("Unable to initialize the art scene", error);
      host.current.replaceChildren();
      setState("fallback");
    }
  }, [mode, attempt]);
  useEffect(() => {
    scene.current?.configure(settings, reduced);
  }, [settings, reduced]);
  useEffect(() => {
    scene.current?.setKind(kind);
  }, [kind]);
  useEffect(() => {
    scene.current?.setAvailable(available);
  }, [available]);
  return (
    <div className={"art-canvas art-canvas--" + mode} data-scene-state={state}>
      <div className="art-canvas__host" ref={host} aria-hidden="true" />
      {state === "loading" && (
        <div className="scene-status" role="status">
          正在准备空间
          <span className="loading-dot" />
        </div>
      )}
      {state === "fallback" && (
        <div className="scene-fallback">
          <div className="fallback-sculpture" aria-hidden="true" />
          <div className="fallback-message">
            <p>当前设备暂时无法展示实时场景。你仍可浏览作品和保存实验。</p>
            <button
              className="text-button"
              onClick={() => setAttempt((value) => value + 1)}
            >
              重新加载场景 ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
