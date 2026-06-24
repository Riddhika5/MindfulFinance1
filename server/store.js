// ===========================================================================
// store.js  —  saves submissions + survey responses, then computes analysis
// ---------------------------------------------------------------------------
// It works with TWO storage backends, chosen automatically:
//   • If the environment variable MONGODB_URI is set  -> MongoDB Atlas
//       (a real cloud database; data is permanent — use this for the public
//        site so responses are never lost).
//   • Otherwise                                        -> a local JSON file
//       (perfect for running on your own PC / WiFi; zero setup).
//
// The rest of the app calls the same four functions either way:
//   addSubmission / getAggregate   (app "share my results")
//   addSurvey      / getSurveyAggregate   (the research survey)
// All four are async so they work the same for files and the database.
// ===========================================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const FILES = {
  submissions: path.join(DATA_DIR, "submissions.json"),
  surveys: path.join(DATA_DIR, "surveys.json"),
};

const USE_DB = !!process.env.MONGODB_URI;
console.log("MONGODB_URI exists?", !!process.env.MONGODB_URI);
console.log("DB Name:", process.env.MONGODB_DB);

// ---------------------------------------------------------------------------
// MongoDB connection (only used when MONGODB_URI is set). We connect once and
// reuse the connection. The driver is loaded lazily so file-mode needs nothing.
// ---------------------------------------------------------------------------
let _dbPromise = null;
async function getDb() {
  if (!_dbPromise) {
    _dbPromise = (async () => {
      const { MongoClient } = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      console.log("[store] connected to MongoDB ✅");
      return client.db(process.env.MONGODB_DB || "mindfulmoney");
    })();
  }
  return _dbPromise;
}

// ---------------------------------------------------------------------------
// Low-level read/write that hides which backend we're using.
// ---------------------------------------------------------------------------
function ensureFile(file) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8");
}

// Read a JSON-array file, tolerating a leading UTF-8 BOM (which some editors
// add and which would otherwise crash JSON.parse).
function readFileArray(file) {
  ensureFile(file);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, "")) || [];
  } catch {
    return [];
  }
}

async function readAll(name) {
  if (USE_DB) {
    const db = await getDb();
    // hide Mongo's internal _id so the rest of the code sees clean records
    return db.collection(name).find({}, { projection: { _id: 0 } }).toArray();
  }
  return readFileArray(FILES[name]);
}

async function insertOne(name, record) {
  if (USE_DB) {
    const db = await getDb();
    await db.collection(name).insertOne({ ...record });
    return record;
  }
  const file = FILES[name];
  const list = readFileArray(file);
  list.push(record);
  fs.writeFileSync(file, JSON.stringify(list, null, 2), "utf8");
  return record;
}

// Small shared helper.
const mean = (vals) => {
  const v = vals.filter((x) => x != null);
  return v.length ? Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)) : null;
};

// ===========================================================================
// App "Share my results" submissions
// ===========================================================================
export async function addSubmission(snapshot) {
  const record = {
    id: "sub-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    submittedAt: new Date().toISOString(),
    nickname: (snapshot.nickname || "Anonymous").slice(0, 40),
    score: Number(snapshot.score) || 0,
    band: snapshot.band || "",
    biasNames: Array.isArray(snapshot.biasNames) ? snapshot.biasNames : [],
    expenseCount: Number(snapshot.expenseCount) || 0,
    totalSpent: Number(snapshot.totalSpent) || 0,
    help: snapshot.help || { nudge: { up: 0, down: 0 }, choice: { up: 0, down: 0 }, mindful: { up: 0, down: 0 } },
  };
  return insertOne("submissions", record);
}

export async function getAllSubmissions() {
  return readAll("submissions");
}

export async function getAggregate() {
  const list = await readAll("submissions");
  const count = list.length;
  if (count === 0) return { count: 0 };

  const avgScore = Math.round(list.reduce((s, r) => s + (r.score || 0), 0) / count);

  const biasCounts = {};
  for (const r of list) {
    for (const name of r.biasNames || []) {
      biasCounts[name] = (biasCounts[name] || 0) + 1;
    }
  }
  const biasRanking = Object.entries(biasCounts)
    .map(([name, c]) => ({ name, count: c, pct: Math.round((c / count) * 100) }))
    .sort((a, b) => b.count - a.count);

  const types = ["nudge", "choice", "mindful"];
  const help = {};
  for (const t of types) {
    let up = 0;
    let down = 0;
    for (const r of list) {
      up += r.help?.[t]?.up || 0;
      down += r.help?.[t]?.down || 0;
    }
    const total = up + down;
    help[t] = { up, down, total, helpfulPct: total ? Math.round((up / total) * 100) : null };
  }

  const recent = list
    .slice(-8)
    .reverse()
    .map((r) => ({ nickname: r.nickname, score: r.score, submittedAt: r.submittedAt }));

  return { count, avgScore, biasRanking, help, recent };
}

// ===========================================================================
// SURVEY responses (the research questionnaire)
// ===========================================================================
export async function addSurvey(summary) {
  const record = {
    id: "srv-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    submittedAt: new Date().toISOString(),
    age: summary.age || "",
    sm_time: summary.sm_time || "",
    bias: summary.bias || {},
    biasAvg: Number(summary.biasAvg) || null,
    influence: Number(summary.influence) || null,
    wellbeing: Number(summary.wellbeing) || null,
    mindfulness: Number(summary.mindfulness) || null,
    literacyPct: summary.literacyPct == null ? null : Number(summary.literacyPct),
    literacyCorrect: Number(summary.literacyCorrect) || 0,
    literacyTotal: Number(summary.literacyTotal) || 0,
  };
  return insertOne("surveys", record);
}

export async function getSurveyAggregate() {
  const list = await readAll("surveys");
  const count = list.length;
  if (count === 0) return { count: 0 };

  // average each bias across everyone -> "which bias affects people more"
  const biasTotals = {};
  for (const r of list) {
    for (const [name, val] of Object.entries(r.bias || {})) {
      (biasTotals[name] = biasTotals[name] || []).push(val);
    }
  }
  const biasRanking = Object.entries(biasTotals)
    .map(([name, vals]) => ({ name, avg: mean(vals), n: vals.length }))
    .sort((a, b) => b.avg - a.avg);

  const avgInfluence = mean(list.map((r) => r.influence));
  const avgWellbeing = mean(list.map((r) => r.wellbeing));
  const avgMindfulness = mean(list.map((r) => r.mindfulness));
  const avgLiteracy = mean(list.map((r) => r.literacyPct));

  // Helper: split into "high" vs "low" on a field and compare average bias.
  const splitInsight = (field, threshold) => {
    const both = list.filter((r) => r[field] != null && r.biasAvg != null);
    const high = both.filter((r) => r[field] >= threshold);
    const low = both.filter((r) => r[field] < threshold);
    return {
      highCount: high.length,
      lowCount: low.length,
      highBiasAvg: mean(high.map((r) => r.biasAvg)),
      lowBiasAvg: mean(low.map((r) => r.biasAvg)),
    };
  };

  // KEY INSIGHTS: do more-mindful / more-literate people show fewer biases?
  const mindfulnessInsight = splitInsight("mindfulness", 3.5);
  const literacyInsight = splitInsight("literacyPct", 67); // >= ~2 of 3 correct

  return {
    count,
    biasRanking,
    avgInfluence,
    avgWellbeing,
    avgMindfulness,
    avgLiteracy,
    mindfulnessInsight,
    literacyInsight,
  };
}
