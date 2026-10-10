import { preloadable } from "../components/preloadable";

export const cloudProduct = preloadable<{ initialMode?: 0 | 1 | 2 }>(() =>
  import("./CloudProduct").then((module) => ({ default: module.CloudProduct })),
);
export const imagingAI = preloadable<object>(() =>
  import("./ImagingAI").then((module) => ({ default: module.ImagingAI })),
);
export const medicalAgent = preloadable<object>(() =>
  import("./MedicalAgent").then((module) => ({ default: module.MedicalAgent })),
);
export const imagingLibrary = preloadable<object>(
  () => import("./library/ImagingLibrary"),
);
const products = [cloudProduct, imagingAI, medicalAgent] as const;
export function preloadProduct(index: number) {
  void products[index]?.preload();
}

export function canPreloadNearby() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return (
    !connection?.saveData &&
    !["slow-2g", "2g"].includes(connection?.effectiveType ?? "")
  );
}
