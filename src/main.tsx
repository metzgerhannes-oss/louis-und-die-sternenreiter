import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { resetGameStateForRelease } from "./services/releaseReset";
import "./app/app.css";

resetGameStateForRelease(import.meta.env.VITE_RELEASE_ID);

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
