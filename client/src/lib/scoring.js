// ===========================================================================
// scoring.js — construct scoring for the MindfulFinance assessment
// ---------------------------------------------------------------------------
// DESIGN RULE: raw item-level responses are ALWAYS stored and transmitted.
// Everything below is derived. If a scoring rule is later corrected, the
// dataset can be re-scored without re-collecting anything.
// ===========================================================================

import {
  SM_USE, SMFI, BIAS_CONSTRUCTS, ALL_BIAS_IDS, MAAS, CFPB, FWB, LITERACY, TASKS, SCALES,
  FIN_MINDFULNESS, STATE_MAAS, IMPULSIVENESS, SELF_CONTROL, MEDITATION,
} from "./instruments.js";
import { DESIGN } from "./design.js";

const num = (v) => (v === undefined || v === null || v === "" ? null : Number(v));

function meanOf(values) {
  const v = values.filter((x) => x !== null && !Number.isNaN(x));
  if (!v.length) return null;
  return Number((v.reduce((a, b) => a + b, 0) / v.length).toFixed(3));
}

/** Proportion of items in a list that were answered — used for completeness checks. */
function completeness(items, answers) {
  const answered = items.filter((i) => num(answers[i.id]) !== null).length;
  return items.length ? answered / items.length : 0;
}

// ---------------------------------------------------------------------------
// MAAS — Brown & Ryan (2003)
// CRITICAL: no reverse coding. The 1 = almost always ... 6 = almost never
// anchoring already inverts the lapse-worded items. Reverse-coding here is the
// most common error in applied MAAS papers.
// ---------------------------------------------------------------------------
export function scoreMAAS(answers, { shortForm = false } = {}) {
  const items = shortForm
    ? MAAS.items.filter((i) => MAAS.shortForm.items.includes(i.id))
    : MAAS.items;
  const vals = items.map((i) => num(answers[i.id]));
  return {
    score: meanOf(vals),
    range: [1, 6],
    n: items.length,
    completeness: completeness(items, answers),
    form: shortForm ? "MAAS-5" : "MAAS-15",
    interpretation: "Higher = greater dispositional mindfulness.",
  };
}

// ---------------------------------------------------------------------------
// CFPB Financial Well-Being Scale
// Response VALUES are baked into SCALES (cfpbDescribes = [4,3,2,1,0],
// cfpbOften = [0,1,2,3,4]) — the UI stores the option INDEX, and we convert.
// ---------------------------------------------------------------------------

/**
 * Official CFPB standardisation is an IRT-derived lookup keyed on
 *   (raw total) × (age group: 18–61 | 62+) × (mode: self | interviewer).
 * The tables live in Appendix A of the CFPB user guide and are NOT reproduced
 * here — dropping in invented numbers would silently corrupt every reported
 * well-being score.
 *
 * TO FINALISE: paste the official table into CFPB_LOOKUP below as
 *   { "self_18_61": [ /* index 0..40 -> standardised score * / ], ... }
 * Until then `standardised` is returned as null and `provisional` carries a
 * clearly-labelled linear approximation for on-screen feedback ONLY.
 * The raw total is always returned and is what analysis should use.
 */
export const CFPB_LOOKUP = null; // ← paste official Appendix A tables here

export function scoreCFPB(answers, { ageGroup = "18_61", mode = "self", shortForm = false } = {}) {
  const items = shortForm
    ? CFPB.items.filter((i) => CFPB.shortForm.items.includes(i.id))
    : CFPB.items;

  let raw = 0;
  let answered = 0;
  for (const item of items) {
    const idx = num(answers[item.id]);
    if (idx === null) continue;
    const scale = SCALES[item.scale];
    const value = scale.values[idx];
    raw += value;
    answered += 1;
  }

  const max = items.length * 4;
  const complete = answered === items.length;

  let standardised = null;
  if (CFPB_LOOKUP && complete) {
    const table = CFPB_LOOKUP[`${mode}_${ageGroup}`];
    if (table) standardised = table[raw] ?? null;
  }

  // Provisional linear mapping — DISPLAY ONLY, never for analysis.
  const provisional = complete ? Math.round((raw / max) * 100) : null;

  return {
    raw,
    max,
    standardised,
    provisional,
    usesOfficialTable: !!standardised,
    range: [0, 100],
    n: items.length,
    completeness: answered / items.length,
    form: shortForm ? "CFPB-5" : "CFPB-10",
    warning: standardised
      ? null
      : "Standardised score unavailable — official CFPB lookup table not loaded. Use the raw total for analysis.",
  };
}

