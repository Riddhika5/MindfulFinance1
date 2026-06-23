// ===========================================================================
// analytics.js  —  turns your data into simple, honest analysis:
//   1. rankBiases      — which bias shows the most evidence vs the least
//   2. helpfulnessByType — does each solution TYPE (nudge / choice /
//                          awareness/mindfulness) actually help you?
//   3. scoreTrend      — is your well-being score going up or down over time?
// Everything is based only on YOUR data on this device.
// ===========================================================================

// 1) Rank detected biases by how much evidence we found for each.
//    More evidence = it's affecting you more often. Returns sorted high→low.
export function rankBiases(biases) {
  return biases
    .map((b) => ({ key: b.key, name: b.name, strength: b.evidence?.length || 1 }))
    .sort((a, b) => b.strength - a.strength);
}

// 2) Aggregate the "Did this help?" votes by solution type.
//    votes is a map like { "fomo:nudge": "up", "fomo:mindful": "down", ... }.
//    Returns, for each type, how many 👍 and 👎 and a helpful %.
const TYPE_LABELS = {
  nudge: "Nudges",
  choice: "Choice architecture",
  mindful: "Awareness (mindfulness)",
};

export function helpfulnessByType(votes) {
  const tally = {
    nudge: { up: 0, down: 0 },
    choice: { up: 0, down: 0 },
    mindful: { up: 0, down: 0 },
  };

  for (const [key, vote] of Object.entries(votes || {})) {
    const type = key.split(":")[1]; // "fomo:nudge" -> "nudge"
    if (tally[type] && (vote === "up" || vote === "down")) {
      tally[type][vote] += 1;
    }
  }

  return Object.entries(tally).map(([type, t]) => {
    const total = t.up + t.down;
    return {
      type,
      label: TYPE_LABELS[type] || type,
      up: t.up,
      down: t.down,
      total,
      helpfulPct: total ? Math.round((t.up / total) * 100) : null,
    };
  });
}

// Overall: did the insights help at all? (across every vote)
export function overallHelpfulness(votes) {
  let up = 0;
  let down = 0;
  for (const v of Object.values(votes || {})) {
    if (v === "up") up += 1;
    else if (v === "down") down += 1;
  }
  const total = up + down;
  return { up, down, total, helpfulPct: total ? Math.round((up / total) * 100) : null };
}

// 3) Summarize the score history (an array of { date, score }).
export function scoreTrend(history) {
  if (!history || history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const change = last.score - first.score;
  return {
    first,
    last,
    change,
    direction: change > 0 ? "up" : change < 0 ? "down" : "flat",
  };
}
