import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export function Modal({
  open,
  title,
  onClose,
  children,
  className = "",
  animated = false,
  sharedId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  animated?: boolean;
  sharedId?: string;
}) {
  const reduced =
    useReducedMotion() ||
    new URLSearchParams(window.location.search).get("motion") === "off";
  const id = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const latestClose = useRef(onClose);
  useEffect(() => {
    latestClose.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const getFocusable = () =>
      [
        ...(dialog.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex="0"]',
        ) ?? []),
      ].filter(
        (element) =>
          !element.hasAttribute("disabled") && element.getClientRects().length,
      );
    const frame = requestAnimationFrame(() => {
      const initial =
        dialog.current?.querySelector<HTMLElement>("[data-autofocus]");
      (initial ?? getFocusable()[0] ?? dialog.current)?.focus();
    });
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        latestClose.current();
      }
      if (event.key !== "Tab") return;
      const elements = getFocusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialog.current?.focus();
      } else if (!dialog.current?.contains(document.activeElement)) {
        // A failed or removed child can send focus back to body. The next Tab
        // must stay in this dialog, including while an error fallback is shown.
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialog.current)
      ) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <motion.div
      layoutRoot
      initial={animated && !reduced ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.28 }}
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        layoutId={reduced ? undefined : sharedId}
        layoutScroll
        style={{ borderRadius: 24 }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        ref={dialog}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        className={"modal " + className}
      >
        <div className="modal-header">
          <h2 id={id}>{title}</h2>
          <button
            className="icon-button"
            aria-label="关闭弹窗"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}
