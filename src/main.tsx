import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StudioProvider } from "./state/StudioContext";
import { CatalogProvider } from "./hooks/useCatalog";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StudioProvider>
      <CatalogProvider>
        <App />
      </CatalogProvider>
    </StudioProvider>
  </StrictMode>,
);
