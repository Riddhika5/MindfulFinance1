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

/** Thrown when the datastore is unreachable — distinct from a bad payload. */
export class StorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "StorageError";
    this.cause = cause;
  }
}

let _dbPromise = null;

/**
 * Connect lazily, and — critically — DO NOT CACHE A REJECTED PROMISE.
 *
 * The previous version assigned the promise before it settled, so a single
 * failed connection (a cold start racing DNS, a brief Atlas blip, an IP not
 * yet allowlisted) poisoned the cache: every later request awaited the same
 * rejected promise and failed identically until the service was redeployed.
 * That turns a transient two-second outage into a dead study, and the only
 * symptom a participant sees is an error on the submit button.
 *
 * serverSelectionTimeoutMS is set low deliberately. The default is 30s, which
 * means a participant sits on a spinner for half a minute before being told
 * something went wrong; 8s fails fast enough to retry within one page view.
 */
async function getDb() {
  if (_dbPromise) return _dbPromise;
  const attempt = (async () => {
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      retryWrites: true,
    });
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "mindfulmoney");
    // connect() can resolve before the server is actually reachable, so ping.
    await db.command({ ping: 1 });
    return db;
  })();
  _dbPromise = attempt;
  try {
    return await attempt;
  } catch (err) {
    _dbPromise = null; // let the next request try again
    throw new StorageError(
      `Could not reach MongoDB: ${err?.message || err}. Check MONGODB_URI, the database user's password, and that Network Access allows 0.0.0.0/0.`,
      err
    );
  }
}