// ---------------------------------------------------------------------------
// Financial literacy — Lusardi & Mitchell
// 'Do not know' is scored as incorrect for the index BUT retained separately,
// because DK rates are substantively informative (and gendered).
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Financial well-being — Netemeyer et al. (2018), one 5-point agreement scale.
// The five Current Money Management Stress items are negatively worded and are
// REVERSE-CODED, so a high score always means better well-being. That matches
// the direction of the CFPB score it replaces, which keeps every downstream
// hypothesis sign identical.
// ---------------------------------------------------------------------------
export function scoreFWB(answers) {
  const per = {};
  const vals = [];
  const bySub = { stress: [], security: [] };

  for (const item of FWB.items) {
    const raw = answers[item.id];
    if (raw === null || raw === undefined) { per[item.id] = null; continue; }
    // 1–5 agreement; reverse so higher = better well-being.
    const v = item.reverse ? 6 - Number(raw) : Number(raw);
    per[item.id] = v;
    vals.push(v);
    bySub[item.sub].push(v);
  }

  const mean = (arr) => (arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : null);
  const score = mean(vals);

  return {
    instrument: "Netemeyer et al. (2018) Perceived Financial Well-Being Scale",
    score: score === null ? null : Number(score.toFixed(3)),
    // 0–100 for the participant-facing report only. NOT comparable to the
    // CFPB 0–100 standardised score, which comes from an IRT calibration.
    pomp: score === null ? null : Math.round(((score - 1) / 4) * 100),
    answered: vals.length,
    total: FWB.items.length,
    subscales: {
      stress: bySub.stress.length ? Number(mean(bySub.stress).toFixed(3)) : null,
      security: bySub.security.length ? Number(mean(bySub.security).toFixed(3)) : null,
    },
    perItem: per,
    range: [1, 5],
    note: "Higher = better financial well-being. Stress items reverse-coded.",
  };
}

export function scoreLiteracy(answers) {
  let correct = 0;
  let dk = 0;
  const perItem = {};
  for (const item of LITERACY.items) {
    const a = answers[item.id];
    const isDK = typeof a === "string" && a.toLowerCase().startsWith("do not know");
    const isCorrect = a === item.correct;
    if (isCorrect) correct += 1;
    if (isDK) dk += 1;
    perItem[item.id] = { answer: a ?? null, correct: isCorrect, dk: isDK, concept: item.concept };
  }
  const big3 = LITERACY.items.filter((i) => i.core === "big3");
  const big3Correct = big3.filter((i) => answers[i.id] === i.correct).length;

  // The knowledge section is skippable. A skipped quiz is NOT a score of zero
  // and must never be analysed as one — it is missing data with a known
  // reason, which is a different thing and is flagged as such.
  const answered = LITERACY.items.filter((i) => answers[i.id] !== null && answers[i.id] !== undefined).length;
  const skipped = answers.literacy_skipped === true || answered === 0;

  return {
    skipped,
    answered,
    correct: skipped ? null : correct,
    total: LITERACY.items.length,
    pct: skipped ? null : Math.round((correct / LITERACY.items.length) * 100),
    big3Correct: skipped ? null : big3Correct,
    big3Total: big3.length,
    dkCount: skipped ? null : dk,
    perItem,
    range: [0, LITERACY.items.length],
  };
}

