// ===========================================================================
// score.js  —  the 0–100 Financial Well-being Score
// ---------------------------------------------------------------------------
// The idea: start at a healthy 100 and subtract points for warning signs.
// Two ingredients (as per the spec):
//   1. Spending discipline — are buys driven by the feed / impulses?
//   2. Bias frequency      — how many distinct biases are showing up?
// We also explain, in plain words, what is pulling the score up and down.
// ===========================================================================

export function computeScore({ expenses = [], engagements = [], biases = [] }) {
  let score = 100;
  const down = []; // things hurting the score
  const up = []; // things helping the score

  // ---- Ingredient 1: spending discipline -----------------------------------
  const triggered = expenses.filter((e) => e.linkedPost);
  const triggeredShare = expenses.length ? triggered.length / expenses.length : 0;

  // Each feed-triggered purchase costs a few points (capped).
  const triggerPenalty = Math.min(30, triggered.length * 8);
  if (triggerPenalty > 0) {
    score -= triggerPenalty;
    down.push(
      `${triggered.length} purchase(s) were triggered by the feed (−${triggerPenalty}).`
    );
  } else if (expenses.length > 0) {
    up.push("None of your purchases were triggered by the feed — strong discipline.");
  }

  // ---- Ingredient 2: bias frequency ----------------------------------------
  const biasPenalty = Math.min(45, biases.length * 9);
  if (biasPenalty > 0) {
    score -= biasPenalty;
    down.push(
      `${biases.length} behavioral bias(es) detected (−${biasPenalty}): ${biases
        .map((b) => b.name)
        .join(", ")}.`
    );
  } else {
    up.push("No behavioral biases detected right now — great awareness.");
  }

  // ---- A nudge from raw "this influenced me" marks --------------------------
  const influencedCount = engagements.filter((e) => e.influenced || e.trade).length;
  const influencePenalty = Math.min(15, influencedCount * 3);
  if (influencePenalty > 0) {
    score -= influencePenalty;
    down.push(`${influencedCount} post(s) you marked as influencing you (−${influencePenalty}).`);
  }

  // Keep it inside 0–100.
  score = Math.max(0, Math.min(100, Math.round(score)));

  // A friendly band label.
  let band = "Excellent";
  if (score < 40) band = "Needs attention";
  else if (score < 60) band = "Fragile";
  else if (score < 80) band = "Good";

  // If there's no data yet, say so instead of showing a fake perfect score.
  const hasData = expenses.length > 0 || engagements.length > 0;

  return { score, band, up, down, hasData };
}
