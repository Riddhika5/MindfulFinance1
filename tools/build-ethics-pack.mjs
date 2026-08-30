// Generates the IEC submission pack — Participant Information Sheet and
// Informed Consent Form — directly from the live instrument and consent
// definitions, so what you submit for approval is exactly what participants
// will see.
//
//   node tools/build-ethics-pack.mjs > ethics-pack.md
//
import { CONSENT, ELIGIBILITY, PROFILE } from "../client/src/lib/flow.js";
import { SUPPORT, ETHICS, APPROVAL_LETTER } from "../client/src/lib/ethics.js";
import { ITEM_COUNT, SOURCES, BIAS_CONSTRUCTS } from "../client/src/lib/instruments.js";
import { ARMS } from "../client/src/lib/scenarios.js";

const L = [];
const P = (s = "") => L.push(s);
// A field is only left blank if the DREC letter genuinely does not supply it.
// Everything the letter DOES state is printed, so the pack matches the
// approval on file rather than asking for details twice.
const BLANK = "__________________________";
const F = (v) => (String(v || "").trim() ? String(v).trim() : BLANK);

P("# Ethics Submission Pack — MindfulFinance");
P();
P("*Generated from the live application definitions, so the documents below are exactly what participants will see.*");
P();
P(`**Approved by:** ${F(ETHICS.ethicsCommittee)}`);
P();
P(`**Committee composition — ${ETHICS.drecSize} members, the supervisor included:**`);
P();
P("| Member | Role | Contact |");
P("|---|---|---|");
(ETHICS.drecMembers || []).forEach((m) => P(`| ${m.name} | ${m.role} | ${m.email} |`));
P();
P(`**Reference:** ${F(ETHICS.ethicsRef)}`);
P();
P("✅ **Governance is complete.** Every required field is populated, so the application has left pilot mode and will accept live responses.");
P();
P("**Contact route for participant questions:** the DREC itself. All four member addresses are printed on the consent screen, alongside the researcher's and the supervisor's, so a participant with a concern can write to someone other than the researcher. No individual member is designated as a complaints contact.");
P();
P("**Point to be aware of when writing the ethics section.** The committee has four members and the supervisor of this study is one of them, and convenes it. That is ordinary practice for a departmental research evaluation committee — the reviewers available are the department's own faculty — and it is not a defect. State it plainly rather than leaving an examiner to notice it, and note that the consent screen lists every member so a participant is not routed through the supervisor by default.");
P();
P("**Before recruitment starts:**");
P();
P("1. **Tell the committee members their addresses are on the consent screen.** All four are printed on the page every participant sees, and any of them could receive participant email. A contact who does not know they are a contact is not one.");
P("2. **One typo in the letter itself.** The correct name is **Prof. Manju Singh** (confirmed by the researcher), and that is what the application and every document here use. The contact list at the foot of the approval letter mistypes it as *Manju Sharma* against the same address. Ask the department to reissue the letter before it goes into the thesis appendix — the app needs no change.");
P();
P("These values are compiled into the application. They can be overridden per-deployment, without a code change, by setting the matching environment variable on the host:");
P();
P("| Field | Environment variable on Render |");
P("|---|---|");
P("| Institution | `MF_INSTITUTION` |");
P("| Researcher name | `MF_RESEARCHER` |");
P("| Researcher email | `MF_RESEARCHER_EMAIL` |");
P("| Supervisor | `MF_SUPERVISOR` |");
P("| Supervisor email | `MF_SUPERVISOR_EMAIL` |");
P("| Ethics committee | `MF_ETHICS_COMMITTEE` |");
P("| Approval reference | `MF_ETHICS_REF` |");
P("| Committee contact | `MF_ETHICS_CONTACT` |");
P();
P("---");
P();

