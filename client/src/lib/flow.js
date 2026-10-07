// ===========================================================================
// flow.js — the assessment journey definition
// ---------------------------------------------------------------------------
// One place that defines the order of screens, what each screen contains, and
// how progress is computed. The UI reads this; it holds no content of its own.
// ===========================================================================

import {
  SM_USE, SMI, SMFI_CRITERION, BIAS_BLOCKS, BIAS_CONSTRUCTS, MAAS, CFPB, FWB, LITERACY,
  FIN_MINDFULNESS, STATE_MAAS, IMPULSIVENESS, SELF_CONTROL, MEDITATION,
  citationsFor, biasSourceKeys,
} from "./instruments.js";
import { DESIGN } from "./design.js";
import { hashString } from "./scenarios.js";
import { ETHICS, isConfigured } from "./ethics.js";

// --- Eligibility (screening) ------------------------------------------------
export const ELIGIBILITY = {
  id: "eligibility",
  title: "Two quick checks",
  icon: "✅",
  items: [
    {
      id: "elig_age", type: "choice", required: true,
      q: "How old are you?",
      options: ["Under 18", "18–24", "25–34", "35–44", "45–54", "55–64", "65 or above"],
      disqualify: ["Under 18"],
    },
    {
      id: "elig_social", type: "choice", required: true,
      q: "Do you use social media at least once a week?",
      options: ["Yes", "No"],
      disqualify: ["No"],
    },
    {
      id: "elig_decisions", type: "choice", required: true,
      q: "Do you make or share in decisions about your own money — spending, saving or investing?",
      options: ["Yes, I decide on my own", "Yes, jointly with family", "No, someone else decides for me"],
      disqualify: ["No, someone else decides for me"],
    },
  ],
  ineligibleMessage:
    "Thank you for your interest. This study is designed for adults who use social media and take part in their own financial decisions, so we are not able to include your responses. You are very welcome to explore the learning section.",
};

// --- Participant profile ----------------------------------------------------
export const PROFILE = {
  id: "profile",
  title: "About you",
  icon: "👤",
  // "Prefer not to say" removed from education, occupation and income at the
  // researcher's instruction. Those three items remain OPTIONAL — a
  // participant can move on without answering. That matters: removing the
  // opt-out and then forcing an answer would make a participant who does not
  // want to disclose their income pick a bracket at random, which is worse
  // than a blank, because a blank is visibly missing and a wrong bracket is
  // not. Only gender, age and location are required, because the recruitment
  // quota cannot place a participant without them.
  note: "A few details about you, so the sample stays balanced across the groups we are recruiting.",
  sourceLine: "Standard demographic covariates. Income bands follow the NCAER/Indian household survey convention; settlement classes follow the RBI Tier-1 to Tier-4 classification.",
  items: [
    // Required, and only three options, because gender drives a recruitment
    // quota (300 male / 300 female). A "prefer not to say" response cannot be
    // assigned to a quota cell, so it is not offered here.
    { id: "gender", type: "choice", required: true, q: "Gender", options: ["Male", "Female", "Other"] },
    { id: "education", type: "choice", q: "Highest level of education completed", options: ["School", "Diploma", "Bachelor's degree", "Master's degree", "Professional degree (CA, CS, CFA, MBBS, LLB, B.Ed, etc.)", "Doctorate"] },
    { id: "occupation", type: "choice", q: "Current occupation", options: ["Student", "Salaried employee", "Self-employed / business owner", "Freelance / gig work", "Homemaker", "Retired", "Not currently working"] },
    { id: "income", type: "choice", q: "Approximate monthly household income", options: ["Below ₹25,000", "₹25,000 – ₹50,000", "₹50,001 – ₹1,00,000", "₹1,00,001 – ₹2,00,000", "Above ₹2,00,000"] },
    // Required — drives the location quota.
    { id: "city", type: "choice", required: true, q: "Where do you live?", options: ["Metro / Tier-1 city", "Tier-2 city", "Tier-3 or Tier-4 town", "Rural area"] },
    { id: "investor", type: "choice", q: "Which best describes you as an investor?", options: ["I don't invest yet", "New — less than 1 year", "1–3 years", "3–7 years", "More than 7 years"] },
  ],
};

