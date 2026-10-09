import { flushSync } from "react-dom";
import { Link, useNavigate, type LinkProps } from "react-router-dom";
import { useMotionPreference } from "../hooks/useMotionPreference";
let currentTransition: ViewTransition | null = null;
export function TransitionLink({ onClick, to, state, ...props }: LinkProps) {
  const navigate = useNavigate(),
    reduced = useMotionPreference();
  return (
    <Link
      {...props}
      to={to}
      state={state}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        )
          return;
        event.preventDefault();
        currentTransition?.skipTransition();
        const nextState =
          state && typeof state === "object" && "origin" in state
            ? { ...state, scroll: window.scrollY }
            : state;
        if (!document.startViewTransition || reduced) {
          delete document.documentElement.dataset.navigationTransition;
          navigate(to, { state: nextState });
          return;
        }
        document.documentElement.dataset.navigationTransition = "true";
        const transition = document.startViewTransition(() =>
          flushSync(() => navigate(to, { state: nextState })),
        );
        currentTransition = transition;
        void transition.ready.catch(() => {});
        void transition.finished
          .catch(() => {})
          .finally(() => {
            if (currentTransition === transition) {
              currentTransition = null;
              delete document.documentElement.dataset.navigationTransition;
            }
          });
      }}
    />
  );
}