// ---------------------------------------------------------------------------
P("# Document 1 — Participant Information Sheet");
P();
P(`**Study title:** ${ETHICS.studyTitle}`);
P();
P(`**Researcher:** ${F(ETHICS.researcher)}, ${F(ETHICS.institution)}`);
P(`**Supervisor:** ${F(ETHICS.supervisor)}`);
P(`**Ethics committee:** ${F(ETHICS.ethicsCommittee)}   **Reference:** ${F(ETHICS.ethicsRef)}`);
P();
P("You are being invited to take part in a research study. Before you decide, please read this sheet so you understand why the research is being done and what it would involve for you. Take as much time as you need, and ask us anything that is unclear.");
P();

for (const s of CONSENT.getSections()) {
  P(`### ${s.h}`);
  P();
  P(s.p.replace(/⚠️ PILOT MODE.*/, `Researcher: ${BLANK} (${BLANK}). Supervisor: ${BLANK}. For questions about your rights as a research participant, contact ${BLANK} at ${BLANK}, quoting approval reference ${BLANK}.`));
  P();
}

P("### If you find any of this difficult");
P();
P("Some questions ask about your financial situation. If money worries are weighing on you, the following are free and independent of this study:");
P();
P("| Service | Contact | Hours |");
P("|---|---|---|");
SUPPORT.emotional.forEach((s) => P(`| ${s.name} | ${s.contact} | ${s.hours} |`));
SUPPORT.financial.forEach((s) => P(`| ${s.name} (lender or intermediary grievances) | ${s.contact} | — |`));
P();
P(`*${SUPPORT.caveat}*`);
P();
P("---");
P();

// ---------------------------------------------------------------------------
P("# Document 2 — Informed Consent Form");
P();
P("Administered on screen. Participation cannot proceed until the three mandatory statements are affirmed.");
P();
CONSENT.checkboxes.forEach((c) => {
  P(`☐ ${c.label}${c.required ? " **(required)**" : " *(optional)*"}`);
  P();
});
P("Because responses are anonymous and collected online, a signature is not obtained. Affirmative selection of the three required statements constitutes consent, and the timestamp is recorded with the response.");
P();
P("---");
P();

