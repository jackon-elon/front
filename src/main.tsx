import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { LabProvider } from "./state/LabContext";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LabProvider>
      <App />
    </LabProvider>
  </StrictMode>,
);
