import { memo } from "react";
import { Bookmark } from "lucide-react";
import { ImageFrame } from "../ImageFrame";
import type { Study } from "./catalog";

// Positioning lives outside this component, so scrolling does not invalidate
// the thumbnail and metadata unless this row's own props change.
export const StudyRow = memo(function StudyRow({
  study,
  selected,
  bookmarked,
  position,
  total,
  onSelect,
}: {
  study: Study;
  selected: boolean;
  bookmarked: boolean;
  position: number;
  total: number;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      id={`study-${study.id}`}
      role="option"
      aria-label={`${study.id}，${study.title}，${study.group}${bookmarked ? "，已收藏" : ""}`}
      aria-selected={selected}
      aria-posinset={position}
      aria-setsize={total}
      className="study-row"
      onClick={() => onSelect(study.id)}
    >
      <ImageFrame frame={study.frame} className="study-thumbnail" />
      <div className="study-row-copy">
        <strong>{study.title}</strong>
        <span>
          {study.id} <i>·</i> {study.group}
        </span>
      </div>
      {bookmarked && (
        <Bookmark
          className="study-bookmark"
          size={17}
          fill="currentColor"
          aria-hidden="true"
        />
      )}
    </div>
  );
});
