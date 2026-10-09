import { useLayoutEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { useMotionPreference } from "./useMotionPreference";
gsap.registerPlugin(Flip);
export function useFlipList(
  container: RefObject<HTMLElement | null>,
  layoutKey: string,
) {
  const previous = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const animation = useRef<gsap.core.Timeline | null>(null);
  const reduced = useMotionPreference();
  const capture = () => {
    animation.current?.progress(1).kill();
    const cards = container.current?.querySelectorAll(".project-card");
    if (cards?.length && !reduced) previous.current = Flip.getState(cards);
  };
  useLayoutEffect(() => {
    if (previous.current && !reduced) {
      animation.current = Flip.from(previous.current, {
        duration: 0.6,
        ease: "power3.inOut",
        absolute: true,
        scale: true,
        targets: container.current?.querySelectorAll(".project-card"),
        stagger: 0.025,
        onEnter: (elements) =>
          gsap.fromTo(
            elements,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.15 },
          ),
      });
      previous.current = null;
    }
  }, [layoutKey, reduced, container]);
  useLayoutEffect(
    () => () => {
      animation.current?.kill();
    },
    [],
  );
  return capture;
}
