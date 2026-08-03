// ===========================================================================
// flow.js — the assessment journey definition
// ---------------------------------------------------------------------------
// One place that defines the order of screens, what each screen contains, and
// how progress is computed. The UI reads this; it holds no content of its own.
// ===========================================================================

import { SM_USE, SMFI, BIAS_BLOCKS, BIAS_CONSTRUCTS, MAAS, CFPB, LITERACY } from "./instruments.js";
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
  note: "Demographic covariates. Every item can be skipped.",
  items: [
    { id: "gender", type: "choice", q: "Gender", options: ["Woman", "Man", "Non-binary / another gender", "Prefer not to say"] },
    { id: "education", type: "choice", q: "Highest level of education completed", options: ["School", "Diploma", "Bachelor's degree", "Master's degree", "Doctorate", "Prefer not to say"] },
    { id: "occupation", type: "choice", q: "Current occupation", options: ["Student", "Salaried employee", "Self-employed / business owner", "Freelance / gig work", "Homemaker", "Retired", "Not currently working", "Prefer not to say"] },
    { id: "income", type: "choice", q: "Approximate monthly household income", options: ["Below ₹25,000", "₹25,000 – ₹50,000", "₹50,001 – ₹1,00,000", "₹1,00,001 – ₹2,00,000", "Above ₹2,00,000", "Prefer not to say"] },
    { id: "city", type: "choice", q: "Where do you live?", options: ["Metro city", "Tier-2 city", "Tier-3 city / town", "Rural area", "Prefer not to say"] },
    { id: "investor", type: "choice", q: "Which best describes you as an investor?", options: ["I don't invest yet", "New — less than 1 year", "1–3 years", "3–7 years", "More than 7 years"] },
    { id: "products", type: "multi", q: "Which of these do you currently hold?", options: ["Savings only", "Fixed deposits", "Mutual funds / SIP", "Direct stocks", "Gold", "Crypto", "Insurance-linked plans", "None of these"] },
  ],
};

