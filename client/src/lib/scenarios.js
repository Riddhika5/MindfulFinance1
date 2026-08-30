// ===========================================================================
// scenarios.js — the Simulated Social Media Feed (SSMF) module
// ---------------------------------------------------------------------------
// Paradigm precedents:
//   • Ontario Securities Commission & The Decision Lab (2024) — simulated feed
//     + simulated trading RCT, N = 1,465. 38% of participants exposed to
//     un-intervened finance posts bought the promoted asset vs 8% of controls.
//   • Sherman et al. (2016, Psychological Science) — simulated Instagram feed
//     with experimentally manipulated like-counts.
//   • Kuerzinger & Stangor (2024, JBEF) — synthetic-post exposure with
//     mediation analysis.
//
// Design notes:
//   1. Every post is FICTIONAL. Tickers, funds and handles are invented so no
//      real security is promoted. This is an ethics requirement, not a style
//      choice.
//   2. Engagement metrics (likes, comments) are experimentally manipulated:
//      each participant sees either HIGH or LOW social proof for the same post
//      content, randomised within participant across trials.
//   3. Reason codes map onto bias constructs but are EXPLORATORY behavioural
//      indicators. They are reported separately from the validated scale
//      scores and are not used in the confirmatory measurement model.
// ===========================================================================

export const REASON_CODES = {
  crowd: { label: "A lot of people seem to be doing it", maps: "herding" },
  missOut: { label: "I don't want to miss the opportunity", maps: "fomo" },
  trustCreator: { label: "I trust the person posting it", maps: "credibility" },
  pastReturns: { label: "The past returns look strong", maps: "representativeness" },
  seenBefore: { label: "I've seen this come up a lot recently", maps: "availability" },
  matchesView: { label: "It fits what I already believed", maps: "confirmation" },
  confident: { label: "I'm confident I can judge this myself", maps: "overprecision" },
  avoidLoss: { label: "I'm worried about losing what I have", maps: "lossAversion" },
  priceDrop: { label: "It looks cheap compared to before", maps: "anchoring" },
  needEvidence: { label: "I want independent evidence first", maps: "deliberation" },
};

/**
 * Each trial presents one post. `socialProof` is assigned at runtime:
 *   high → large like/comment counts + "trending" chip
 *   low  → small counts, no chip
 * This is the within-participant manipulation.
 */
export const FEED_POSTS = [
  {
    id: "p1",
    targetBias: "herding",
    handle: "@wealth.with.rhea",
    avatar: "🦋",
    verified: true,
    kind: "reel",
    body: "Everyone in my community is moving into the NovaGrowth Flexi Fund this month. 35% last year. I'm going all in. 🚀",
    disclosure: null,
    tag: "hype",
  },
  {
    id: "p2",
    targetBias: "fomo",
    handle: "@fastlane.finance",
    avatar: "⚡",
    verified: false,
    kind: "story",
    body: "LAST 6 HOURS to enter the pre-listing round. After tonight the price doubles. Don't say I didn't tell you. ⏳",
    disclosure: null,
    tag: "urgency",
  },
  {
    id: "p3",
    targetBias: "representativeness",
    handle: "@chartsdaily",
    avatar: "📈",
    verified: true,
    kind: "post",
    body: "ZentraTech has gone up 4 quarters in a row. Same setup as the last three multibaggers. You know what happens next.",
    disclosure: null,
    tag: "pattern",
  },
  {
    id: "p4",
    targetBias: "anchoring",
    handle: "@deal.radar",
    avatar: "🏷️",
    verified: false,
    kind: "post",
    body: "This stock was ₹1,240 in January. It's ₹610 today. Half price. How is nobody talking about this?",
    disclosure: null,
    tag: "anchor",
  },
  {
    id: "p5",
    targetBias: "lossAversion",
    handle: "@marketpanic",
    avatar: "🚨",
    verified: false,
    kind: "reel",
    body: "Get out NOW. My analysis says a 30% correction is coming this week. Protect your capital before Monday.",
    disclosure: null,
    tag: "fear",
  },
  {
    id: "p6",
    targetBias: "overprecision",
    handle: "@quantkid",
    avatar: "🧮",
    verified: true,
    kind: "post",
    body: "I've back-tested this across 14 years of data. The model is right 91% of the time. There's no real risk here.",
    disclosure: null,
    tag: "authority",
  },
  {
    id: "p7",
    targetBias: "confirmation",
    handle: "@bulls.only.india",
    avatar: "🐂",
    verified: false,
    kind: "post",
    body: "Reminder: markets ONLY go up over 10 years. Anyone posting bearish takes is just trying to get engagement. Mute them.",
    disclosure: null,
    tag: "echo",
  },
  {
    id: "p8",
    targetBias: "availability",
    handle: "@moneystories",
    avatar: "💬",
    verified: false,
    kind: "reel",
    body: "Third person this week telling me they made ₹8 lakh on this one trade. This is clearly where the money is right now.",
    disclosure: null,
    tag: "vividness",
  },
  // --- Control / calm posts. Needed so action rate is interpretable against a
  //     baseline, following the OSC (2024) control-arm design. ---
  {
    id: "p9",
    targetBias: null,
    handle: "@sebi_investor_edu",
    avatar: "🏛️",
    verified: true,
    kind: "post",
    body: "Before you invest, check whether the person recommending a product is registered, and whether they are paid to promote it.",
    disclosure: "Educational",
    tag: "calm",
  },
  {
    id: "p10",
    targetBias: null,
    handle: "@slowmoney.co",
    avatar: "🌿",
    verified: false,
    kind: "post",
    body: "Boring update: I added the same amount to the same index fund I've been adding to for 3 years. No screenshot needed.",
    disclosure: null,
    tag: "calm",
  },
];

