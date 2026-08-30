// ===========================================================================
// design.js — study design switches
// ---------------------------------------------------------------------------
// Turn measurement blocks on or off in one place. Every switch trades
// completion time against what the thesis can claim, and the comment on each
// says which. Change these BEFORE recruitment, not during — altering the
// instrument mid-collection makes the waves non-comparable.
//
// Presets are at the bottom.
// ===========================================================================

export const DESIGN = {
  // --- Core: always on ----------------------------------------------------
  // SMFI, the ten behavioural biases, financial well-being and financial
  // literacy are the backbone of the model and are not switchable.

  // =========================================================================
  // MINDFULNESS — OFF at the researcher's instruction (August 2026).
  // -------------------------------------------------------------------------
  // ⚠️ READ THIS BEFORE RECRUITING. The approved thesis title is "Social Media
  // Influence and Financial Well-Being: Exploring the Role of Mindfulness
  // within a Behavioural Finance Framework", and objectives 4 and 5 are about
  // mindfulness as a mediator and moderator. With these four flags off, the
  // instrument collects NO mindfulness data, so those objectives cannot be
  // answered and the title no longer describes the study.
  //
  // The blocks are switched off rather than deleted. Setting any flag back to
  // true restores the screens, the scoring, the export columns and the
  // analysis syntax with no other change required.
  // =========================================================================
  finMindfulness: false,   // Garbinsky et al. (2025) Financial Mindfulness, 8 items
  stateMindfulness: false, // State MAAS after the feed, 5 items
  meditation: false,       // Meditation practice history, 3 items
  traitMindfulness: false, // MAAS-15 (Brown & Ryan, 2003)
  maasShortForm: false,

  // =========================================================================
  // BEHAVIOUR COVARIATES — OFF at the researcher's instruction.
  // Buying Impulsiveness was the proximal behavioural mediator between bias
  // and well-being; Brief Self-Control was the confound control for
  // mindfulness. With mindfulness gone, the self-control covariate loses its
  // main purpose, so switching both off is internally consistent.
  // =========================================================================
  impulsiveness: false,
  selfControl: false,

  /**
   * WELL-BEING INSTRUMENT.
   * "netemeyer" — Perceived Financial Well-Being Scale, 10 items, on the SAME
   *               5-point agreement scale as every other block. DEFAULT.
   * "cfpb"      — CFPB Financial Well-Being Scale, its own two published
   *               anchor sets and IRT scoring.
   * "both"      — both administered, 20 items, order counterbalanced.
   *
   * WHY NETEMEYER IS THE DEFAULT. The requirement is a single agreement
   * metric across the whole instrument. Netemeyer et al. (2018) was built on
   * a five-point strongly-disagree to strongly-agree scale, so it satisfies
   * that with no re-anchoring at all, and it is two-dimensional — which
   * separates present money stress from expected future security.
   *
   * WHY NOT CFPB. Not because it is weaker — it is the better-normed
   * instrument. Because it cannot be put on an agreement scale and remain
   * itself: its 0–100 score comes from an IRT calibration keyed to its own
   * anchors ("Describes me completely…", "Always…Never"). Re-anchoring the
   * items to agreement voids the scoring tables and every published norm,
   * leaving ten items with no validated way to score them. Given a forced
   * choice between one metric throughout and the CFPB norms, this build
   * takes the single metric.
   *
   * Set "cfpb" or "both" here to change that; everything downstream —
   * scoring, export columns, codebook, analysis syntax — follows the flag.
   */
  wellbeingScale: "netemeyer",

  /** Financial knowledge quiz can be skipped by the participant. */
  literacySkippable: true,

  /**
   * THE SIMULATED FEED and its randomised arms.
   *
   * Off = a pure questionnaire study, ~4 minutes shorter, no experiment to
   * defend, and no behavioural or causal claims. On = the strongest part of
   * the design.
   */
  feed: true,
  randomiseArms: true,
};

// ---------------------------------------------------------------------------
// Presets — copy one over DESIGN above.
// ---------------------------------------------------------------------------
export const PRESETS = {
  /** CURRENT BUILD. ~65 items, ~10 minutes. One agreement metric throughout. */
  current: {
    finMindfulness: false, stateMindfulness: false, meditation: false,
    traitMindfulness: false, maasShortForm: false,
    impulsiveness: false, selfControl: false,
    wellbeingScale: "netemeyer", literacySkippable: true,
    feed: true, randomiseArms: true,
  },

  /** Everything, including mindfulness. ~118 items, ~20 minutes. */
  full: {
    finMindfulness: true, stateMindfulness: true, meditation: true,
    traitMindfulness: true, maasShortForm: false,
    impulsiveness: true, selfControl: true,
    wellbeingScale: "cfpb", literacySkippable: false,
    feed: true, randomiseArms: true,
  },

  /**
   * Restores just enough mindfulness to answer objectives 4 and 5, without
   * bringing back the whole battery. ~68 items, ~12 minutes.
   */
  mindfulnessMinimal: {
    finMindfulness: true, stateMindfulness: false, meditation: false,
    traitMindfulness: false, maasShortForm: false,
    impulsiveness: false, selfControl: false,
    wellbeingScale: "netemeyer", literacySkippable: true,
    feed: true, randomiseArms: true,
  },
};
