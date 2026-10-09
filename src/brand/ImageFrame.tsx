import { type CSSProperties } from "react";
import { media } from "./content";
export const FRAME_COUNT = 6;
export function frameStyle(frame: number): CSSProperties {
  const safe = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(frame)));
  return {
    backgroundImage: `url(${media.jointAtlas})`,
    backgroundPosition: `${(safe % 3) * 50}% ${Math.floor(safe / 3) * 100}%`,
  };
}
export function ImageFrame({
  frame = 2,
  label,
  className = "",
}: {
  frame?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={`image-frame ${className}`}
      style={frameStyle(frame)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