// ---------------------------------------------------------------------------
// Social Media Financial Influence (newly developed scale)
// ---------------------------------------------------------------------------
export function scoreSMFI(answers) {
  const bySub = {};
  for (const sub of Object.keys(SMFI.subscales)) {
    const items = SMFI.items.filter((i) => i.sub === sub);
    bySub[sub] = {
      score: meanOf(items.map((i) => num(answers[i.id]))),
      n: items.length,
    };
  }
  return {
    score: meanOf(SMFI.items.map((i) => num(answers[i.id]))),
    subscales: bySub,
    range: [1, 5],
    n: SMFI.items.length,
    completeness: completeness(SMFI.items, answers),
  };
}

// ---------------------------------------------------------------------------
// Behavioural biases
// Each construct scored as its own subscale mean on its own native scale.
// A composite Behavioural Bias Index is computed on POMP-normalised scores
// (Percentage Of Maximum Possible) so 5-point and 7-point scales are
// commensurable: POMP = (x − min) / (max − min) × 100.
// ---------------------------------------------------------------------------
export function pomp(value, [min, max]) {
  if (value === null) return null;
  return Number((((value - min) / (max - min)) * 100).toFixed(1));
}

export function scoreBiases(answers) {
  const constructs = {};
  for (const key of ALL_BIAS_IDS) {
    const c = BIAS_CONSTRUCTS[key];
    const scale = SCALES[c.scale];
    const range = [1, scale.points];
    const raw = meanOf(c.items.map((i) => num(answers[i.id])));
    constructs[key] = {
      id: key,
      name: c.name,
      plainName: c.plainName,
      block: c.block,
      raw,
      range,
      pomp: pomp(raw, range),
      n: c.items.length,
      completeness: completeness(c.items, answers),
      source: c.src,
    };
  }

  const pomps = Object.values(constructs).map((c) => c.pomp).filter((x) => x !== null);
  const index = pomps.length ? Number((pomps.reduce((a, b) => a + b, 0) / pomps.length).toFixed(1)) : null;

  // Second-order grouping follows Pompian's (2006) cognitive / emotional taxonomy:
  // cognitive biases are faulty reasoning, emotional biases are feeling-driven.
  const COGNITIVE = ["availability", "confirmation", "representativeness", "recency", "anchoring", "overconfidence", "illusionOfKnowledge"];
  const EMOTIONAL = ["herding", "fomo", "lossAversion"];
  const groupMean = (keys) =>
    meanOf(keys.map((k) => constructs[k]?.pomp ?? null));

  return {
    constructs,
    index,
    cognitive: groupMean(COGNITIVE),
    emotional: groupMean(EMOTIONAL),
    range: [0, 100],
    note: "Composite uses POMP normalisation so 5-point and 7-point subscales are commensurable. Report subscale means separately; the index is descriptive, not a validated total score.",
  };
}

// ---------------------------------------------------------------------------
// Behavioural tasks
// ---------------------------------------------------------------------------

/** Gächter et al. (2022): λ from the switch point across six gambles. */
export function scoreLossAversionTask(acceptances) {
  const { fixedGain, losses } = TASKS.lossAversionGamble;
  // acceptances: array of booleans aligned with `losses` (ascending loss).
  const firstReject = acceptances.findIndex((a) => a === false);
  if (firstReject === -1) {
    return { lambda: null, censored: "low", note: `Accepted all gambles: λ < ${(fixedGain / losses[losses.length - 1]).toFixed(2)}` };
  }
  if (firstReject === 0) {
    return { lambda: null, censored: "high", note: `Rejected all gambles: λ > ${(fixedGain / losses[0]).toFixed(2)}` };
  }
  const lambda = Number((fixedGain / losses[firstReject]).toFixed(2));
  // Consistency check: acceptances should be monotone (accept then reject).
  const monotone = acceptances.slice(firstReject).every((a) => a === false);
  return { lambda, censored: null, monotone, switchPoint: firstReject };
}

