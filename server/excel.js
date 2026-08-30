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
  SOURCES, SM_USE, SMI, SMFI_CRITERION, OPEN_ENDED, BIAS_CONSTRUCTS, ALL_BIAS_IDS, MAAS, CFPB, FWB, LITERACY, SCALES,
  FIN_MINDFULNESS, STATE_MAAS, IMPULSIVENESS, SELF_CONTROL, MEDITATION,
} from "../client/src/lib/instruments.js";
import { DESIGN } from "../client/src/lib/design.js";
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

  // Social media influence (SUSIS-anchored)
  SMI.items.forEach((it, n) => {
    add({ name: `SMI${n + 1}`, itemId: it.id, label: it.q, type: "number",
          construct: "Social media influence (SUSIS)", subscale: it.sub,
          range: "1–5", values: SCALES.agree5.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
          note: it.adapt === "adapted"
            ? "SUSIS SOCIAL_PERCEPTION item, re-anchored from influencers-in-general to finance creators"
            : "Extension item — not part of published SUSIS",
          source: SOURCES[it.src]?.citation || "" });
  });

  // SMI criterion item — NOT part of the SMI mean. Kept adjacent to the SMI
  // block in the codebook so the validity test is obvious to a reader.
  add({ name: spssName(SMFI_CRITERION.id), label: SMFI_CRITERION.q, type: "string",
        construct: "SMI criterion (not scored)",
        values: SMFI_CRITERION.options.map((o, i) => `${i}=${o}`).join("; "),
        source: SOURCES[SMFI_CRITERION.src]?.citation || "" });

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

  // Optional blocks. Only the ones actually administered are given codebook
  // entries — a codebook listing variables that were never asked is worse than
  // useless, because it makes an examiner think data are missing.
  const EXTRA = [
    [FIN_MINDFULNESS, "FMI", "Financial mindfulness", "agree5", "1–5", DESIGN.finMindfulness],
    [STATE_MAAS, "SMS", "State mindfulness (post-feed)", "state7", "1–7 stored; scored 0–6 reversed", DESIGN.stateMindfulness],
    [IMPULSIVENESS, "BIS", "Buying impulsiveness", "agree5", "1–5", DESIGN.impulsiveness],
    [SELF_CONTROL, "SCS", "Trait self-control (covariate)", "agree5", "1–5", DESIGN.selfControl],
  ].filter((row) => row[5]);
  for (const [block, code, label, scaleKey, range] of EXTRA) {
    block.items.forEach((it, n) => {
      add({ name: `${code}${n + 1}`, itemId: it.id, label: it.q, type: "number",
            construct: label, subscale: it.sub || "", range,
            values: SCALES[scaleKey].labels.filter(Boolean).map((l, i) => `${i + 1}=${l}`).join("; "),
            note: it.reverse ? "REVERSE-KEYED — already reversed in the derived score" : "",
            source: SOURCES[block.src]?.citation || "" });
    });
  }
  if (DESIGN.meditation) MEDITATION.items.forEach((it) => {
    add({ name: spssName(it.id), label: it.q, type: "string", construct: "Meditation practice",
          values: it.options.join(" / "), source: SOURCES.vanDam2024.citation });
  });

  // MAAS
  if (DESIGN.traitMindfulness) MAAS.items.forEach((it, n) => {
    add({ name: `MAAS${n + 1}`, itemId: it.id, label: it.q, type: "number",
          construct: "Mindfulness (MAAS-15)", range: "1–6",
          values: SCALES.maas6.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
          note: "DO NOT reverse-code — the anchoring already inverts these items",
          source: SOURCES.brownRyan2003.citation });
  });

  // Financial well-being — one or both instruments.
  if (DESIGN.wellbeingScale === "cfpb" || DESIGN.wellbeingScale === "both") {
    // Stored as the scored response VALUE, not the option index.
    CFPB.items.forEach((it, n) => {
      add({ name: `CFPB${n + 1}`, itemId: it.id, label: it.q, type: "number",
            construct: "Financial well-being (CFPB-10)", range: "0–4",
            values: SCALES[it.scale].labels.map((l, i) => `${SCALES[it.scale].values[i]}=${l}`).join("; "),
            note: "Already converted to CFPB scored values (not the option index). Column name CFPB1–CFPB10.",
            source: SOURCES.cfpb2015.citation });
    });
  }
  if (DESIGN.wellbeingScale === "netemeyer" || DESIGN.wellbeingScale === "both") {
    FWB.items.forEach((it, n) => {
      add({ name: `FWB${n + 1}`, itemId: it.id, label: it.q, type: "number",
            construct: "Financial well-being (Netemeyer et al., 2018)",
            subscale: it.sub, range: "1–5",
            values: SCALES.agree5.labels.map((l, i) => `${i + 1}=${l}`).join("; "),
            note: it.reverse
              ? "REVERSE-KEYED — raw value stored as answered; already reversed in FWB_mean"
              : "",
            source: SOURCES.netemeyer2018.citation });
    });
  }

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

  // Open-ended probe — free text, for thematic coding rather than scoring.
  OPEN_ENDED.items.forEach((it) => {
    add({ name: spssName(it.id), itemId: it.id, label: it.q, type: "string",
          construct: "Open-ended (qualitative)",
          note: "OPTIONAL free text. Not scored. Analyse by inductive thematic coding. ⚠️ SCREEN FOR IDENTIFYING DETAIL before sharing or archiving this dataset — participants can name themselves or others in free text.",
          source: OPEN_ENDED.sourceLine });
  });

  // derived scores
  const SCORES = [
    ["SMI_mean", "Social media influence, mean (SUSIS-anchored)", "1–5"],
    ["SMI_percep", "SMI — perception towards influencers (SUSIS C1)", "1–5"],
    ["SMI_parasoc", "SMI — parasocial relationship (SUSIS C3)", "1–5"],
    ["SMI_trust", "SMI — consumer trust (SUSIS C4)", "1–5"],
    ["SMI_adopt", "SMI — financial information adoption (extension)", "1–5"],
    ...ALL_BIAS_IDS.map((k) => [`${BIAS_CONSTRUCTS[k].code}_mean`, `${BIAS_CONSTRUCTS[k].name}, subscale mean`, "1–5"]),
    ["BiasIndex", "Composite behavioural bias index (POMP)", "0–100"],
    ["BiasCognitive", "Cognitive biases (POMP mean)", "0–100"],
    ["BiasEmotional", "Emotional biases (POMP mean)", "0–100"],
    ...(DESIGN.traitMindfulness ? [["MAAS_mean", "Dispositional mindfulness, mean (no reverse coding)", "1–6"]] : []),
    ...(DESIGN.finMindfulness ? [
      ["FMI_mean", "Financial mindfulness, total mean", "1–5"],
      ["FMI_aware", "Financial mindfulness — awareness subscale", "1–5"],
      ["FMI_accept", "Financial mindfulness — acceptance subscale", "1–5"],
    ] : []),
    ...(DESIGN.stateMindfulness ? [["SMS_state", "State mindfulness during the feed (reversed, 0–6)", "0–6"]] : []),
    ...(DESIGN.impulsiveness ? [["BIS_mean", "Buying impulsiveness, mean", "1–5"]] : []),
    ...(DESIGN.selfControl ? [["SCS_mean", "Trait self-control, mean (covariate)", "1–5"]] : []),
    ...(DESIGN.meditation ? [
      ["Meditator", "Has ever practised meditation regularly", "0/1"],
      ["MeditatesNow", "Currently practising", "0/1"],
    ] : []),
    ...(DESIGN.wellbeingScale !== "netemeyer" ? [
      ["CFPB_raw", "CFPB raw total — PRIMARY well-being outcome. Published, normed instrument", "0–40"],
      ["CFPB_std", "CFPB standardised score (blank unless the official IRT table is loaded into scoring.js)", "0–100"],
      ["CFPB_prov", "Provisional linear 0–100 rescaling of CFPB_raw. DISPLAY ONLY — never analyse this", "0–100"],
    ] : []),
    ...(DESIGN.wellbeingScale !== "cfpb" ? [
      ["FWB_mean", "Netemeyer well-being, mean. Stress items reverse-coded, so HIGH = BETTER", "1–5"],
      ["FWB_stress", "Current money management stress subscale (reverse-coded) = CFPB PRESENT row", "1–5"],
      ["FWB_security", "Expected future financial security subscale = CFPB FUTURE row", "1–5"],
      ["FWB_pomp", "Netemeyer well-being rescaled 0–100. NOT comparable to a CFPB standardised score", "0–100"],
    ] : []),
    ...(DESIGN.wellbeingScale === "both" ? [
      ["FWB_order", "Which well-being block was shown first (counterbalanced). Enter as a covariate", "text"],
      ["FWB_convGap", "CFPB_prov minus FWB_pomp, both 0–100. Convergence check only", "−100–100"],
    ] : []),
    ["LIT_correct", "Financial literacy, number correct. BLANK if the participant skipped the section — do NOT recode blanks to 0", "0–5"],
    ["LIT_skipped", "Participant skipped the optional knowledge section", "0/1"],
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
    ["OverQuota", "Non-blank if the recruitment cell filled while this participant was answering. Exclude these from the primary quota-balanced sample.", "text"],
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

    case "SMI_mean": return s.smi ?? s.smfi ?? null;
    case "SMI_percep": return s.smiPerception ?? null;
    case "SMI_parasoc": return s.smiParasocial ?? null;
    case "SMI_trust": return s.smiTrust ?? null;
    case "SMI_adopt": return s.smiAdoption ?? null;
    case "BiasIndex": return s.biasIndex ?? null;
    case "BiasCognitive": return s.biasCognitive ?? null;
    case "BiasEmotional": return s.biasEmotional ?? null;
    case "MAAS_mean": return s.maas ?? null;
    case "FMI_mean": return s.finMindfulness ?? null;
    case "FMI_aware": return s.finMindfulnessAwareness ?? null;
    case "FMI_accept": return s.finMindfulnessAcceptance ?? null;
    case "SMS_state": return s.stateMindfulness ?? null;
    case "BIS_mean": return s.impulsiveness ?? null;
    case "SCS_mean": return s.selfControl ?? null;
    case "Meditator": return s.meditator ?? null;
    case "MeditatesNow": return s.meditatesNow ?? null;
    case "CFPB_raw": return s.cfpbRaw ?? null;
    case "CFPB_std": return s.cfpbStandardised ?? null;
    case "CFPB_prov": return s.cfpbProvisional ?? null;
    case "FWB_order": return a.fwb_order || "";
    case "FWB_convGap": return s.wellbeingGap ?? null;
    case "FWB_mean": return s.fwb ?? null;
    case "FWB_stress": return s.fwbStress ?? null;
    case "FWB_security": return s.fwbSecurity ?? null;
    case "FWB_pomp": return s.fwbPomp ?? null;
    case "LIT_correct": return s.literacyCorrect ?? null;
    case "LIT_skipped": return s.literacySkipped ? 1 : 0;
    case "LIT_DKcount": return s.literacyDK ?? null;
    case "OverQuota": return Array.isArray(r.overQuota) ? r.overQuota.join("|") : "";
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

  // Well-being items. Under the CFPB form the UI stores an option INDEX that
  // has to be mapped through the scale's value table; under the Netemeyer form
  // the UI already stores 1–5, so it passes straight through.
  if (/^CFPB\d+$/.test(v.name) && v.itemId) {
    const idx = a[v.itemId];
    if (idx === undefined || idx === null || idx === "") return null;
    const item = CFPB.items.find((i) => i.id === v.itemId);
    return item ? (SCALES[item.scale].values[Number(idx)] ?? null) : Number(idx);
  }
  // Netemeyer items are stored as 1–5 already.
  if (/^FWB\d+$/.test(v.name) && v.itemId) {
    const raw = a[v.itemId];
    return raw === undefined || raw === null || raw === "" ? null : Number(raw);
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
    agree5: "All SMI, behavioural bias and financial well-being items",
    maas6: "MAAS1–MAAS15",
    cfpbDescribes: "FWB1–FWB6 (CFPB form only)",
    cfpbOften: "FWB7–FWB10 (CFPB form only)",
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
    ["IMPORTANT — Well-being", "FWB_mean is the outcome variable (Netemeyer et al., 2018; 1–5 agreement). The five stress items are ALREADY reverse-coded in FWB_mean, so high = better well-being. The FWB1–FWB5 item columns hold the RAW answer as given — reverse them yourself if you re-derive the mean."],
    ["IMPORTANT — Not CFPB", "This dataset does NOT contain CFPB scores. The CFPB scale was replaced so the whole instrument shares one agreement metric; CFPB's published 0–100 score depends on its own anchors and IRT calibration and cannot be reproduced from agreement responses."],
    ["IMPORTANT — Literacy skips", "The knowledge section is optional. LIT_skipped = 1 means the participant chose not to answer. LIT_correct is BLANK for those cases. Do not recode blank to 0 — that would score a non-response as total ignorance."],
    ["IMPORTANT — Quotas", "Sampling is quota-controlled: 300 male / 300 female; age 105/145/120/95/75/60; location 180/210/120/90; 600 total. Rows with a non-blank OverQuota arrived after their cell filled."],
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
