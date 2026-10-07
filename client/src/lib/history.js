// ===========================================================================
// history.js — assessment wave history for the monthly check-up
// ---------------------------------------------------------------------------
// Each completed assessment is stored as a compact summary so the participant
// can re-assess and see what moved. The full item-level record goes to the
// server; this is the local, participant-facing copy.
//
// Direction matters for interpretation and is stored per metric:
//   "down-is-better" — biases, social media influence
//   "up-is-better"   — mindfulness, well-being, literacy, verification rate
// ===========================================================================

import { load, save } from "./storage.js";

const KEY = "mf_waves";
const MIN_DAYS_BETWEEN_WAVES = 28; // "monthly" check-up

export const METRICS = [
  { id: "biasIndex", label: "Behavioural bias index", icon: "🧠", max: 100, dir: "down", suffix: "/100" },
  { id: "smfi", label: "Social media influence", icon: "📲", max: 5, dir: "down", suffix: "/5" },
  { id: "maas", label: "Mindfulness", icon: "🌱", max: 6, dir: "up", suffix: "/6" },
  { id: "cfpb", label: "Financial well-being", icon: "💰", max: 40, dir: "up", suffix: "/40" },
  { id: "literacy", label: "Financial literacy", icon: "🧾", max: 5, dir: "up", suffix: "/5" },
  { id: "feedAction", label: "Acted on feed posts", icon: "📱", max: 100, dir: "down", suffix: "%" },
];

/** Compact a full scored result into a storable wave summary. */
export function summarise(results, wave) {
  return {
    wave: wave || 1,
    participantId: results.participantId,
    completedAt: results.completedAt,
    arm: results.arm,
    metrics: {
      biasIndex: results.biases?.index ?? null,
      smfi: results.smfi?.score ?? null,
      maas: results.maas?.score ?? null,
      cfpb: results.cfpb?.raw ?? null,
      literacy: results.literacy?.correct ?? null,
      feedAction: results.feed ? Math.round(results.feed.actionRate * 100) : null,
    },
    biases: Object.fromEntries(
      Object.entries(results.biases?.constructs || {}).map(([k, v]) => [k, { name: v.name, pomp: v.pomp }])
    ),
  };
}

export function getWaves() {
  const list = load(KEY, []);
  return Array.isArray(list) ? list : [];
}

/** Record a completed wave. Re-recording the same participantId replaces it. */
export function recordWave(results) {
  const waves = getWaves();
  const existing = waves.findIndex((w) => w.participantId === results.participantId);
  const entry = summarise(results, existing >= 0 ? waves[existing].wave : waves.length + 1);
  if (existing >= 0) waves[existing] = entry;
  else waves.push(entry);
  save(KEY, waves);
  return entry;
}

export function daysSince(iso) {
  if (!iso) return Infinity;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

/** Is the participant due for a check-up? */
export function checkUpStatus() {
  const waves = getWaves();
  if (!waves.length) return { due: false, never: true, daysLeft: null, lastAt: null };
  const last = waves[waves.length - 1];
  const elapsed = daysSince(last.completedAt);
  return {
    never: false,
    due: elapsed >= MIN_DAYS_BETWEEN_WAVES,
    daysSince: elapsed,
    daysLeft: Math.max(0, MIN_DAYS_BETWEEN_WAVES - elapsed),
    lastAt: last.completedAt,
    waveCount: waves.length,
  };
}

/**
 * Compare the two most recent waves.
 * `improved` is direction-aware: a fall in bias and a rise in mindfulness both
 * count as improvement.
 */
export function compareLatest() {
  const waves = getWaves();
  if (waves.length < 2) return null;
  const curr = waves[waves.length - 1];
  const prev = waves[waves.length - 2];

  const rows = METRICS.map((m) => {
    const a = prev.metrics[m.id];
    const b = curr.metrics[m.id];
    if (a === null || b === null || a === undefined || b === undefined) {
      return { ...m, prev: a ?? null, curr: b ?? null, delta: null, improved: null };
    }
    const delta = Number((b - a).toFixed(2));
    const improved = delta === 0 ? null : m.dir === "up" ? delta > 0 : delta < 0;
    return { ...m, prev: a, curr: b, delta, improved };
  });

  const biasRows = Object.keys(curr.biases || {})
    .filter((k) => prev.biases?.[k])
    .map((k) => {
      const a = prev.biases[k].pomp;
      const b = curr.biases[k].pomp;
      if (a === null || b === null) return null;
      return { id: k, name: curr.biases[k].name, prev: a, curr: b, delta: Number((b - a).toFixed(1)) };
    })
    .filter(Boolean)
    .sort((x, y) => x.delta - y.delta);

  const scored = rows.filter((r) => r.improved !== null);
  return {
    prev,
    curr,
    rows,
    biasRows,
    improvedCount: scored.filter((r) => r.improved).length,
    scoredCount: scored.length,
    daysBetween: Math.max(0, daysSince(prev.completedAt) - daysSince(curr.completedAt)),
  };
}
