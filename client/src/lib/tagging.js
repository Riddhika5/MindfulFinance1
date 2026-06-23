// ===========================================================================
// tagging.js  —  auto-tag each feed post as hype / scam-risk / calm-advice
// ---------------------------------------------------------------------------
// This is deliberately SIMPLE: we just look for keywords. It is not "AI" — it
// is easy-to-read rules you can edit. Each tag has a list of trigger words;
// we count how many appear, and the highest count wins.
// ===========================================================================

const RULES = {
  "scam-risk": {
    label: "Scam risk",
    emoji: "⚠️",
    words: [
      "guaranteed",
      "100%",
      "no risk",
      "risk free",
      "double your money",
      "insider",
      "dm me",
      "private group",
      "limited seats",
      "act fast",
      "secret",
      "get rich",
    ],
  },
  hype: {
    label: "Hype",
    emoji: "🚀",
    words: [
      "explode",
      "moon",
      "100x",
      "10x",
      "rocket",
      "don't miss",
      "last chance",
      "fomo",
      "everyone is buying",
      "everyone in my group",
      "buy now",
      "to the moon",
      "mega sale",
      "today only",
      "stock runs out",
      "grab before",
      "yolo",
      "swipe that card",
    ],
  },
  "calm-advice": {
    label: "Calm advice",
    emoji: "🧘",
    words: [
      "index fund",
      "diversified",
      "diversify",
      "emergency fund",
      "long term",
      "long-term",
      "time in the market",
      "discipline",
      "slow",
      "steady",
      "pay yourself first",
      "savings",
      "ignore the noise",
      "boring but true",
      "pause",
    ],
  },
};

// Tag one post. Returns { tag, label, emoji, matched: [words found] }.
export function tagPost(text) {
  const lower = (text || "").toLowerCase();
  let best = { tag: "neutral", label: "Neutral", emoji: "💬", count: 0, matched: [] };

  for (const [tag, rule] of Object.entries(RULES)) {
    const matched = rule.words.filter((w) => lower.includes(w));
    if (matched.length > best.count) {
      best = { tag, label: rule.label, emoji: rule.emoji, count: matched.length, matched };
    }
  }
  return best;
}

export const TAG_INFO = RULES;
