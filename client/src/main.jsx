import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { loadRuntimeEthics } from "./lib/ethics.js";
import "./styles.css";

// Pull governance details from the server before the first render, so the
// pilot-mode banner and the consent contact block are correct on the very
// first paint rather than flickering.
loadRuntimeEthics().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
