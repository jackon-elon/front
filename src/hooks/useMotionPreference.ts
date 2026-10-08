import { useEffect, useState } from "react";
import { useLab } from "../state/LabContext";

export function useMotionPreference() {
  const { settings } = useLab();
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return systemReduced || settings.motion === "reduced";
}
