import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import App from "./App";
import "./site.css";
import "./narrative.css";
import "./product-scenes.css";
import "./brand/editorial.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig
      reducedMotion={
        new URLSearchParams(window.location.search).get("motion") === "off"
          ? "always"
          : "user"
      }
    >
      <App />
    </MotionConfig>
  </StrictMode>,
);