// --- Consent ----------------------------------------------------------------
export const CONSENT = {
  id: "consent",
  title: "Your consent",
  icon: "📄",
  sections: [
    { h: "What this study is about", p: "This study looks at how social media relates to the way people make financial decisions, and how mindfulness and financial knowledge fit into that picture. It is part of doctoral research." },
    { h: "What you will do", p: "You will answer a set of questionnaires, react to a short simulated social media feed, and answer five knowledge questions. It takes about 12–15 minutes." },
    { h: "Voluntary participation", p: "Taking part is entirely voluntary. You may stop at any point and close the page. Nothing you have entered will be submitted unless you reach the end and choose to submit." },
    { h: "Confidentiality", p: "Responses are anonymous. We do not collect your name, email, phone number or IP address. A random participant code is generated in your browser so your answers can be linked across sections and, if you choose, across repeat visits." },
    { h: "Risks and benefits", p: "There are no known risks beyond mild reflection on your own money habits. At the end you receive a personalised report. This report is educational and is not financial advice." },
    { h: "The simulated feed", p: "The posts you will see are fictional. Handles, funds and companies are invented. No real security is being promoted or criticised." },
    { h: "Data use", p: "Anonymous responses will be analysed and reported in aggregate in a doctoral thesis and possible academic publications. Data are stored securely and are not sold or shared for marketing." },
    { h: "Withdrawing after you finish", p: `You can withdraw your responses at any time, without giving a reason. Your participant code is shown on the results page and is the only way to identify your data — keep it if you may want to withdraw later. Requests are actioned within ${ETHICS.erasureResponseDays} days.` },
    { h: "How long data are kept", p: `Anonymous responses are retained for ${ETHICS.retentionYears} years after the study concludes and are then deleted. Aggregate results already published cannot be withdrawn.` },
    { h: "One thing you will be told at the end", p: "There is one aspect of the design we cannot describe beforehand without changing how you respond. It is explained in full as soon as you finish, and nothing about it puts you at any risk. You can withdraw your data at that point if you would rather not take part on that basis." },
    {
      h: "Who to contact",
      p: isConfigured()
        ? `Researcher: ${ETHICS.researcher}, ${ETHICS.institution} (${ETHICS.researcherEmail}). Supervisor: ${ETHICS.supervisor}. For questions about your rights as a research participant, contact ${ETHICS.ethicsCommittee} at ${ETHICS.ethicsContact}, quoting approval reference ${ETHICS.ethicsRef}.`
        : "⚠️ PILOT MODE — contact details are not yet configured, and this build is not approved for live data collection.",
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
export function buildJourney() {
  const steps = [];

  steps.push({ id: "welcome", kind: "welcome", chrome: false });
  steps.push({ id: "about", kind: "about", chrome: false });
  steps.push({ id: "consent", kind: "consent", chrome: false });
  steps.push({ id: "eligibility", kind: "gate", block: ELIGIBILITY, chrome: false });

  steps.push({ id: "profile", kind: "choices", block: PROFILE, section: "Profile", icon: "👤" });
  steps.push({ id: "smuse", kind: "choices", block: SM_USE, section: "Social media", icon: "📱" });

  steps.push({
    id: "smfi", kind: "likert", section: "Social media", icon: "📲",
    title: SMFI.title,
    intro: "There are no right answers. Choose what is closest to your usual experience.",
    scale: "agree5",
    items: SMFI.items,
    layout: "matrix",
    // Newly developed scale — no published item order to preserve, so items are
    // randomised per participant to guard against order and fatigue effects.
    randomise: true,
  });

  // Behavioural biases on TWO pages rather than four, using a compact matrix.
  // Constructs keep their plain-language headings within each page, so the
  // grouping is still visible without costing an extra screen each.
  const PAGES = [
    {
      id: "bias_a",
      title: "How you decide, and how you read information",
      icon: "🧭",
      blocks: ["decisionStyle", "informationProcessing"],
    },
    {
      id: "bias_b",
      title: "Confidence, risk and reference points",
      icon: "🎯",
      blocks: ["confidence", "risk"],
    },
  ];

  for (const page of PAGES) {
    const constructs = page.blocks
      .flatMap((bid) => BIAS_BLOCKS.find((b) => b.id === bid).constructs)
      .map((k) => BIAS_CONSTRUCTS[k]);
    steps.push({
      id: page.id,
      kind: "likert",
      layout: "matrix",
      section: "How you decide",
      icon: page.icon,
      title: page.title,
      intro:
        "There are no right answers — choose what is closest to how you usually behave. One tap per row.",
      groups: constructs.map((c) => ({
        id: c.id,
        heading: c.plainName,
        prompt: c.prompt || null,
        scale: c.scale,
        items: c.items,
      })),
      randomise: true,
    });
  }

  steps.push({ id: "feed", kind: "feed", section: "The feed", icon: "📰" });

  steps.push({
    id: "maas", kind: "likert", section: "Mindfulness", icon: "🌱",
    title: MAAS.title,
    intro: "Below is a collection of statements about your everyday experience. Please answer according to what really reflects your experience rather than what you think it should be.",
    scale: "maas6",
    items: MAAS.items,
    layout: "matrix",
    // NOT randomised. The MAAS is validated and normed in its published order,
    // and its reported reliability applies to that order. Randomising it would
    // trade a real psychometric guarantee for a marginal fatigue benefit.
    randomise: false,
  });

  steps.push({
    id: "cfpb", kind: "cfpb", section: "Well-being", icon: "💰",
    title: CFPB.title,
    items: CFPB.items,
  });

  steps.push({
    id: "literacy", kind: "quiz", section: "Knowledge", icon: "🧾",
    title: LITERACY.title,
    intro: "Five short questions. If you are not sure, please choose 'Do not know' rather than guessing — that is useful information for us.",
    items: LITERACY.items,
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
