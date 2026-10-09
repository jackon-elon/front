import { useEffect, useRef, useState, type CSSProperties } from "react";
import { media } from "./content";

export const FRAME_COUNT = 6;

export function frameStyle(frame: number): CSSProperties {
  const safe = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(frame)));
  return {
    backgroundImage: `url(${media.jointAtlas})`,
    backgroundPosition: `${(safe % 3) * 50}% ${Math.floor(safe / 3) * 100}%`,
  };
}

/** Linear grayscale windowing of a synthetic, 8-bit image; no DICOM or clinical inference. */
function WindowedImage({
  frame,
  width,
  level,
}: {
  frame: number;
  width: number;
  level: number;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const source = new Image();
    source.onload = () => {
      image.current = source;
      setReady(true);
    };
    source.onerror = () => setFailed(true);
    source.src = media.jointAtlas;
    return () => {
      source.onload = null;
      source.onerror = null;
      image.current = null;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const tick = requestAnimationFrame(() => {
      const source = image.current;
      const context = canvas.current?.getContext("2d", {
        willReadFrequently: true,
      });
      if (!source || !context) return;
      const cellWidth = source.naturalWidth / 3;
      const cellHeight = source.naturalHeight / 2;
      context.drawImage(
        source,
        (frame % 3) * cellWidth,
        Math.floor(frame / 3) * cellHeight,
        cellWidth,
        cellHeight,
        0,
        0,
        512,
        512,
      );
      const pixels = context.getImageData(0, 0, 512, 512);
      for (let i = 0; i < pixels.data.length; i += 4) {
        const gray =
          pixels.data[i] * 0.2126 +
          pixels.data[i + 1] * 0.7152 +
          pixels.data[i + 2] * 0.0722;
        const output = Math.min(
          255,
          Math.max(0, ((gray - level) / width + 0.5) * 255),
        );
        pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = output;
      }
      context.putImageData(pixels, 0, 0);
    });
    return () => cancelAnimationFrame(tick);
  }, [ready, frame, width, level]);
  return failed ? (
    <span className="film-load-message" role="status">
      影像素材暂未加载
    </span>
  ) : (
    <canvas
      ref={canvas}
      width={512}
      height={512}
      className="film-windowed"
      aria-hidden="true"
    />
  );
}

export function RadiologyFilm({
  frame = 2,
  windowing,
  label,
  className = "",
}: {
  frame?: number;
  windowing?: { width: number; level: number };
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`radiology-film ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <div className="film-header">
        <span>
          MR <i />
        </span>
        <span>关节影像</span>
      </div>
      <div className="film-viewport">
        <div className="film-pixels" style={frameStyle(frame)} />
        {windowing && (
          <WindowedImage
            frame={frame}
            width={windowing.width}
            level={windowing.level}
          />
        )}
      </div>
      <div className="film-footer">
        <span>
          影像帧 <b>{String(frame + 1).padStart(2, "0")} / 06</b>
        </span>
        <span>合成素材 · 展示示意</span>
      </div>
    </div>
  );
}
