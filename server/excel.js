// ===========================================================================
// excel.js — SPSS-ready Excel export
// ---------------------------------------------------------------------------
// Produces a multi-sheet workbook:
//
//   Data          one row per participant-wave, one column per item + scores
//   Codebook      every variable: label, construct, scale, range, source
//   ValueLabels   numeric code -> label, for SPSS "Define Variable Properties"
//   Scores        derived construct scores only, for a quick look
//   FeedTrials    long format, one row per feed trial (for multilevel models)
//   Meta          instrument version, export timestamp, N, exclusion counts
//
// Variable names are SPSS-safe: ≤ 32 characters, alphanumeric plus underscore,
// never starting with a digit. Numeric responses stay numeric so SPSS reads
// them as scale variables rather than strings — the single most common thing
// that goes wrong when moving survey data into SPSS.
// ===========================================================================

import ExcelJS from "exceljs";
import { readAllResponses } from "./responses.js";
import {
  SOURCES, SM_USE, SMFI, BIAS_CONSTRUCTS, ALL_BIAS_IDS, MAAS, CFPB, LITERACY, SCALES,
} from "../client/src/lib/instruments.js";
import { PROFILE, ELIGIBILITY } from "../client/src/lib/flow.js";

const HEAD = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
const HEAD_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } };

/** SPSS-safe variable name: alphanumeric + underscore, ≤32 chars, not digit-initial. */
export function spssName(raw) {
  let n = String(raw).replace(/[^A-Za-z0-9_]/g, "_");
  if (/^[0-9]/.test(n)) n = "v" + n;
  return n.slice(0, 32);
}

function styleHeader(sheet) {
  const row = sheet.getRow(1);
  row.font = HEAD;
  row.fill = HEAD_FILL;
  row.alignment = { vertical: "middle", wrapText: true };
  row.height = 30;
  sheet.views = [{ state: "frozen", ySplit: 1 }];
}

function autoWidth(sheet, min = 10, max = 60) {
  sheet.columns.forEach((col) => {
    let w = min;
    col.eachCell({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? "").length;
      if (len > w) w = len;
    });
    col.width = Math.min(max, w + 2);
  });
}

