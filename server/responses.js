// ===========================================================================
// responses.js — research response store
// ---------------------------------------------------------------------------
// Stores the FULL item-level response alongside the derived scores, so the
// dataset can be re-scored if any scoring rule is later corrected. Also
// exports a flat CSV / long-format CSV for SPSS, R, JASP or SmartPLS.
// ===========================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const FILE = path.join(DATA_DIR, "responses.json");
const USE_DB = !!process.env.MONGODB_URI;

let _dbPromise = null;
async function getDb() {
  if (!_dbPromise) {
    _dbPromise = (async () => {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      return client.db(process.env.MONGODB_DB || "mindfulmoney");
    })();
  }
  return _dbPromise;
}

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "[]", "utf8");
}

function readLocal() {
  ensure();
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8").replace(/^﻿/, "")) || [];
  } catch {
    return [];
  }
}

export async function readAllResponses() {
  if (USE_DB) {
    const db = await getDb();
    return db.collection("responses").find({}, { projection: { _id: 0 } }).toArray();
  }
  return readLocal();
}

export async function addResponse({ raw, scored }) {
  if (!raw || !scored) throw new Error("raw and scored payloads are both required");

  const record = {
    // --- identifiers -------------------------------------------------------
    participantId: String(raw.participantId || "").slice(0, 40),
    wave: Number(raw.wave) || 1,
    arm: raw.arm || null,
    startedAt: raw.startedAt || null,
    submittedAt: new Date().toISOString(),
    durationMs: scored.durationMs ?? null,

    // --- FULL item-level responses (the thing that actually matters) -------
    answers: raw.answers || {},
    feedTrials: Array.isArray(raw.feedTrials) ? raw.feedTrials : [],
    lossTask: raw.lossTask || null,
    anchorTask: raw.anchorTask || null,
    // Item order as actually presented, so order effects can be checked.
    presentedOrder: raw.presentedOrder || null,

    // --- derived scores (convenience; always re-derivable from answers) ----
    scores: {
      smfi: scored.smfi?.score ?? null,
      smfiEngagement: scored.smfi?.subscales?.engagement?.score ?? null,
      smfiCredibility: scored.smfi?.subscales?.credibility?.score ?? null,
      smfiAdoption: scored.smfi?.subscales?.adoption?.score ?? null,
      biasIndex: scored.biases?.index ?? null,
      biasCognitive: scored.biases?.cognitive ?? null,
      biasEmotional: scored.biases?.emotional ?? null,
      biases: Object.fromEntries(
        Object.entries(scored.biases?.constructs || {}).map(([k, v]) => [k, v.raw])
      ),
      maas: scored.maas?.score ?? null,
      cfpbRaw: scored.cfpb?.raw ?? null,
      cfpbStandardised: scored.cfpb?.standardised ?? null,
      literacyCorrect: scored.literacy?.correct ?? null,
      knowledgeGap: scored.knowledgeCalibration?.gap ?? null,
      knowledgeSubjective: scored.knowledgeCalibration?.subjective ?? null,
      literacyDK: scored.literacy?.dkCount ?? null,
      feedActionRate: scored.feed?.actionRate ?? null,
      feedVerificationRate: scored.feed?.verificationRate ?? null,
    },

    // --- data-quality flags for transparent exclusion ----------------------
    quality: scored.quality || {},

    // --- provenance --------------------------------------------------------
    instrumentVersion: "2.0-validated",
  };

  if (USE_DB) {
    const db = await getDb();
    // Upsert on participantId + wave so a double-submit does not duplicate.
    await db
      .collection("responses")
      .updateOne(
        { participantId: record.participantId, wave: record.wave },
        { $set: record },
        { upsert: true }
      );
    return record;
  }

  const list = readLocal();
  const i = list.findIndex((r) => r.participantId === record.participantId && r.wave === record.wave);
  if (i >= 0) list[i] = record;
  else list.push(record);
  fs.writeFileSync(FILE, JSON.stringify(list, null, 2), "utf8");
  return record;
}

/**
 * Delete every wave belonging to a participant code.
 * Participants have an unconditional right to withdraw, so this is deliberately
 * unauthenticated — the participant code is the only thing needed, and it is
 * the only identifier they hold. The code is high-entropy and is not published
 * anywhere, so guessing another participant's code is impractical; weigh that
 * against making withdrawal harder than participating, which would be worse.
 */