/**
 * Decision options presented for each post.
 * Three-way by design: a forced yes/no would push undecided participants into
 * one of the two extremes and lose the most interesting response — the one
 * where someone wants more evidence before committing.
 */
export const DECISIONS = [
  { id: "invest", label: "Yes — I'd act on this", icon: "💸" },
  { id: "verify", label: "I need more information", icon: "🔍" },
  { id: "scroll", label: "No — I'd scroll past", icon: "👋" },
];

// ===========================================================================
// EXPERIMENTAL ARMS
// Participants are randomised at session start. This is the intervention layer
// of the Assess → Analyse → Improve design.
// ===========================================================================
export const ARMS = {
  control: {
    id: "control",
    label: "Standard feed",
    description: "The feed is shown as it is, with no banner or extra screen attached to any post.",
  },
};

// ---------------------------------------------------------------------------
// RETIRED ARMS — kept for the record, not administered.
//
//   disclosure   — a "this may be a paid promotion" banner on each promotional
//                  post. REMOVED at the researcher's instruction: nothing in
//                  this study is paid or sponsored, so a banner implying that
//                  it might be would have been inaccurate.
//   prebunk      — an inoculation screen shown BEFORE the feed. Removed
//                  because the feed was to be a single screen.
//   mindfulPause — a 10-second forced delay before a decision was confirmed.
//                  Removed with the rest of the mindfulness layer.
//
// ⚠️ CONSEQUENCE. With only one arm left there is no longer a randomised
// manipulation, so the study is no longer an experiment. The feed still
// yields behavioural measures — what people would do, how fast, and whether
// they checked — but any BETWEEN-GROUP causal claim is gone. The design must
// now be described as a cross-sectional survey with an embedded behavioural
// task, not as a randomised experiment.
//
// It also means the study no longer withholds anything from participants, so
// the consent form's "one thing you will be told at the end" clause and the
// deception section of the debrief have been removed rather than left in
// place describing something that no longer happens.
// ---------------------------------------------------------------------------
export const RETIRED_ARMS = {
  disclosure: { id: "disclosure", label: "Disclosure banner", showDisclosure: true },
  prebunk: { id: "prebunk", label: "Prebunking", showPrebunk: true },
  mindfulPause: { id: "mindfulPause", label: "Mindful pause", showPause: true, pauseSeconds: 10 },
};

/**
 * Deterministic randomisation from the participant ID, so a participant who
 * refreshes the page stays in the same arm and sees the same social-proof
 * assignment. Reproducible allocation is an analysis requirement.
 */
export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function assignArm(participantId) {
  const keys = Object.keys(ARMS);
  return keys[hashString(participantId) % keys.length];
}

/** Within-participant social-proof assignment, balanced across posts. */
export function buildFeedTrials(participantId) {
  const h = hashString(participantId + "|feed");
  return FEED_POSTS.map((post, i) => {
    const high = ((h >> i) & 1) === 1;
    return {
      ...post,
      socialProof: high ? "high" : "low",
      metrics: high
        ? { likes: 12400 + ((h + i * 137) % 5000), comments: 830 + ((h + i * 31) % 400), trending: true }
        : { likes: 31 + ((h + i * 17) % 40), comments: 2 + ((h + i * 7) % 6), trending: false },
    };
  });
}
