import { Profiler, StrictMode } from "react";
import {
  diagnosticsEnabled,
  profileRender,
  startDiagnostics,
} from "./performance";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./site.css";
import "./narrative.css";
import "./product-scenes.css";
import "./brand/editorial.css";
startDiagnostics();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig
      reducedMotion={
        new URLSearchParams(window.location.search).get("motion") === "off"
          ? "always"
          : "user"
      }
    >
      {diagnosticsEnabled ? (
        <Profiler id="App" onRender={profileRender}>
          <App />
        </Profiler>
      ) : (
        <App />
      )}
    </MotionConfig>
  </StrictMode>,
);