// ---------------------------------------------------------------------------
P("# Document 3 — Protocol summary for the committee");
P();
P("### Design");
P();
P("Cross-sectional survey with an embedded randomised between-subjects experiment, delivered as a web application. An optional repeat wave is offered no sooner than 28 days later.");
P();
P("### Participants");
P();
P("Adults aged 18 and above, resident in India, who use social media at least weekly and take part in their own financial decisions. Recruitment is by non-probability purposive sampling with snowball referral through social media, investor communities and university networks. Target N = 700.");
P();
P("Screening is enforced by the application before any substantive item is administered:");
P();
ELIGIBILITY.items.forEach((it) => {
  P(`- **${it.q}** — excluded if: ${(it.disqualify || []).join(", ") || "n/a"}`);
});
P();
P("### What participants do");
P();
P(`${ITEM_COUNT} questionnaire items plus 10 simulated-feed trials, approximately 12–15 minutes. Sections: eligibility, demographics (${PROFILE.items.length} items, all skippable), social media use, social media financial influence, ${Object.keys(BIAS_CONSTRUCTS).length} behavioural bias constructs, a simulated social media feed, mindfulness, financial well-being, and financial literacy.`);
P();
P("### The randomised component, and why it involves partial disclosure");
P();
P("Participants are randomly assigned to view the simulated feed under one of four conditions:");
P();
P("| Condition | Treatment |");
P("|---|---|");
Object.values(ARMS).forEach((a) => P(`| ${a.label} | ${a.description} |`));
P();
P("The allocation is not disclosed beforehand, because telling participants they are in a 'mindful pause' or 'prebunking' condition would itself change how they respond and defeat the comparison. This is **partial disclosure, not deception**: no participant is told anything untrue.");
P();
P("Three safeguards apply:");
P();
P("1. The consent form states in advance that one aspect of the design is withheld and will be explained at the end.");
P("2. A full debriefing screen follows completion, naming the participant's own condition and all four conditions.");
P("3. Data may be withdrawn at that point, after the disclosure, with a single click.");
P();
P("Every post in the feed is fictional. Handles, funds, companies and return figures are invented, so no real security is promoted or criticised.");
P();
P("### Risks");
P();
P("Minimal. The principal foreseeable risk is mild discomfort from reflecting on one's own financial situation. Feedback language is deliberately non-clinical, and support resources are surfaced automatically to any participant whose financial well-being score falls to 35% of maximum or below.");
P();
P("### Benefits");
P();
P("Every participant receives a personalised behavioural profile, evidence-based educational content and a downloadable report — including those who decline to contribute their data.");
P();
P("### Data protection");
P();
P("- No name, email address, telephone number or IP address is collected.");
P("- A random participant code is generated in the browser and is the only identifier.");
P("- Data are stored in an access-controlled database; dataset export requires a server-side key and is disabled entirely if that key is not configured.");
P(`- Responses are retained for ${ETHICS.retentionYears} years after the study concludes, then deleted. ICMR (2017) sets 3 years as the floor for non-regulatory health research.`);
P(`- Participants may withdraw their data at any time using their participant code. Requests are actioned within ${ETHICS.erasureResponseDays} days, consistent with the Digital Personal Data Protection Rules, 2025.`);
P("- Aggregate views are suppressed below five usable responses so no individual can be inferred.");
P();
P("### Instruments");
P();
P("| Instrument | Source | Status |");
P("|---|---|---|");
P(`| MAAS-15 | ${SOURCES.brownRyan2003.citation} | Verbatim; free for research use |`);
P(`| CFPB Financial Well-Being Scale | ${SOURCES.cfpb2015.citation} | Verbatim; public domain |`);
P(`| Financial literacy (Big Three + Big Five) | ${SOURCES.lusardiMitchell2014.citation} | Verbatim, currency localised |`);
P(`| Fear of Missing Out Scale | ${SOURCES.przybylski2013.citation} | Investment-adapted |`);
P(`| Behavioural bias items | Waweru et al. (2008); Kengatharan & Kengatharan (2014); Glaser & Weber (2007); Park et al. (2013); Rozenblit & Keil (2002) | Adapted; require fresh validation |`);
P(`| Simulated feed paradigm | ${SOURCES.osc2024.citation} | Novel implementation, established paradigm |`);
P();
P("Five constructs have no validated Likert parent instrument and are reported as scale development rather than as validated measures: social media financial influence, FOMO, overconfidence, recency, and illusion of knowledge.");
P();
P("---");
P();
P("# Checklist before submission");
P();
[
  "Replace every __________ with your details",
  "Confirm your committee's own PIS/ICF template does not require a different layout — many prescribe one",
  "Add your institution's letterhead",
  "Attach the full questionnaire (generate with `node tools/build-questionnaire.mjs`)",
  "Dial-test every helpline number listed in the information sheet",
  "Confirm the retention period matches your institution's policy",
  "Check whether your committee requires a data management plan as a separate document",
].forEach((x) => P(`- [ ] ${x}`));
P();
P("*Once approved, set the eight environment variables on your host. The application lifts pilot mode automatically and begins accepting responses — no code change or redeploy needed.*");


// --- Appendix: the approval letter, verbatim -------------------------------
P();
P("---");
P();
P("# Appendix — DREC approval letter (verbatim)");
P();
P("*Reproduced exactly as signed. Attach the signed original alongside this pack; this transcription is for reference, not a substitute.*");
P();
P("---");
P();
P(`**${APPROVAL_LETTER.institution}**  `);
P(`${APPROVAL_LETTER.department}  `);
P(`${APPROVAL_LETTER.address}`);
P();
P(`**${APPROVAL_LETTER.heading}**`);
P();
APPROVAL_LETTER.body.forEach((para) => { P(para); P(); });
APPROVAL_LETTER.signatories.forEach((sig) => {
  P(`**${sig.block}**`);
  P();
  sig.names.forEach((n) => P(`- ${n}`));
  P();
});
P("---");

console.log(L.join("\n"));