// ---------------------------------------------------------------------------
// Variable definitions — the single source of truth for both Data and Codebook
// ---------------------------------------------------------------------------
function buildVariables() {
  const vars = [];
  const add = (v) => vars.push(v);

  add({ name: "ParticipantID", label: "Anonymous participant code", type: "string", construct: "ID", source: "" });
  add({ name: "Wave", label: "Assessment wave (1 = baseline)", type: "number", construct: "ID", range: "1+", source: "" });
  add({ name: "Arm", label: "Randomised feed condition", type: "string", construct: "Design",
        values: "control / disclosure / prebunk / mindfulPause", source: "OSC (2024)" });
  add({ name: "StartedAt", label: "Assessment start (ISO 8601)", type: "string", construct: "Paradata" });
  add({ name: "SubmittedAt", label: "Submission timestamp (ISO 8601)", type: "string", construct: "Paradata" });
  add({ name: "DurationMin", label: "Completion time in minutes", type: "number", construct: "Paradata" });

  // eligibility + profile
  for (const it of ELIGIBILITY.items) {
    add({ name: spssName(it.id), label: it.q, type: "string", construct: "Eligibility",
          values: it.options.join(" / ") });
  }
  for (const it of PROFILE.items) {
    add({ name: spssName(it.id), label: it.q, type: "string", construct: "Demographics",
          values: it.options.join(" / ") });
  }
  for (const it of SM_USE.items) {
    add({ name: spssName(it.id), label: it.q, type: "string", construct: "Social media use",
          values: it.options.join(" / "), source: SOURCES[it.src]?.citation || "" });
  }

  // SMFI items
  SMFI.items.forEach((it, n) => {
    add({ name: `SMFI${n + 1}`, itemId: it.id, label: it.q, type: "number",
          construct: "Social Media Financial Influence", subscale: it.sub,
          range: "1–5", values: SCALES.agree5.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
          source: SOURCES[it.src]?.citation || "" });
  });

  // bias items
  for (const key of ALL_BIAS_IDS) {
    const c = BIAS_CONSTRUCTS[key];
    const sc = SCALES[c.scale];
    c.items.forEach((it, n) => {
      add({ name: `${c.code}${n + 1}`, itemId: it.id, label: it.q, type: "number",
            construct: c.name, range: `1–${sc.points}`,
            values: sc.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
            source: [SOURCES[c.src]?.citation, SOURCES[c.src2]?.citation].filter(Boolean).join(" | ") });
    });
  }

  // MAAS
  MAAS.items.forEach((it, n) => {
    add({ name: `MAAS${n + 1}`, itemId: it.id, label: it.q, type: "number",
          construct: "Mindfulness (MAAS-15)", range: "1–6",
          values: SCALES.maas6.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
          note: "DO NOT reverse-code — the anchoring already inverts these items",
          source: SOURCES.brownRyan2003.citation });
  });

  // CFPB — stored as the scored response VALUE, not the option index
  CFPB.items.forEach((it, n) => {
    add({ name: `FWB${n + 1}`, itemId: it.id, label: it.q, type: "number",
          construct: "Financial well-being (CFPB-10)", range: "0–4",
          values: SCALES[it.scale].labels.map((l, i) => `${SCALES[it.scale].values[i]}=${l}`).join("; "),
          note: "Already converted to CFPB scored values (not the option index)",
          source: SOURCES.cfpb2015.citation });
  });

  // literacy — three columns per item
  LITERACY.items.forEach((it, n) => {
    add({ name: `LIT${n + 1}`, itemId: it.id, label: `${it.concept} — response`, type: "string",
          construct: "Financial literacy", values: it.options.join(" / "),
          source: SOURCES.lusardiMitchell2014.citation });
    add({ name: `LIT${n + 1}_correct`, itemId: it.id, label: `${it.concept} — correct?`, type: "number",
          construct: "Financial literacy", range: "0–1", values: "0=incorrect; 1=correct" });
    add({ name: `LIT${n + 1}_DK`, itemId: it.id, label: `${it.concept} — answered 'do not know'?`, type: "number",
          construct: "Financial literacy", range: "0–1", values: "0=no; 1=yes",
          note: "DK rates are substantively informative — keep separate from incorrect" });
  });

  // derived scores
  const SCORES = [
    ["SMFI_mean", "Social Media Financial Influence, mean", "1–5"],
    ["SMFI_engage", "SMFI — engagement subscale", "1–5"],
    ["SMFI_credib", "SMFI — credibility subscale", "1–5"],
    ["SMFI_adopt", "SMFI — adoption subscale", "1–5"],
    ...ALL_BIAS_IDS.map((k) => [`${BIAS_CONSTRUCTS[k].code}_mean`, `${BIAS_CONSTRUCTS[k].name}, subscale mean`, "1–5"]),
    ["BiasIndex", "Composite behavioural bias index (POMP)", "0–100"],
    ["BiasCognitive", "Cognitive biases (POMP mean)", "0–100"],
    ["BiasEmotional", "Emotional biases (POMP mean)", "0–100"],
    ["MAAS_mean", "Dispositional mindfulness, mean (no reverse coding)", "1–6"],
    ["CFPB_raw", "CFPB raw total — USE THIS for analysis", "0–40"],
    ["CFPB_std", "CFPB standardised score (blank unless the official IRT table is loaded)", "0–100"],
    ["LIT_correct", "Financial literacy, number correct", "0–5"],
    ["LIT_DKcount", "Number of 'do not know' responses", "0–5"],
    ["KnowGap", "Illusion of knowledge: IOK POMP minus literacy % (positive = overestimates)", "−100–100"],
    ["KnowSubjective", "Subjective knowledge (IOK POMP)", "0–100"],
    ["FeedActionRate", "Proportion of feed posts the participant would act on", "0–1"],
    ["FeedVerifyRate", "Proportion of feed posts where checking was opened", "0–1"],
  ];
  SCORES.forEach(([name, label, range]) =>
    add({ name, label, type: "number", construct: "DERIVED SCORE", range }));

  // data quality
  const QUALITY = [
    ["Q_itemsAnswered", "Likert items answered", "count"],
    ["Q_longestRun", "Longest run of identical consecutive responses", "count"],
    ["Q_responseSD", "Within-participant SD across Likert items", "0+"],
    ["Q_secPerItem", "Seconds per item", "0+"],
    ["Q_flagStraight", "Straightlining flag (run ≥ 12)", "0/1"],
    ["Q_flagFast", "Too-fast flag (< 2 s per item)", "0/1"],
    ["Q_flagLowVar", "Low-variance flag (SD < 0.40)", "0/1"],
    ["Q_excludeAny", "Any quality flag raised", "0/1"],
  ];
  QUALITY.forEach(([name, label, range]) =>
    add({ name, label, type: "number", construct: "DATA QUALITY", range,
          note: "Pre-specified screening; report analyses with and without flagged cases" }));

  return vars;
}