// --- Consent ----------------------------------------------------------------
export const CONSENT = {
  id: "consent",
  title: "Your consent",
  icon: "📄",
  /**
   * A FUNCTION, not a frozen array. Governance details arrive from the server
   * at boot, which happens after this module is evaluated — building the
   * sections eagerly would bake in the pilot-mode text even once the real
   * contact details are configured.
   */
  getSections: () => [
    { h: "What this study is about", p: "This study looks at how social media relates to the way people make financial decisions, and how that connects to financial well-being. It is part of doctoral research at MNIT Jaipur." },
    { h: "What you will do", p: "You will answer a set of questionnaires and react to a short simulated social media feed. There is also an optional five-question financial knowledge section, which you can skip. It takes about 8–12 minutes." },
    { h: "Voluntary participation", p: "Taking part is entirely voluntary. You may stop at any point and close the page. Nothing you have entered will be submitted unless you reach the end and choose to submit." },
    { h: "Confidentiality", p: "Responses are anonymous. We do not collect your name, email, phone number or IP address. A random participant code is generated in your browser so your answers can be linked across sections and, if you choose, across repeat visits." },
    { h: "Risks and benefits", p: "There are no known risks beyond mild reflection on your own money habits. At the end you receive a personalised report. This report is educational and is not financial advice." },
    { h: "The simulated feed", p: "The posts you will see are fictional. Handles, funds and companies are invented. No real security is being promoted or criticised." },
    { h: "Data use", p: "Anonymous responses will be analysed and reported in aggregate in a doctoral thesis and possible academic publications. Data are stored securely and are not sold or shared for marketing." },
    { h: "Withdrawing after you finish", p: `You can withdraw your responses at any time, without giving a reason. Your participant code is shown on the results page and is the only way to identify your data — keep it if you may want to withdraw later. Requests are actioned within ${ETHICS.erasureResponseDays} days.` },
    { h: "How long data are kept", p: `Anonymous responses are retained for ${ETHICS.retentionYears} years after the study concludes and are then deleted. Aggregate results already published cannot be withdrawn.` },
    {
      h: "Who to contact",
      // Three separate routes, in order of who a participant would want first.
      // The rights contact is deliberately NOT the researcher or supervisor.
      p: isConfigured()
        ? `About the study, or to withdraw your data — ${ETHICS.researcher}, ${ETHICS.institution}, ${ETHICS.researcherEmail}. `
          + `Supervisor — ${ETHICS.supervisor}${ETHICS.supervisorEmail ? `, ${ETHICS.supervisorEmail}` : ""}.`
        : "⚠️ PILOT MODE — contact details are not yet configured, and this build is not approved for live data collection.",
    },
    {
      // Approval body and its members, stated plainly. No individual is
      // singled out as a complaints route: the committee's own addresses are
      // listed, and the researcher and supervisor appear in the section
      // above, so a participant with a concern still has somewhere to write.
      h: "Ethics approval",
      p: isConfigured()
        ? `This study was reviewed and approved by the ${ETHICS.ethicsCommittee}. The committee has ${ETHICS.drecSize} members:`
        : "",
      list: isConfigured()
        ? ETHICS.drecMembers.map((m) => `${m.name} — ${m.role} — ${m.email}`)
        : [],
    },
  ],
  checkboxes: [
    { id: "consent_read", required: true, label: "I have read and understood the information above." },
    { id: "consent_voluntary", required: true, label: "I understand that participation is voluntary and I may stop at any time." },
    { id: "consent_agree", required: true, label: "I agree to take part and for my anonymous responses to be used for research." },
    { id: "consent_recontact", required: false, label: "Optional: I would like to be able to retake this assessment later and compare my results." },
  ],
};