/**
 * Anchoring is a BETWEEN-subjects effect — it cannot be scored per person.
 * We store the assigned anchor and the estimate; the index is computed at the
 * sample level in analysis. This function returns the storable record only.
 */
export function recordAnchoringTask({ anchorCondition, estimate, aboveBelow }) {
  return {
    anchorCondition,                       // "low" | "high"
    anchorValue: TASKS.anchoringEstimate.anchors[anchorCondition],
    aboveBelow: aboveBelow ?? null,        // comparative judgment
    estimate: num(estimate),               // absolute judgment
    note: "Anchoring index is computed between-subjects at analysis stage, not per participant.",
  };
}

// ---------------------------------------------------------------------------
// Simulated Social Media Feed (SSMF) — behavioural indicators
// Each feed trial yields: decision, stated reason, dwell time, whether the
// participant opened the 'verify' affordance.
// ---------------------------------------------------------------------------
export function scoreFeed(trials = []) {
  if (!trials.length) return null;
  const n = trials.length;
  const acted = trials.filter((t) => t.decision === "invest").length;
  const verified = trials.filter((t) => t.openedVerify).length;
  const dwell = trials.map((t) => t.dwellMs).filter((x) => typeof x === "number");
  const medianDwell = dwell.length
    ? dwell.slice().sort((a, b) => a - b)[Math.floor(dwell.length / 2)]
    : null;

  // Reason codes map onto bias constructs — exploratory behavioural indicators.
  const reasonCounts = {};
  for (const t of trials) {
    if (t.reason) reasonCounts[t.reason] = (reasonCounts[t.reason] || 0) + 1;
  }

  return {
    trials: n,
    actionRate: Number((acted / n).toFixed(3)),
    verificationRate: Number((verified / n).toFixed(3)),
    medianDwellMs: medianDwell,
    reasonCounts,
    note: "Exploratory behavioural indicators. Keep separate from the validated scale scores in any confirmatory analysis (Kuerzinger & Stangor, 2024; OSC, 2024).",
  };
}

// ---------------------------------------------------------------------------
// Generic reflective-scale scorer: mean, with reverse-keyed items flipped.
// ---------------------------------------------------------------------------
function scoreReflective(block, answers, { points = 5 } = {}) {
  const vals = block.items.map((i) => {
    const v = num(answers[i.id]);
    if (v === null) return null;
    return i.reverse ? points + 1 - v : v;
  });
  return {
    score: meanOf(vals),
    n: block.items.length,
    completeness: completeness(block.items, answers),
    range: [1, points],
  };
}

/** Financial mindfulness — awareness and acceptance, plus the total. */
export function scoreFinMindfulness(answers) {
  const total = scoreReflective(FIN_MINDFULNESS, answers);
  const bySub = {};
  for (const sub of Object.keys(FIN_MINDFULNESS.subscales)) {
    const items = FIN_MINDFULNESS.items.filter((i) => i.sub === sub);
    bySub[sub] = meanOf(items.map((i) => {
      const v = num(answers[i.id]);
      return v === null ? null : i.reverse ? 6 - v : v;
    }));
  }
  return { ...total, subscales: bySub };
}

/**
 * State MAAS — the manipulation check.
 * Stored 1–7 by the UI; converted to the published 0–6 metric and reverse
 * scored, because unlike the trait MAAS these anchors do NOT invert the items.
 */
export function scoreStateMindfulness(answers) {
  const vals = STATE_MAAS.items.map((i) => {
    const v = num(answers[i.id]);
    return v === null ? null : 6 - (v - 1); // 1..7 -> 0..6, then reversed
  });
  return {
    score: meanOf(vals),
    range: [0, 6],
    n: STATE_MAAS.items.length,
    completeness: completeness(STATE_MAAS.items, answers),
    interpretation: "Higher = more present and attentive during the feed.",
  };
}

