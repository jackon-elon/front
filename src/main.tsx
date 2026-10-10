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
      transition={{ layout: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
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