// ===========================================================================
// THE JOURNEY
// `weight` is the number of screens' worth of effort, used for the progress bar.
// ===========================================================================
export function buildJourney(participantId) {
  const steps = [];

  steps.push({ id: "welcome", kind: "welcome", chrome: false });
  steps.push({ id: "about", kind: "about", chrome: false });
  steps.push({ id: "consent", kind: "consent", chrome: false });
  steps.push({ id: "eligibility", kind: "gate", block: ELIGIBILITY, chrome: false });

  steps.push({ id: "profile", kind: "choices", block: PROFILE, section: "Profile", icon: "👤" });
  steps.push({
    id: "smuse", kind: "choices", block: SM_USE, section: "Social media", icon: "📱",
    // Required: every item feeds the exposure covariates, and a blank here
    // leaves the influence model without a baseline to control for.
    requireAll: true,
  });

  steps.push({
    id: "smi", kind: "likert", section: "Social media influence", icon: "📲",
    title: SMI.title,
    intro: "These are about finance creators — the people who post about money, investing or trading. There are no right answers; choose what is closest to your usual experience.",
    scale: "agree5",
    items: SMI.items,
    layout: "matrix",
    // Newly developed scale — no published item order to preserve, so items are
    // randomised per participant to guard against order and fatigue effects.
    randomise: true,
    // Criterion item, rendered below the matrix on the same page. Never
    // randomised into the matrix and never scored into the SMFI mean — it is
    // the external behaviour the scale has to predict.
    tail: [SMFI_CRITERION],
    tailNote: "One last question about the past year.",
    sourceLine: SMI.sourceLine,
  });

  // ---------------------------------------------------------------------
  // Behavioural biases — two matrix pages under one section label.
  // Page titles are plain-language descriptions of what the participant is
  // being asked about, not construct jargon.
  // ---------------------------------------------------------------------
  // Two pages now, not three — 15 items instead of 34.
  // Page titles are deliberately NEUTRAL. They describe the kind of decision
  // being asked about, never the construct: a participant who is told the
  // block measures "fear of missing out" answers to match the label rather
  // than themselves.
  const PAGES = [
    {
      id: "bias_a",
      title: "When other people are involved",
      icon: "🧭",
      blocks: ["decisionStyle"],
    },
    {
      id: "bias_b",
      title: "How you size things up",
      icon: "🔎",
      blocks: ["judgement"],
    },
  ];
  for (const page of PAGES) {
    const constructIds = page.blocks
      .flatMap((bid) => BIAS_BLOCKS.find((b) => b.id === bid).constructs);
    const constructs = constructIds.map((k) => BIAS_CONSTRUCTS[k]);
    steps.push({
      id: page.id,
      kind: "likert",
      layout: "matrix",
      section: "Your decision-making style",
      icon: page.icon,
      title: page.title,
      intro:
        "There are no right answers — choose what is closest to how you usually behave. One tap per row.",
      // NO HEADING. The construct name is deliberately not shown while the
      // participant answers.
      //
      // This is a measurement decision, not only a cosmetic one. Putting
      // "Following the crowd" above four items that all describe following
      // the crowd tells the participant what is being measured, and people
      // then answer to be consistent with the label rather than with
      // themselves — the consistency motif, one of the standard sources of
      // common-method variance (Podsakoff et al., 2003). Removing the label
      // is one of the cheapest defences against it.
      //
      // The grouping still exists in the data: every item keeps its
      // construct code in the codebook, so scoring and CFA are unaffected.
      groups: constructs.map((c) => ({
        id: c.id,
        heading: null,
        prompt: c.prompt || null,
        scale: c.scale,
        items: c.items,
      })),
      randomise: true,
      citations: citationsFor(biasSourceKeys(constructIds)),
    });
  }

  if (DESIGN.feed) {
    steps.push({ id: "feed", kind: "feed", section: "The feed", icon: "📰" });

    if (DESIGN.stateMindfulness) {
      steps.push({
        id: "stateMaas", kind: "likert", layout: "matrix",
        section: "The feed", icon: STATE_MAAS.icon,
        title: STATE_MAAS.title,
        intro: "Thinking about the last few minutes, while you were going through the feed — how much was each of these true?",
        scale: STATE_MAAS.scale,
        items: STATE_MAAS.items,
        randomise: false,
        sourceLine: "State Mindful Attention Awareness Scale — Brown & Ryan (2003).",
      });
    }
  }

  // ---------------------------------------------------------------------
  // MINDFULNESS — every block is behind a DESIGN flag and all four flags are
  // currently false. See the warning at the top of design.js: with these off
  // the study collects no mindfulness data at all.
  // ---------------------------------------------------------------------
  if (DESIGN.traitMindfulness) {
    steps.push({
      id: "maas", kind: "likert", section: "Mindfulness", icon: "🌱",
      title: MAAS.title,
      intro: "Below is a collection of statements about your everyday experience. Please answer according to what really reflects your experience rather than what you think it should be.",
      scale: "maas6",
      items: DESIGN.maasShortForm
        ? MAAS.items.filter((i) => MAAS.shortForm.items.includes(i.id))
        : MAAS.items,
      layout: "matrix",
      // NOT randomised. The MAAS is validated and normed in its published order.
      randomise: false,
      sourceLine: "Mindful Attention Awareness Scale (MAAS) — Brown & Ryan (2003), Journal of Personality and Social Psychology, 84(4), 822–848.",
    });
  }

  if (DESIGN.finMindfulness) {
    steps.push({
      id: "finMindfulness", kind: "likert", layout: "matrix",
      section: "Mindfulness", icon: FIN_MINDFULNESS.icon,
      title: FIN_MINDFULNESS.title,
      intro: "These are about how you relate to your own money situation.",
      scale: FIN_MINDFULNESS.scale,
      items: FIN_MINDFULNESS.items,
      randomise: true,
      sourceLine: "Financial Mindfulness Scale — Garbinsky, Blanchard & Kim (2025), Personality and Social Psychology Bulletin, 51(9), 1793–1809.",
    });
  }

  if (DESIGN.meditation) {
    steps.push({
      id: "meditation", kind: "choices",
      block: MEDITATION, section: "Mindfulness", icon: MEDITATION.icon,
    });
  }

  // --- Behaviour covariates: off at the researcher's instruction ---------
  if (DESIGN.impulsiveness) {
    steps.push({
      id: "impulsiveness", kind: "likert", layout: "matrix",
      section: "Behaviour", icon: IMPULSIVENESS.icon,
      title: IMPULSIVENESS.title,
      scale: IMPULSIVENESS.scale,
      items: IMPULSIVENESS.items,
      randomise: true,
      sourceLine: "Buying Impulsiveness Scale — Rook & Fisher (1995), Journal of Consumer Research, 22(3), 305–313.",
    });
  }

  if (DESIGN.selfControl) {
    steps.push({
      id: "selfControl", kind: "likert", layout: "matrix",
      section: "Behaviour", icon: SELF_CONTROL.icon,
      title: SELF_CONTROL.title,
      scale: SELF_CONTROL.scale,
      items: SELF_CONTROL.items,
      randomise: true,
      sourceLine: "Brief Self-Control Scale — Tangney, Baumeister & Boone (2004), Journal of Personality, 72(2), 271–324.",
    });
  }

  // --- Financial well-being ---------------------------------------------
  // Two instruments, two frameworks. See FWB_FRAMEWORK in instruments.js.
  //
  // ORDER IS COUNTERBALANCED. Answering ten well-being questions primes the
  // next ten, so a fixed order would confound the comparison between the two
  // instruments with an order effect — and that comparison is the point of
  // administering both. Allocation is deterministic from the participant code,
  // so a refresh keeps the same order and the allocation is reproducible at
  // analysis. The order actually used is stored as `fwb_order`.
  const both = DESIGN.wellbeingScale === "both";
  // When both run, say plainly that the two sets overlap. People who think
  // they are being asked the same thing twice by mistake get irritated and
  // start straightlining — telling them why costs one sentence and protects
  // the data.
  const overlapNote = both
    ? " Some of these will feel close to the previous set. That is deliberate: this study compares two standard measures of financial well-being, so please answer both as honestly as you can."
    : "";
  const wbNetemeyer = {
    id: "fwb", kind: "likert", layout: "matrix",
    section: "Well-being", icon: FWB.icon,
    title: both ? "How you feel about your money situation" : FWB.title,
    intro: "The same agree-to-disagree scale as before. Answer for how things are for you at the moment." + overlapNote,
    scale: FWB.scale,
    items: FWB.items,
    // Published in a fixed two-factor order; kept in that order so the
    // reported factor structure applies.
    randomise: false,
    sourceLine: FWB.sourceLine,
  };
  const wbCfpb = {
    id: "cfpb", kind: "cfpb", section: "Well-being", icon: "💰",
    title: both ? "Your financial well-being (standard scale)" : CFPB.title,
    overlapNote,
    items: CFPB.items,
    sourceLine:
      "CFPB Financial Well-Being Scale (10-item) — Consumer Financial Protection Bureau (2015). Public domain. Reproduced verbatim, with its own published response anchors.",
  };

  if (DESIGN.wellbeingScale === "cfpb") {
    steps.push(wbCfpb);
  } else if (DESIGN.wellbeingScale === "netemeyer") {
    steps.push(wbNetemeyer);
  } else {
    // "both" — counterbalanced.
    const cfpbFirst = hashString(String(participantId || "seed")) % 2 === 1;
    const pair = cfpbFirst ? [wbCfpb, wbNetemeyer] : [wbNetemeyer, wbCfpb];
    pair[0] = { ...pair[0], intro: pair[0].intro, wbOrder: cfpbFirst ? "cfpb_first" : "netemeyer_first" };
    steps.push(pair[0], pair[1]);
  }

  steps.push({
    id: "literacy", kind: "quiz", section: "Knowledge", icon: "🧾",
    title: LITERACY.title,
    intro: "Five short questions. If you are not sure, please choose 'Do not know' rather than guessing — that is useful information for us.",
    items: LITERACY.items,
    skippable: DESIGN.literacySkippable,
    skipLabel: "Skip this section",
    sourceLine: LITERACY.sourceLine,
  });

  steps.push({ id: "results", kind: "results", chrome: false });

  return steps;
}

/** Percent complete, excluding the pre-assessment and results screens. */
export function progressFor(steps, index) {
  const scored = steps.filter((s) => s.chrome !== false);
  const done = steps.slice(0, index).filter((s) => s.chrome !== false).length;
  return scored.length ? Math.round((done / scored.length) * 100) : 0;
}
