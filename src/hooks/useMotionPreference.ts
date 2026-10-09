import { useEffect, useState } from "react";
import { useStudio } from "../state/StudioContext";

export function useMotionPreference() {
  const { reducedMotion } = useStudio();
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return systemReduced || reducedMotion;
}
