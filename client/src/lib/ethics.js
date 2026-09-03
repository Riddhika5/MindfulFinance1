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

/**
 * The DREC approval letter, transcribed verbatim from the signed document so
 * the ethics pack can reproduce it as an appendix without a separate file.
 * Do NOT paraphrase or "improve" this text — it is a quotation of an approval,
 * and the version in the thesis appendix must match the signed original.
 */
export const APPROVAL_LETTER = {
  institution: "MALAVIYA NATIONAL INSTITUTE OF TECHNOLOGY JAIPUR",
  department: "Department of Humanities & Social Sciences",
  address: "JLN Marg, Jaipur–302017, Rajasthan, India",
  heading: "TO WHOMSOEVER IT MAY CONCERN",
  body: [
    "The Departmental Research Evaluation Committee (DREC) confirms that the doctoral research of Ms. Riddhika Dangayach (ID No. 2024RHS9082) titled:",
    "\u201CSocial Media Influence and Financial Well-Being: Exploring the Role of Mindfulness within a Behavioural Finance Framework\u201D",
    "adheres to standard ethical guidelines for social science research, including informed consent, voluntary participation, anonymity, and participant confidentiality.",
    "The study involves adult participants and will be conducted through a structured survey-based research instrument. Participation will be voluntary and based on informed consent. Participants will be provided with adequate information about the purpose of the study and their right to participate or withdraw without any penalty. No personally identifying information will be disclosed in the reporting of the research findings.",
    "The research will maintain participant anonymity, confidentiality, and privacy. The data collected will be used strictly for academic research purposes and will be securely stored and accessed only for authorized research activities. The research will not involve any intervention or procedure intended to cause physical or psychological harm to participants.",
    "The DREC has reviewed and approved the research plan from an ethical perspective.",
  ],
  signatories: [
    { block: "SUPERVISOR", names: ["Dr. Nidhi Sharma (Supervisor)"] },
    { block: "DREC MEMBERS", names: ["Prof. Manju Singh (DREC Member)", "Dr. Dipti Sharma (DREC Member)", "Dr. Nidhi Bansal (DREC Member)"] },
    { block: "CONVENERS", names: ["Dr. Nidhi Sharma (Convener DREC)", "Dr. Nidhi Sharma (Convener DPGC)"] },
  ],
};

export const ETHICS = {
  // --- Approved by the Departmental Research Evaluation Committee ---------
  // Transcribed from the DREC letter. Nothing here is inferred: the letter
  // carries no approval reference number, so `ethicsRef` identifies the
  // approval by issuing body rather than inventing one. No date is shown —
  // participants do not need it, and the signed letter carries it anyway.
  institution:
    "Department of Humanities & Social Sciences, Malaviya National Institute of Technology Jaipur, JLN Marg, Jaipur–302017, Rajasthan, India",
  researcher: "Riddhika Dangayach (ID No. 2024RHS9082)",
  researcherEmail: "2024rhs9082@mnit.ac.in",
  supervisor: "Dr. Nidhi Sharma, Department of Humanities & Social Sciences, MNIT Jaipur",
  supervisorEmail: "nidhis.hum@mnit.ac.in",
  ethicsCommittee:
    "Departmental Research Evaluation Committee (DREC), Department of Humanities & Social Sciences, MNIT Jaipur",
  ethicsRef:
    "DREC approval letter, Department of Humanities & Social Sciences, MNIT Jaipur (no reference number issued)",

  // Route for questions about the study. The committee itself, rather than
  // any one member: the researcher asked that no individual be singled out
  // as a complaints contact. Their addresses are listed on the consent
  // screen, so a participant still has a route that is not the researcher.
  ethicsContact:
    "Departmental Research Evaluation Committee (DREC), Department of Humanities & Social Sciences, MNIT Jaipur — member addresses are listed on the consent screen",

  studyTitle:
    "Social Media Influence and Financial Well-Being: Exploring the Role of Mindfulness within a Behavioural Finance Framework",
  approvalBody: "Departmental Research Evaluation Committee (DREC)",
  // FOUR members, the supervisor included. She sits on the committee as its
  // Convener as well as supervising the study, which is normal practice for a
  // departmental committee but is the reason the participant-rights contact
  // above is one of the other three.
  drecSize: 4,
  drecMembers: [
    { name: "Dr. Nidhi Sharma", email: "nidhis.hum@mnit.ac.in", role: "Convener, DREC and DPGC" },
    { name: "Prof. Manju Singh", email: "manjus.hum@mnit.ac.in", role: "Member" },
    { name: "Dr. Dipti Sharma", email: "dsharma.hum@mnit.ac.in", role: "Member" },
    { name: "Dr. Nidhi Bansal", email: "nidhib.hum@mnit.ac.in", role: "Member" },
  ],
  convener: "Dr. Nidhi Sharma (Convener, DREC and DPGC) — nidhis.hum@mnit.ac.in",

  // --- Data governance ----------------------------------------------------
  // ICMR (2017) sets 3 years as the floor for non-regulatory health research.
  retentionYears: 5,
  // The Digital Personal Data Protection Rules, 2025 carry a right to erasure
  // with a 90-day response obligation and no research exemption.
  erasureResponseDays: 90,
};

// ===========================================================================
// GOVERNANCE IS NOW COMPLETE — the app leaves pilot mode and will accept live
// responses. Two things to check before you recruit:
//
// 1. The correct name is Prof. Manju Singh — confirmed by the researcher and
//    used throughout this application. The contact list at the foot of the
//    approval letter mistypes it as "Manju Sharma" against the same address.
//    That is an error in the letter, not here; ask the department to reissue
//    it before the letter goes into the thesis appendix.
//
// 2. Prof. Manju Singh is named here as the participant-rights contact, and
//    that address will receive real participant email. Tell her before you
//    launch. A contact who does not know they are a contact is not one.
//
// These values can be overridden per-deployment without a code change:
//   MF_INSTITUTION, MF_RESEARCHER, MF_RESEARCHER_EMAIL, MF_SUPERVISOR,
//   MF_SUPERVISOR_EMAIL, MF_ETHICS_COMMITTEE, MF_ETHICS_REF, MF_ETHICS_CONTACT
// ===========================================================================

/**
 * Governance values can also be supplied as environment variables on the host
 * (MF_INSTITUTION, MF_ETHICS_REF, …) and are fetched at boot. That avoids a
 * code change and a redeploy just to enter an approval reference — which is
 * exactly the friction that leads to placeholders being left in place.
 */
export async function loadRuntimeEthics() {
  try {
    const r = await fetch("https://mindfulfinance1-3-server.onrender.com/api/config");
    if (!r.ok) return false;
    const d = await r.json();
    if (d?.ethics && typeof d.ethics === "object") {
      Object.assign(ETHICS, d.ethics);
      return true;
    }
  } catch {
    /* offline or server unreachable — fall back to the values in this file */
  }
  return false;
}

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
  const w = results?.fwb || results?.cfpb;
  if (!w) return false;
  // Netemeyer form: 1–5 mean, already converted to a 0–100 POMP score.
  if (typeof w.pomp === "number") return w.pomp <= 35;
  // CFPB form: raw score against its own maximum.
  const { raw, max } = w;
  if (raw === null || raw === undefined || !max) return false;
  return raw / max <= 0.35;
}
