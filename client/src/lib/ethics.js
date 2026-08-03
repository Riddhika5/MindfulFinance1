// ===========================================================================
// ethics.js — research governance configuration and participant safeguards
// ---------------------------------------------------------------------------
// ⚠️ FILL THIS IN BEFORE COLLECTING ANY REAL DATA.
//
// Until every field marked REQUIRED is completed, the app runs in PILOT MODE:
// participants see a clear banner, and the "contribute to research" button is
// disabled so nothing can be collected under placeholder consent. That guard is
// deliberate — an ethics reference invented to make a form look finished is
// worse than an empty field, because nobody catches it later.
// ===========================================================================

export const ETHICS = {
  // --- REQUIRED -----------------------------------------------------------
  institution: "",          // e.g. "Department of Commerce, University of X"
  researcher: "",           // your name
  researcherEmail: "",      // an address you will actually monitor
  supervisor: "",           // supervisor's name and title
  supervisorEmail: "",
  ethicsCommittee: "",      // e.g. "Institutional Ethics Committee, University of X"
  ethicsRef: "",            // approval reference number
  ethicsContact: "",        // Member Secretary email — ICMR practice requires a
                            // route for questions about participant rights that
                            // does NOT go through the researcher

  // --- Data governance ----------------------------------------------------
  // ICMR (2017) sets 3 years as the floor for non-regulatory health research.
  retentionYears: 5,
  // The Digital Personal Data Protection Rules, 2025 carry a right to erasure
  // with a 90-day response obligation and no research exemption.
  erasureResponseDays: 90,
};

/** True only when every governance field is filled in. */
export function isConfigured() {
  const required = [
    "institution", "researcher", "researcherEmail", "supervisor",
    "ethicsCommittee", "ethicsRef", "ethicsContact",
  ];
  return required.every((k) => String(ETHICS[k] || "").trim().length > 0);
}

// ===========================================================================
// Support signposting
// ---------------------------------------------------------------------------
// This assessment asks people whether they are "just getting by financially"
// and whether their "finances control their life". Some participants will be in
// genuine hardship. A study that asks those questions and offers nothing back
// is not a neutral act.
//
// ⚠️ DIAL-TEST EVERY NUMBER BEFORE LAUNCH, and re-check at each recruitment
// wave. A wrong helpline number is worse than no helpline number.
//
// Verified at build time from the organisations' own sites, government sources,
// or peer-reviewed reporting. Deliberately excluded: commercial "debt
// settlement" firms, which dominate search results for financial distress in
// India and charge fees. Signposting those from a study of financial hardship
// would be an ethics failure.
// ===========================================================================
export const SUPPORT = {
  emotional: [
    {
      name: "Tele-MANAS",
      contact: "14416",
      alt: "1-800-891-4416",
      hours: "24×7",
      note: "Government of India national tele-mental health service, 20+ languages. Free.",
    },
    {
      name: "Vandrevala Foundation",
      contact: "+91 99996 66555",
      hours: "24×7",
      note: "Phone and WhatsApp. Free.",
    },
    {
      name: "AASRA",
      contact: "+91 22 2754 6669",
      hours: "24×7",
      note: "Free. Use this landline — a mobile number circulates widely that does not appear on their own site.",
    },
    {
      name: "iCALL (TISS)",
      contact: "9152987821",
      hours: "Mon–Sat, 10:00–20:00",
      note: "Free counselling by trained professionals. Not a 24-hour service.",
    },
  ],
  financial: [
    {
      name: "RBI Complaint Management System",
      contact: "14448",
      url: "https://cms.rbi.org.in",
      note: "Free. For grievances against banks, NBFCs and credit information companies — mis-selling, wrongful charges, recovery-agent harassment. Filing costs nothing.",
    },
    {
      name: "SEBI SCORES",
      contact: "1800 266 7575",
      url: "https://scores.sebi.gov.in",
      note: "Free. For complaints about listed companies, brokers and registered intermediaries.",
    },
  ],
  // Stated plainly rather than papered over: India has ~2,400 RBI-linked
  // Centres for Financial Literacy, but they run awareness programmes, not
  // individual debt casework, and have no national public number.
  caveat:
    "There is no free national debt-counselling helpline in India. The financial lines above handle grievances against a lender or intermediary, not general money advice.",
};

/**
 * Should support resources be surfaced to this participant?
 * Triggered by the financial well-being score rather than shown to everyone,
 * so that it reads as relevant rather than as boilerplate.
 */
export function needsSupport(results) {
  const raw = results?.cfpb?.raw;
  const max = results?.cfpb?.max;
  if (raw === null || raw === undefined || !max) return false;
  return raw / max <= 0.35;
}