/** Is the datastore actually reachable? Used by /api/readiness. */
export async function checkStorage() {
  if (!USE_DB) {
    return {
      mode: "ephemeral-file",
      ok: true,
      warning:
        "MONGODB_URI is not set. Responses are written to the container filesystem, which Render wipes on every redeploy, restart and free-tier sleep. Data WILL be lost.",
    };
  }
  try {
    await getDb();
    return { mode: "mongodb", ok: true, warning: null };
  } catch (err) {
    return {
      mode: "mongodb",
      ok: false,
      warning: `MONGODB_URI is set but the database is UNREACHABLE. ${err.message} Responses are being written to the container filesystem as a fallback and will be lost on the next restart.`,
    };
  }
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

/**
 * Every stored response. When Mongo is in use, the local file is ALSO read and
 * merged: anything written there is a fallback from a period when the database
 * was unreachable, and silently omitting it from the export would lose exactly
 * the responses that were hardest to collect. Duplicates are resolved in favour
 * of the database copy.
 */
export async function readAllResponses() {
  if (!USE_DB) return readLocal();

  let fromDb = [];
  try {
    const db = await getDb();
    fromDb = await db.collection("responses").find({}, { projection: { _id: 0 } }).toArray();
  } catch (err) {
    console.error("[responses] MongoDB read failed, serving file copy only:", err.message);
    return readLocal();
  }

  const fallback = readLocal();
  if (!fallback.length) return fromDb;

  const key = (r) => `${r.participantId}|${r.wave}`;
  const seen = new Set(fromDb.map(key));
  return fromDb.concat(fallback.filter((r) => !seen.has(key(r))));
}

export async function addResponse({ raw, scored, overQuota = null }) {
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
      smi: scored.smfi?.score ?? null,
      smiPerception: scored.smfi?.subscales?.perception?.score ?? null,
      smiParasocial: scored.smfi?.subscales?.parasocial?.score ?? null,
      smiTrust: scored.smfi?.subscales?.trust?.score ?? null,
      smiAdoption: scored.smfi?.subscales?.adoption?.score ?? null,
      // Legacy key kept so older exports and saved waves still line up.
      smfi: scored.smfi?.score ?? null,
      biasIndex: scored.biases?.index ?? null,
      biasCognitive: scored.biases?.cognitive ?? null,
      biasEmotional: scored.biases?.emotional ?? null,
      biases: Object.fromEntries(
        Object.entries(scored.biases?.constructs || {}).map(([k, v]) => [k, v.raw])
      ),
      maas: scored.maas?.score ?? null,
      finMindfulness: scored.finMindfulness?.score ?? null,
      finMindfulnessAwareness: scored.finMindfulness?.subscales?.awareness ?? null,
      finMindfulnessAcceptance: scored.finMindfulness?.subscales?.acceptance ?? null,
      stateMindfulness: scored.stateMindfulness?.score ?? null,
      impulsiveness: scored.impulsiveness?.score ?? null,
      selfControl: scored.selfControl?.score ?? null,
      meditator: scored.meditation?.isMeditator ?? null,
      meditatesNow: scored.meditation?.currentlyPractising ?? null,
      cfpbRaw: scored.cfpb?.raw ?? null,
      cfpbStandardised: scored.cfpb?.standardised ?? null,
      cfpbProvisional: scored.cfpb?.provisional ?? null,
      wellbeingGap: scored.wellbeingConvergence?.gap ?? null,
      // Netemeyer form (the default). Reverse coding is already applied, so a
      // high value means better well-being — same direction as the CFPB score.
      fwb: scored.fwb?.score ?? null,
      fwbStress: scored.fwb?.subscales?.stress ?? null,
      fwbSecurity: scored.fwb?.subscales?.security ?? null,
      fwbPomp: scored.fwb?.pomp ?? null,
      wellbeingInstrument: scored.wellbeingInstrument ?? null,
      literacyCorrect: scored.literacy?.correct ?? null,
      literacySkipped: scored.literacy?.skipped ?? null,
      knowledgeGap: scored.knowledgeCalibration?.gap ?? null,
      knowledgeSubjective: scored.knowledgeCalibration?.subjective ?? null,
      literacyDK: scored.literacy?.dkCount ?? null,
      feedActionRate: scored.feed?.actionRate ?? null,
      feedVerificationRate: scored.feed?.verificationRate ?? null,
    },

    // --- data-quality flags for transparent exclusion ----------------------
    quality: scored.quality || {},

    // --- quota control -----------------------------------------------------
    // null = within quota. An array of dimension names = the cell filled while
    // this participant was answering. Kept rather than discarded, and excluded
    // from the primary analysis sample at the cleaning stage.
    overQuota: Array.isArray(overQuota) ? overQuota : null,

    // --- provenance --------------------------------------------------------
    instrumentVersion: "3.0-agreement-metric",
  };

  // -------------------------------------------------------------------------
  // Write it. A participant has just spent ten minutes on this, so a storage
  // problem must never be the reason their answers disappear.
  //
  // If Mongo is configured but unreachable, the response is written to the
  // container filesystem instead and flagged `storageFallback`. That file is
  // volatile — Render wipes it on restart — so this is a stay of execution,
  // not a solution, and both the API response and /api/readiness say so
  // loudly. But a file that might survive the next hour beats a 400 and a
  // participant who has already closed the tab.
  // -------------------------------------------------------------------------
  if (USE_DB) {
    try {
      const db = await getDb();
      // Upsert on participantId + wave so a double-submit does not duplicate.
      await db
        .collection("responses")
        .updateOne(
          { participantId: record.participantId, wave: record.wave },
          { $set: record },
          { upsert: true }
        );
      return { ...record, storedIn: "mongodb" };
    } catch (err) {
      const reason = err instanceof StorageError ? err.message : String(err?.message || err);
      console.error("[responses] MongoDB write FAILED, falling back to file:", reason);
      writeLocal({ ...record, storageFallback: true, storageError: reason });
      return { ...record, storedIn: "file-fallback", storageWarning: reason };
    }
  }

  writeLocal(record);
  return { ...record, storedIn: "file" };
}

/** Upsert one record into the local JSON file, keyed on participant + wave. */
function writeLocal(record) {
  const list = readLocal();
  const i = list.findIndex(
    (r) => r.participantId === record.participantId && r.wave === record.wave
  );
  if (i >= 0) list[i] = record;
  else list.push(record);
  ensure();
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
