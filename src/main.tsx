import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "./state/AppContext";
import { readSetting } from "./lib/storage";
import App from "./App";
import "./styles.css";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});
document.documentElement.dataset.density = readSetting(
  "density",
  "comfortable",
);
document.documentElement.dataset.motion = readSetting("motion", true)
  ? "on"
  : "off";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <App />
      </AppProvider>
    </QueryClientProvider>
  </StrictMode>,
);
