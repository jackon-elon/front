import type { CSSProperties } from "react";

export type IconName =
  | "arrow"
  | "back"
  | "down"
  | "menu"
  | "close"
  | "heart"
  | "play"
  | "pause"
  | "reset"
  | "sound"
  | "mute"
  | "search"
  | "check"
  | "trash"
  | "expand";

const paths: Record<IconName, string[]> = {
  arrow: ["M5 19 19 5", "M5 5h14v14"],
  back: ["M19 12H5", "m11 18-6-6 6-6"],
  down: ["M12 4v16", "m5 13 7 7 7-7"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  close: ["m6 6 12 12", "M18 6 6 18"],
  heart: [
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  ],
  play: ["m8 5 11 7-11 7Z"],
  pause: ["M8 5v14", "M16 5v14"],
  reset: ["M3 11a9 9 0 1 1 2.7 7", "M3 4v7h7"],
  sound: [
    "m11 4-6 5H2v6h3l6 5Z",
    "M16 8a6 6 0 0 1 0 8",
    "M19 4a11 11 0 0 1 0 16",
  ],
  mute: ["m11 4-6 5H2v6h3l6 5Z", "m16 9 5 6", "m21 9-5 6"],
  search: ["M21 21 16.5 16.5", "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"],
  check: ["m5 12 4 4L19 6"],
  trash: ["M3 6h18", "M9 6V3h6v3", "m6 6 1 15h10l1-15", "M10 10v7", "M14 10v7"],
  expand: ["M8 3H3v5", "M16 3h5v5", "M3 16v5h5", "M21 16v5h-5"],
};

export function Icon({
  name,
  className = "",
  style,
}: {
  name: IconName;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={"icon " + className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name].map((path, index) => (
        <path d={path} key={index} />
      ))}
    </svg>
  );
}
