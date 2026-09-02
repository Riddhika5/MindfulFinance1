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

import "dotenv/config";import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { getFeed, listSources } from "./feedSources.js";
import { addSubmission, getAggregate, addSurvey, getSurveyAggregate } from "./store.js";
import { addResponse, deleteResponse, getResponseAggregate, exportCsv, exportFeedCsv, readAllResponses } from "./responses.js";
import { countCells, quotaDecision, quotaReport } from "./quotas.js";
import { exportXlsxBuffer } from "./excel.js";
import { readEthicsConfig, readiness } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({
  origin: [
    "https://mindfulfinance1-3.onrender.com",
    "http://localhost:5173"
  ]
}));
const PORT = process.env.PORT || 4000;

// Item-level payloads are larger than the 100kb express default.
app.use(express.json({ limit: "2mb" }));

app.get("/api/config", (req, res) => {
  res.json({
    ethics: readEthicsConfig()
  });
});

// Simple health check — open http://localhost:4000/api/health to test.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Server is running 🎉" });
});

// Research-governance configuration, read at runtime from the environment so
// it can be set in the hosting dashboard without a rebuild.
app.get("/api/config", (_req, res) => {
  res.json({ ethics: readEthicsConfig() });
});

// Deployment readiness — what is still missing before live collection.
// Safe to expose: it reports which variables are unset, never their values.
app.get("/api/readiness", (_req, res) => {
  res.json(readiness());
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

// ===========================================================================
// RESEARCH ENDPOINTS (instrument version 2.0 — validated scales)
// ===========================================================================

// ---------------------------------------------------------------------------
// Quota control
// ---------------------------------------------------------------------------
// Checked BEFORE the questionnaire, so nobody completes fifteen minutes of it
// only to be told their cell was already full.
app.post("/api/quota-check", async (req, res) => {
  try {
    const { gender, age, location } = req.body || {};
    const counted = countCells(await readAllResponses());
    res.json(quotaDecision({ gender, age, location }, counted));
  } catch (err) {
    // Never block a participant because the quota service failed. A quota is a
    // sampling convenience; refusing a willing volunteer over a server error
    // is a worse outcome than a slightly over-filled cell.
    res.json({ allowed: true, full: [], degraded: true, error: err.message });
  }
});

// Researcher-facing recruitment progress. Protected: cell counts reveal how
// the sample is composed and are not for participants.
app.get("/api/quota-report", async (req, res) => {
  const key = process.env.RESEARCHER_KEY;
  if (!key) return res.status(503).json({ error: "RESEARCHER_KEY is not set." });
  if (req.query.key !== key) return res.status(403).json({ error: "Forbidden" });
  try {
    res.json(quotaReport(await readAllResponses()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save one completed assessment (item-level answers + derived scores).
app.post("/api/response", async (req, res) => {
  try {
    const body = req.body || {};
    const a = body?.raw?.answers || {};

    // Second quota check. Two participants can clear the pre-questionnaire
    // check concurrently, so the cell can fill while someone is answering.
    // The response is still STORED — discarding a completed questionnaire
    // would waste a volunteer's fifteen minutes — but it is marked as
    // over-quota so it can be excluded from the primary analysis sample.
    let overQuota = null;
    try {
      const counted = countCells(await readAllResponses());
      const decision = quotaDecision(
        { gender: a.gender, age: a.elig_age, location: a.city },
        counted
      );
      if (!decision.allowed) overQuota = decision.full.map((f) => f.dimension);
    } catch { /* quota service unavailable — store the response regardless */ }

    const saved = await addResponse({ ...body, overQuota });
    res.json({ ok: true, participantId: saved.participantId, wave: saved.wave, overQuota });
    } catch (err) {
    console.error("[POST /api/response] Save failed:", err);
    res.status(500).json({
      ok: false,
      error: err?.message || "Unable to save research response."
    });
  }
});

// Participant-initiated withdrawal. Unauthenticated by design — see the note on
// deleteResponse. Withdrawal must never be harder than taking part.
app.delete("/api/response/:participantId", async (req, res) => {
  try {
    res.json(await deleteResponse(req.params.participantId));
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
});

// Coarse, non-identifying aggregate for the public community view.
app.get("/api/response-aggregate", async (_req, res) => {
  try {
    res.json(await getResponseAggregate());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Researcher-only dataset export. Requires RESEARCHER_KEY to be set in the
// environment; without it the endpoints are disabled entirely rather than
// falling open.
// ---------------------------------------------------------------------------
function researcherOnly(req, res) {
  const key = process.env.RESEARCHER_KEY;
  if (!key) {
    res.status(503).json({ error: "Export disabled: RESEARCHER_KEY is not configured." });
    return false;
  }
  const given = req.get("x-researcher-key") || req.query.key;
  if (given !== key) {
    res.status(401).json({ error: "Unauthorised." });
    return false;
  }
  return true;
}

// The main research export: a multi-sheet SPSS-ready workbook.
app.get("/api/export/data.xlsx", async (req, res) => {
  if (!researcherOnly(req, res)) return;
  try {
    const buf = await exportXlsxBuffer();
    const stamp = new Date().toISOString().slice(0, 10);
    res
      .type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
      .attachment(`mindfulfinance-data-${stamp}.xlsx`)
      .send(Buffer.from(buf));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/export/wide.csv", async (req, res) => {
  if (!researcherOnly(req, res)) return;
  try {
    res.type("text/csv").attachment("mindfulfinance-wide.csv").send(await exportCsv());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/export/feed.csv", async (req, res) => {
  if (!researcherOnly(req, res)) return;
  try {
    res.type("text/csv").attachment("mindfulfinance-feed-trials.csv").send(await exportFeedCsv());
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

app.listen(PORT,"0.0.0.0", () => {
  console.log(`\n✅ Backend server running at http://localhost:${PORT}`);
  console.log(`   Try: http://localhost:${PORT}/api/health\n`);
});