export const scoreImpulsiveness = (a) => scoreReflective(IMPULSIVENESS, a);
export const scoreSelfControl = (a) => scoreReflective(SELF_CONTROL, a);

/** Meditation practice — a binary covariate plus the raw responses. */
export function scoreMeditation(answers) {
  const ever = answers.med_ever;
  return {
    isMeditator: ever === "Yes, currently" || ever === "Yes, in the past" ? 1 : 0,
    currentlyPractising: ever === "Yes, currently" ? 1 : 0,
    raw: MEDITATION.items.reduce((o, i) => ({ ...o, [i.id]: answers[i.id] ?? null }), {}),
    note: "Author-constructed practice history, not a validated scale (cf. Van Dam et al., 2024).",
  };
}

// ---------------------------------------------------------------------------
// Subjective–objective knowledge calibration
// ---------------------------------------------------------------------------
/**
 * The defensible operationalisation of illusion of knowledge: the gap between
 * how much someone believes they understand (IOK subscale) and how much they
 * demonstrably do (objective literacy score), both on a 0–100 scale.
 *
 * Positive gap = overestimates own knowledge (the illusion).
 * Negative gap = underestimates it.
 *
 * Reported ALONGSIDE the IOK subscale, never instead of it — the subscale is
 * the construct, this is the calibration check. See Franco Moreno et al. (2025)
 * for why a single self-report cannot capture the illusion on its own.
 */
export function knowledgeCalibration(biases, literacy) {
  const subjective = biases?.constructs?.illusionOfKnowledge?.pomp ?? null;
  const objective = literacy?.pct ?? null;
  if (subjective === null || objective === null) return null;
  const gap = Number((subjective - objective).toFixed(1));
  return {
    subjective,
    objective,
    gap,
    direction: gap > 15 ? "overestimates" : gap < -15 ? "underestimates" : "calibrated",
    note: "Subjective confidence minus demonstrated knowledge, both 0–100. Positive = the illusion.",
  };
}

// ---------------------------------------------------------------------------
// Master scorer
// ---------------------------------------------------------------------------
export function scoreAll(session) {
  const a = session.answers || {};
  const biases = scoreBiases(a);
  const maas = scoreMAAS(a);
  // Both instruments may be administered. Each keeps its own scoring, and
  // `wellbeing` points at whichever is the PRIMARY outcome for this build.
  const useCfpb = DESIGN.wellbeingScale === "cfpb" || DESIGN.wellbeingScale === "both";
  const useNet = DESIGN.wellbeingScale === "netemeyer" || DESIGN.wellbeingScale === "both";
  const cfpbScore = useCfpb
    ? scoreCFPB(a, { ageGroup: session.ageGroup || "18_61", mode: "self" })
    : null;
  const netScore = useNet ? scoreFWB(a) : null;
  // When both are present the CFPB score is the primary outcome: it is the
  // normed, published instrument. Netemeyer supplies the present/future split.
  const fwb = cfpbScore || netScore;
  const literacy = scoreLiteracy(a);
  const smfi = scoreSMFI(a);
  const feed = scoreFeed(session.feedTrials);
  const lossTask = session.lossTask ? scoreLossAversionTask(session.lossTask) : null;

  return {
    participantId: session.participantId,
    arm: session.arm,
    startedAt: session.startedAt,
    completedAt: new Date().toISOString(),
    durationMs: session.startedAt ? Date.now() - new Date(session.startedAt).getTime() : null,
    smUse: SM_USE.items.reduce((o, i) => ({ ...o, [i.id]: a[i.id] ?? null }), {}),
    smfi,
    biases,
    maas: DESIGN.traitMindfulness ? maas : null,
    // Netemeyer form (present/future split, agreement metric).
    fwb: netScore,
    // CFPB form (published anchors, IRT-scorable). Primary when present.
    cfpb: cfpbScore || netScore,
    wellbeingInstrument: DESIGN.wellbeingScale,
    // Order the two well-being blocks were shown in, for the order covariate.
    wellbeingOrder: a.fwb_order || null,
    // Convergent validity, computed per participant so it can be checked
    // without re-deriving anything: both instruments rescaled to 0–100.
    wellbeingConvergence:
      cfpbScore && netScore && cfpbScore.provisional !== null && netScore.pomp !== null
        ? { cfpb0100: cfpbScore.provisional, netemeyer0100: netScore.pomp,
            gap: cfpbScore.provisional - netScore.pomp }
        : null,
    literacy,
    feed,
    // Mindfulness, measured three ways: general trait, financial domain, and
    // state during the feed. The thesis lives or dies on the distinction.
    finMindfulness: DESIGN.finMindfulness ? scoreFinMindfulness(a) : null,
    stateMindfulness: DESIGN.stateMindfulness ? scoreStateMindfulness(a) : null,
    // The behavioural link between bias and well-being.
    impulsiveness: DESIGN.impulsiveness ? scoreImpulsiveness(a) : null,
    // The covariate that answers "is this just self-control?"
    selfControl: DESIGN.selfControl ? scoreSelfControl(a) : null,
    meditation: DESIGN.meditation ? scoreMeditation(a) : null,
    knowledgeCalibration: knowledgeCalibration(biases, literacy),
    lossTask,
    anchorTask: session.anchorTask || null,
    // Straightlining / careless-responding flags for data cleaning.
    quality: qualityFlags(session),
  };
}

