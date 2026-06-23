// ===========================================================================
// biasEngine.js  —  the rules engine that flags behavioral-finance biases
// ---------------------------------------------------------------------------
// It looks at two things:
//   1. expenses     — what you spent (each may LINK to the post that triggered it)
//   2. engagements  — feed posts you marked as "this influenced me" / "buy-sell"
//
// For each bias we use a simple, readable rule. When a rule fires we return a
// plain-English REASON explaining exactly why, plus the evidence we used.
// Nothing here is a black box — you can read and edit every rule.
// ===========================================================================

const DAY = 24 * 60 * 60 * 1000;

// Helper: how many ms ago was this ISO date?
function ageMs(iso) {
  return Date.now() - new Date(iso).getTime();
}

// Helper: does some text contain any of these words?
function hasAny(text, words) {
  const t = (text || "").toLowerCase();
  return words.some((w) => t.includes(w));
}

// Helper: detect an "anchor" price pattern like "was 999 now 499" or "50% off".
function looksLikeAnchorPrice(text) {
  const t = (text || "").toLowerCase();
  const wasNow = /\bwas\b[\s\S]{0,30}\bnow\b/.test(t); // "was ... now ..."
  const percentOff = /\d+\s*%\s*off/.test(t) || t.includes("% off");
  const mrp = t.includes("mrp") || t.includes("original price") || t.includes("discount");
  return wasNow || percentOff || mrp;
}