export async function deleteResponse(participantId) {
  const id = String(participantId || "").trim();
  if (!id) throw new Error("participantId is required");

  if (USE_DB) {
    const db = await getDb();
    const res = await db.collection("responses").deleteMany({ participantId: id });
    return { deleted: res.deletedCount > 0, count: res.deletedCount };
  }
  const list = readLocal();
  const remaining = list.filter((r) => r.participantId !== id);
  const count = list.length - remaining.length;
  if (count > 0) fs.writeFileSync(FILE, JSON.stringify(remaining, null, 2), "utf8");
  return { deleted: count > 0, count };
}

// ---------------------------------------------------------------------------
// Aggregate for the public "community" view. Deliberately coarse — nothing
// here can identify an individual participant.
// ---------------------------------------------------------------------------
const mean = (vals) => {
  const v = vals.filter((x) => x !== null && x !== undefined && !Number.isNaN(x));
  return v.length ? Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : null;
};

export async function getResponseAggregate() {
  const list = await readAllResponses();
  const usable = list.filter((r) => !r.quality?.flagStraightlining && !r.quality?.flagTooFast);
  const n = usable.length;
  if (n < 5) return { count: list.length, usable: n, suppressed: true, note: "Aggregates are shown once at least 5 usable responses exist." };

  const biasKeys = Object.keys(usable[0]?.scores?.biases || {});
  const biasRanking = biasKeys
    .map((k) => ({ name: k, avg: mean(usable.map((r) => r.scores.biases[k])) }))
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  const byArm = {};
  for (const r of usable) {
    const a = r.arm || "unknown";
    (byArm[a] = byArm[a] || []).push(r);
  }
  const armEffects = Object.entries(byArm).map(([arm, rows]) => ({
    arm,
    n: rows.length,
    actionRate: mean(rows.map((r) => r.scores.feedActionRate)),
    verificationRate: mean(rows.map((r) => r.scores.feedVerificationRate)),
  }));

  return {
    count: list.length,
    usable: n,
    biasRanking,
    avgSMFI: mean(usable.map((r) => r.scores.smfi)),
    avgMAAS: mean(usable.map((r) => r.scores.maas)),
    avgCFPB: mean(usable.map((r) => r.scores.cfpbRaw)),
    avgLiteracy: mean(usable.map((r) => r.scores.literacyCorrect)),
    armEffects,
  };
}

// ---------------------------------------------------------------------------
// CSV export — wide format, one row per participant-wave, one column per item.
// Protected by RESEARCHER_KEY so the raw dataset is not publicly downloadable.
// ---------------------------------------------------------------------------
function csvEscape(v) {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join("|") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function exportCsv() {
  const list = await readAllResponses();
  if (!list.length) return "";

  const itemKeys = new Set();
  const scoreKeys = new Set();
  for (const r of list) {
    Object.keys(r.answers || {}).forEach((k) => itemKeys.add(k));
    Object.keys(r.scores || {}).forEach((k) => {
      if (k !== "biases") scoreKeys.add(k);
    });
    Object.keys(r.scores?.biases || {}).forEach((k) => scoreKeys.add("bias_" + k));
  }

  const meta = ["participantId", "wave", "arm", "startedAt", "submittedAt", "durationMs",
    "q_itemsAnswered", "q_longestIdenticalRun", "q_responseSD", "q_secondsPerItem",
    "q_flagStraightlining", "q_flagTooFast", "q_flagLowVariance",
    "feed_actionRate", "feed_verificationRate", "instrumentVersion"];

  const header = [...meta, ...[...scoreKeys].sort(), ...[...itemKeys].sort()];
  const rows = [header.join(",")];

  for (const r of list) {
    const row = header.map((h) => {
      if (h.startsWith("q_")) return csvEscape(r.quality?.[h.slice(2)]);
      if (h.startsWith("feed_")) return csvEscape(r.scores?.[h === "feed_actionRate" ? "feedActionRate" : "feedVerificationRate"]);
      if (h.startsWith("bias_")) return csvEscape(r.scores?.biases?.[h.slice(5)]);
      if (meta.includes(h)) return csvEscape(r[h]);
      if (scoreKeys.has(h)) return csvEscape(r.scores?.[h]);
      return csvEscape(r.answers?.[h]);
    });
    rows.push(row.join(","));
  }
  return rows.join("\n");
}

/** Long format — one row per feed trial. For the experimental analysis. */
export async function exportFeedCsv() {
  const list = await readAllResponses();
  const header = ["participantId", "wave", "arm", "order", "postId", "targetBias", "tag",
    "socialProof", "likes", "decision", "reason", "reasonMaps", "openedVerify", "dwellMs"];
  const rows = [header.join(",")];
  for (const r of list) {
    for (const t of r.feedTrials || []) {
      rows.push(header.map((h) => csvEscape(
        h === "participantId" ? r.participantId : h === "wave" ? r.wave : t[h]
      )).join(","));
    }
  }
  return rows.join("\n");
}