// ---------------------------------------------------------------------------
// Data-quality flags (Meade & Craig style screening, computed client-side and
// stored so careless responders can be excluded transparently at analysis).
// ---------------------------------------------------------------------------
export function qualityFlags(session) {
  const a = session.answers || {};
  const likertItems = [
    ...SMFI.items,
    ...ALL_BIAS_IDS.flatMap((k) => BIAS_CONSTRUCTS[k].items),
    ...MAAS.items,
  ];
  const vals = likertItems.map((i) => num(a[i.id])).filter((x) => x !== null);

  // Longest string of identical consecutive responses.
  let longest = 0;
  let run = 0;
  let prev = null;
  for (const v of vals) {
    run = v === prev ? run + 1 : 1;
    prev = v;
    if (run > longest) longest = run;
  }

  const sd = (() => {
    if (vals.length < 2) return null;
    const m = vals.reduce((x, y) => x + y, 0) / vals.length;
    return Number(Math.sqrt(vals.reduce((s, v) => s + (v - m) ** 2, 0) / (vals.length - 1)).toFixed(3));
  })();

  const durationMs = session.startedAt ? Date.now() - new Date(session.startedAt).getTime() : null;
  const secondsPerItem = durationMs && vals.length ? durationMs / 1000 / vals.length : null;

  return {
    itemsAnswered: vals.length,
    longestIdenticalRun: longest,
    responseSD: sd,
    secondsPerItem: secondsPerItem ? Number(secondsPerItem.toFixed(2)) : null,
    flagStraightlining: longest >= 12,
    flagTooFast: secondsPerItem !== null && secondsPerItem < 2,
    flagLowVariance: sd !== null && sd < 0.4,
  };
}

// ---------------------------------------------------------------------------
// Banding for on-screen feedback. Deliberately non-clinical language.
// ---------------------------------------------------------------------------
export function band(pompScore) {
  if (pompScore === null) return { label: "Not enough answers", word: "—", tone: "muted" };
  if (pompScore < 33) return { label: "Low", word: "Low", tone: "low" };
  if (pompScore < 60) return { label: "Moderate", word: "Moderate", tone: "mid" };
  return { label: "High", word: "High", tone: "high" };
}

/**
 * Deterministic seeded shuffle (Fisher–Yates with a mulberry32 PRNG).
 * Used to randomise item order within a block while keeping the order stable
 * across a page refresh, and recordable so the presented order can be analysed
 * for order effects.
 */
export function seededShuffle(items, seedStr) {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i += 1) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