// The main function. Returns an array of detected biases, each:
//   { key, name, reason, evidence: [strings] }
export function detectBiases({ expenses = [], engagements = [] }) {
  const found = [];

  // Engagements split by how the user reacted.
  const influenced = engagements.filter((e) => e.influenced);
  const tradeUrge = engagements.filter((e) => e.trade);

  // Expenses that were triggered by a feed post (have a linkedPost).
  const triggered = expenses.filter((e) => e.linkedPost);

  // -------------------------------------------------------------------------
  // 1) FOMO — buying after hype posts
  // -------------------------------------------------------------------------
  const fomoSpends = triggered.filter((e) => e.linkedPost.tag === "hype");
  const hypeInfluenced = influenced.filter((e) => e.post.tag === "hype");
  if (fomoSpends.length >= 1 || hypeInfluenced.length >= 2) {
    const evidence = [];
    fomoSpends.forEach((e) =>
      evidence.push(`Spent ₹${e.amount} on "${e.category}" right after a HYPE post.`)
    );
    hypeInfluenced.forEach((e) =>
      evidence.push(`Marked a hype post by ${e.post.author} as "influenced me".`)
    );
    found.push({
      key: "fomo",
      name: "FOMO (Fear Of Missing Out)",
      reason:
        "You acted after high-hype, 'don't miss out' content. FOMO pushes us to buy fast so we don't feel left behind — which usually means buying without checking if it's actually a good decision.",
      evidence,
    });
  }

  // -------------------------------------------------------------------------
  // 2) Herding — following the crowd
  // -------------------------------------------------------------------------
  const crowdWords = ["everyone", "the crowd", "my group", "all my friends", "everybody"];
  const herdPosts = influenced.filter((e) => hasAny(e.post.text, crowdWords));
  if (herdPosts.length >= 1) {
    found.push({
      key: "herding",
      name: "Herding",
      reason:
        "You were influenced by posts that say 'everyone is buying this'. Herding is copying the crowd instead of deciding for yourself. The crowd is often wrong, and by the time everyone's in, the easy gains are usually gone.",
      evidence: herdPosts.map((e) => `Crowd-style post by ${e.post.author} marked as influential.`),
    });
  }

  // -------------------------------------------------------------------------
  // 3) Loss aversion — fear of losing dominates decisions
  // -------------------------------------------------------------------------
  const lossWords = [
    "sell now",
    "before it drops",
    "before it crashes",
    "crash",
    "panic",
    "don't lose",
    "dont lose",
    "cut your losses",
    "get out now",
    "dump",
  ];
  const lossPosts = engagements.filter(
    (e) => (e.influenced || e.trade || e.anxious) && hasAny(e.post.text, lossWords)
  );
  // Feeling anxious about ANY scare/panic post is itself a loss-aversion signal.
  const anxiousPanic = engagements.filter((e) => e.anxious && hasAny(e.post.text, lossWords));
  if (lossPosts.length >= 1 || anxiousPanic.length >= 1) {
    found.push({
      key: "loss-aversion",
      name: "Loss aversion",
      reason:
        "You reacted to 'sell before it crashes / don't lose it all' content. Losing feels about twice as painful as an equal gain feels good, so fear can make us panic-sell at the worst time. Reacting to scare-posts locks in losses.",
      evidence: lossPosts.map((e) => `Fear/panic post by ${e.post.author} you reacted to.`),
    });
  }

  // -------------------------------------------------------------------------
  // 4) Recency bias — over-weighting what just happened (spending bursts)
  // -------------------------------------------------------------------------
  const recentExpenses = expenses.filter((e) => ageMs(e.createdAt) <= 2 * DAY);
  if (recentExpenses.length >= 3) {
    const total = recentExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    found.push({
      key: "recency",
      name: "Recency bias",
      reason:
        "You made several purchases in a very short window. Recency bias makes the latest event feel like the most important one, so a burst of recent posts/buys can feel 'normal' when it isn't. Zooming out to the monthly picture helps.",
      evidence: [`${recentExpenses.length} purchases totaling ₹${total} in the last 2 days.`],
    });
  }

  // -------------------------------------------------------------------------
  // 5) Anchoring — fixating on "was ₹999 now ₹499" style prices
  // -------------------------------------------------------------------------
  const anchorExpenses = expenses.filter(
    (e) => looksLikeAnchorPrice(e.note) || (e.linkedPost && looksLikeAnchorPrice(e.linkedPost.text))
  );
  if (anchorExpenses.length >= 1) {
    found.push({
      key: "anchoring",
      name: "Anchoring",
      reason:
        "A 'was ₹999, now ₹499' price made the deal feel great. Anchoring is judging a price against the FIRST number you saw instead of the item's real value. The 'before' price is often inflated just to make the discount look bigger.",
      evidence: anchorExpenses.map(
        (e) => `Purchase "${e.category}" (₹${e.amount}) tied to a discount/anchor price.`
      ),
    });
  }

  // -------------------------------------------------------------------------
  // 6) Impulse / doomscroll-triggered spending
  // -------------------------------------------------------------------------
  const impulseWords = ["saw", "reel", "ad", "scroll", "scrolling", "post", "insta", "story"];
  const impulseSpends = expenses.filter(
    (e) =>
      (e.linkedPost && (e.linkedPost.tag === "hype" || e.linkedPost.tag === "scam-risk")) ||
      hasAny(e.note, impulseWords)
  );
  if (impulseSpends.length >= 1) {
    found.push({
      key: "impulse",
      name: "Impulse / doomscroll spending",
      reason:
        "Some purchases were triggered directly by scrolling the feed rather than a planned need. Endless scrolling lowers self-control, so a single reel can turn into a buy within minutes — the classic impulse purchase.",
      evidence: impulseSpends.map(
        (e) => `Impulse buy "${e.category}" (₹${e.amount}) traced back to the feed.`
      ),
    });
  }

  // -------------------------------------------------------------------------
  // 7) Knowledge gap (low financial literacy)
  // You marked posts as "didn't fully understand" — especially risky if you
  // were also influenced by or acted on them.
  // -------------------------------------------------------------------------
  const confusedPosts = engagements.filter((e) => e.confused);
  const confusedAndActed = confusedPosts.filter((e) => e.influenced || e.trade);
  if (confusedPosts.length >= 1) {
    const evidence = confusedAndActed.map(
      (e) => `You were influenced by a post you didn't fully understand (${e.post.author}).`
    );
    if (evidence.length === 0) {
      evidence.push(`You flagged ${confusedPosts.length} post(s) as hard to understand.`);
    }
    found.push({
      key: "knowledge-gap",
      name: "Knowledge gap (low financial literacy)",
      reason:
        "You marked finance content as hard to understand. Acting on tips you don't fully understand (stocks, crypto, jargon) is one of the biggest risks — it's how people get pulled into hype and scams. Building basic financial literacy is the strongest long-term protection.",
      evidence,
    });
  }

  return found;
}
