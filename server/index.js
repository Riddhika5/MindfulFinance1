// ===========================================================================
// index.js  —  the small Express backend
// ---------------------------------------------------------------------------
// Why do we even need a server?
//   The browser cannot call sites like Reddit directly because of CORS (a
//   browser security rule) and because real APIs need secret keys that must
//   not live in front-end code. So the React app talks to THIS server at
//   /api/..., and this server talks to the outside world. It also stores the
//   shared "community results" and (in production) serves the built web app.
// ===========================================================================

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getFeed, listSources } from "./feedSources.js";
import { addSubmission, getAggregate, addSurvey, getSurveyAggregate } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Simple health check — open http://localhost:4000/api/health to test.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Server is running 🎉" });
});

// List the available feed sources (used by the UI dropdown).
app.get("/api/sources", (_req, res) => {
  res.json({ sources: listSources() });
});

// The main feed endpoint.
//   GET /api/feed?source=reddit      -> live Reddit posts (falls back if it fails)
//   GET /api/feed?source=simulated   -> simulated reels
app.get("/api/feed", async (req, res) => {
  const source = req.query.source || "simulated";
  try {
    const result = await getFeed(source);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a person's results snapshot to the shared store.
app.post("/api/submit", async (req, res) => {
  try {
    const saved = await addSubmission(req.body || {});
    res.json({ ok: true, id: saved.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Community-wide analysis across everyone who submitted.
app.get("/api/results", async (_req, res) => {
  try {
    res.json(await getAggregate());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a survey response, and read the survey-wide analysis.
app.post("/api/survey", async (req, res) => {
  try {
    const saved = await addSurvey(req.body || {});
    res.json({ ok: true, id: saved.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});
app.get("/api/survey-results", async (_req, res) => {
  try {
    res.json(await getSurveyAggregate());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// In production, also serve the built React app from the same server, so the
// whole thing can be deployed as ONE service. (In development you use Vite.)
// ---------------------------------------------------------------------------
const clientDist = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Send index.html for any non-API route (so the single-page app can route).
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
  console.log("[server] serving built client from /client/dist");
}

app.listen(PORT, () => {
  console.log(`\n✅ Backend server running at http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health\n`);
});