// ---------------------------------------------------------------------------
function valueFor(v, r) {
  const a = r.answers || {};
  const s = r.scores || {};
  const q = r.quality || {};

  switch (v.name) {
    case "ParticipantID": return r.participantId;
    case "Wave": return r.wave ?? 1;
    case "Arm": return r.arm || "";
    case "StartedAt": return r.startedAt || "";
    case "SubmittedAt": return r.submittedAt || "";
    case "DurationMin": return r.durationMs ? Number((r.durationMs / 60000).toFixed(2)) : null;

    case "SMFI_mean": return s.smfi ?? null;
    case "SMFI_engage": return s.smfiEngagement ?? null;
    case "SMFI_credib": return s.smfiCredibility ?? null;
    case "SMFI_adopt": return s.smfiAdoption ?? null;
    case "BiasIndex": return s.biasIndex ?? null;
    case "BiasCognitive": return s.biasCognitive ?? null;
    case "BiasEmotional": return s.biasEmotional ?? null;
    case "MAAS_mean": return s.maas ?? null;
    case "CFPB_raw": return s.cfpbRaw ?? null;
    case "CFPB_std": return s.cfpbStandardised ?? null;
    case "LIT_correct": return s.literacyCorrect ?? null;
    case "LIT_DKcount": return s.literacyDK ?? null;
    case "KnowGap": return s.knowledgeGap ?? null;
    case "KnowSubjective": return s.knowledgeSubjective ?? null;
    case "FeedActionRate": return s.feedActionRate ?? null;
    case "FeedVerifyRate": return s.feedVerificationRate ?? null;

    case "Q_itemsAnswered": return q.itemsAnswered ?? null;
    case "Q_longestRun": return q.longestIdenticalRun ?? null;
    case "Q_responseSD": return q.responseSD ?? null;
    case "Q_secPerItem": return q.secondsPerItem ?? null;
    case "Q_flagStraight": return q.flagStraightlining ? 1 : 0;
    case "Q_flagFast": return q.flagTooFast ? 1 : 0;
    case "Q_flagLowVar": return q.flagLowVariance ? 1 : 0;
    case "Q_excludeAny": return (q.flagStraightlining || q.flagTooFast || q.flagLowVariance) ? 1 : 0;
    default: break;
  }

  // per-construct subscale means
  const biasMean = ALL_BIAS_IDS.find((k) => `${BIAS_CONSTRUCTS[k].code}_mean` === v.name);
  if (biasMean) return s.biases?.[biasMean] ?? null;

  // literacy derived columns
  const litMatch = v.name.match(/^LIT(\d+)_(correct|DK)$/);
  if (litMatch) {
    const item = LITERACY.items[Number(litMatch[1]) - 1];
    const ans = a[item.id];
    if (ans === undefined || ans === null) return null;
    if (litMatch[2] === "correct") return ans === item.correct ? 1 : 0;
    return String(ans).toLowerCase().startsWith("do not know") ? 1 : 0;
  }

  // CFPB — convert the stored option index to the CFPB scored value
  if (/^FWB\d+$/.test(v.name) && v.itemId) {
    const idx = a[v.itemId];
    if (idx === undefined || idx === null || idx === "") return null;
    const item = CFPB.items.find((i) => i.id === v.itemId);
    return SCALES[item.scale].values[Number(idx)] ?? null;
  }

  // plain item responses
  if (v.itemId) {
    const raw = a[v.itemId];
    if (raw === undefined || raw === null || raw === "") return null;
    return v.type === "number" ? Number(raw) : raw;
  }

  const direct = a[v.name];
  if (Array.isArray(direct)) return direct.join(" | ");
  return direct ?? null;
}

// ---------------------------------------------------------------------------
export async function buildWorkbook() {
  const rows = await readAllResponses();
  const vars = buildVariables();
  const wb = new ExcelJS.Workbook();
  wb.creator = "MindfulFinance";
  wb.created = new Date();

  // --- Data ---------------------------------------------------------------
  const data = wb.addWorksheet("Data", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
  data.columns = vars.map((v) => ({ header: v.name, key: v.name, width: 14 }));
  rows.forEach((r) => {
    const rec = {};
    vars.forEach((v) => { rec[v.name] = valueFor(v, r); });
    data.addRow(rec);
  });
  styleHeader(data);

  // --- Codebook -----------------------------------------------------------
  const cb = wb.addWorksheet("Codebook");
  cb.columns = [
    { header: "Variable", key: "name", width: 18 },
    { header: "Label", key: "label", width: 62 },
    { header: "Construct", key: "construct", width: 26 },
    { header: "Subscale", key: "subscale", width: 14 },
    { header: "Type", key: "type", width: 9 },
    { header: "Range", key: "range", width: 11 },
    { header: "Value labels", key: "values", width: 52 },
    { header: "Scoring note", key: "note", width: 48 },
    { header: "Source", key: "source", width: 70 },
  ];
  vars.forEach((v) => cb.addRow({
    name: v.name, label: v.label, construct: v.construct, subscale: v.subscale || "",
    type: v.type, range: v.range || "", values: v.values || "", note: v.note || "", source: v.source || "",
  }));
  styleHeader(cb);
  cb.getColumn("label").alignment = { wrapText: true, vertical: "top" };
  cb.getColumn("values").alignment = { wrapText: true, vertical: "top" };
  cb.getColumn("source").alignment = { wrapText: true, vertical: "top" };

  // --- ValueLabels --------------------------------------------------------
  const vl = wb.addWorksheet("ValueLabels");
  vl.columns = [
    { header: "Scale", key: "scale", width: 18 },
    { header: "Value", key: "value", width: 9 },
    { header: "Label", key: "label", width: 34 },
    { header: "Used by", key: "used", width: 46 },
  ];
  const usedBy = {
    agree5: "All SMFI and behavioural bias items",
    maas6: "MAAS1–MAAS15",
    cfpbDescribes: "FWB1–FWB6",
    cfpbOften: "FWB7–FWB10",
  };
  for (const [key, sc] of Object.entries(SCALES)) {
    if (!usedBy[key]) continue;
    sc.labels.forEach((label, i) => {
      vl.addRow({ scale: key, value: sc.values ? sc.values[i] : i + 1, label, used: usedBy[key] });
    });
  }
  styleHeader(vl);

  // --- Scores -------------------------------------------------------------
  const scoreVars = vars.filter((v) => v.construct === "DERIVED SCORE" || ["ParticipantID", "Wave", "Arm"].includes(v.name));
  const sc = wb.addWorksheet("Scores", { views: [{ state: "frozen", xSplit: 1, ySplit: 1 }] });
  sc.columns = scoreVars.map((v) => ({ header: v.name, key: v.name, width: 15 }));
  rows.forEach((r) => {
    const rec = {};
    scoreVars.forEach((v) => { rec[v.name] = valueFor(v, r); });
    sc.addRow(rec);
  });
  styleHeader(sc);

  // --- FeedTrials (long) --------------------------------------------------
  const ft = wb.addWorksheet("FeedTrials", { views: [{ state: "frozen", ySplit: 1 }] });
  ft.columns = [
    { header: "ParticipantID", key: "pid", width: 18 },
    { header: "Wave", key: "wave", width: 7 },
    { header: "Arm", key: "arm", width: 14 },
    { header: "TrialOrder", key: "order", width: 11 },
    { header: "PostID", key: "postId", width: 9 },
    { header: "TargetBias", key: "targetBias", width: 18 },
    { header: "PostTag", key: "tag", width: 12 },
    { header: "SocialProof", key: "socialProof", width: 12 },
    { header: "Likes", key: "likes", width: 10 },
    { header: "Decision", key: "decision", width: 11 },
    { header: "DecisionNum", key: "decisionNum", width: 12 },
    { header: "Reason", key: "reason", width: 14 },
    { header: "ReasonMapsTo", key: "reasonMaps", width: 16 },
    { header: "OpenedVerify", key: "openedVerify", width: 13 },
    { header: "DwellMs", key: "dwellMs", width: 10 },
  ];
  const DEC = { invest: 1, verify: 2, scroll: 3 };
  rows.forEach((r) => (r.feedTrials || []).forEach((t) => ft.addRow({
    pid: r.participantId, wave: r.wave ?? 1, arm: r.arm || t.arm || "",
    order: t.order, postId: t.postId, targetBias: t.targetBias || "", tag: t.tag || "",
    socialProof: t.socialProof || "", likes: t.likes ?? null,
    decision: t.decision || "", decisionNum: DEC[t.decision] ?? null,
    reason: t.reason || "", reasonMaps: t.reasonMaps || "",
    openedVerify: t.openedVerify ? 1 : 0, dwellMs: t.dwellMs ?? null,
  })));
  styleHeader(ft);

  // --- Meta ---------------------------------------------------------------
  const meta = wb.addWorksheet("Meta");
  meta.columns = [{ header: "Field", key: "k", width: 34 }, { header: "Value", key: "v", width: 80 }];
  const flagged = rows.filter((r) => r.quality?.flagStraightlining || r.quality?.flagTooFast || r.quality?.flagLowVariance).length;
  [
    ["Exported", new Date().toISOString()],
    ["Instrument version", rows[0]?.instrumentVersion || "2.0-validated"],
    ["Total responses", rows.length],
    ["Flagged by quality screening", flagged],
    ["Usable (unflagged)", rows.length - flagged],
    ["Feed trials", rows.reduce((n, r) => n + (r.feedTrials?.length || 0), 0)],
    ["", ""],
    ["Sheet: Data", "One row per participant-wave. Item responses and derived scores."],
    ["Sheet: Codebook", "Variable labels, ranges, value labels and sources."],
    ["Sheet: ValueLabels", "Numeric code to label mapping for SPSS."],
    ["Sheet: Scores", "Derived construct scores only."],
    ["Sheet: FeedTrials", "Long format — one row per feed trial, for multilevel models."],
    ["", ""],
    ["IMPORTANT — CFPB", "Use CFPB_raw for analysis. CFPB_std is blank unless the official IRT lookup table has been loaded into scoring.js."],
    ["IMPORTANT — MAAS", "Already scored correctly. Do NOT reverse-code: the anchors invert the items."],
    ["IMPORTANT — Literacy", "Formative index. Report % correct and DK rate, not Cronbach's alpha."],
    ["IMPORTANT — Exclusions", "Q_excludeAny marks pre-specified quality flags. Report results with and without flagged cases."],
  ].forEach(([k, v]) => meta.addRow({ k, v }));
  styleHeader(meta);
  meta.getColumn("v").alignment = { wrapText: true, vertical: "top" };

  autoWidth(cb, 10, 70);
  return wb;
}

export async function exportXlsxBuffer() {
  const wb = await buildWorkbook();
  return wb.xlsx.writeBuffer();
}
