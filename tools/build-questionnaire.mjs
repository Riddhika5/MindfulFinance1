// Regenerates the appendix-ready questionnaire document straight from the
// instrument definitions, so the document can never drift from what the app
// actually administers.
//
//   node tools/build-questionnaire.mjs > questionnaire.md
//
import { SOURCES, SMFI, BIAS_CONSTRUCTS, MAAS, CFPB, LITERACY, ITEM_COUNT } from "../client/src/lib/instruments.js";

const L = [];
const P = (s = "") => L.push(s);

P("# MindfulFinance — Full Questionnaire (Instrument v2.0)");
P();
P("*Appendix-ready. Every item with its code, source and provenance level. Provenance: **verbatim** = published wording; **adapted** = published item re-anchored to this context; **contextual** = built from the source construct definition where no transferable wording exists.*");
P();
P(`**${ITEM_COUNT} items total**, plus 10 simulated-feed trials. Median completion ~12–15 minutes.`);
P();
P("---");
P();

P("## Section 1 — Eligibility screening");
P();
P("Administered before any substantive item. Participants are screened out if under 18, if they do not use social media weekly, or if someone else makes all their financial decisions.");
P();
P("| # | Item | Options |");
P("|---|---|---|");
P("| E1 | How old are you? | Under 18 / 18–24 / 25–34 / 35–44 / 45–54 / 55–64 / 65+ |");
P("| E2 | Do you use social media at least once a week? | Yes / No |");
P("| E3 | Do you make or share in decisions about your own money? | Decide alone / Jointly with family / Someone else decides |");
P();

P("## Section 2 — Participant profile");
P();
P("*Demographic covariates. All skippable.*");
P();
P("Gender · Education · Occupation · Monthly household income · Location (metro / tier-2 / tier-3 / rural) · Investor experience · Products currently held");
P();

P("## Section 3 — Social media use");
P();
P("*Descriptive covariates, 5 items: daily hours · platforms used weekly · frequency of encountering financial content · number of finfluencers followed · financial actions taken from social media in the last 12 months.*");
P();

P("## Section 4 — Social Media Financial Influence (SMFI)");
P();
P("**12 items · 5-point agreement · NEWLY DEVELOPED scale.** No validated instrument exists for this construct. Built from Ni et al. (2020) engagement structure and Ohanian (1990) source credibility. Must be reported as scale development with EFA → CFA → HTMT.");
P();
P("| Code | Sub-dimension | Item |");
P("|---|---|---|");
SMFI.items.forEach((it, n) => P(`| SMFI${n + 1} | ${it.sub} | ${it.q} |`));
P();

P("## Section 5 — Behavioural biases");
P();
P("**10 constructs · 34 items · one shared 5-point agreement scale.** Every adapted item in the study — 12 SMFI plus these 34, 46 in total — uses the same metric. Presented across two screens as a compact matrix, with item order randomised within each construct.");
P();
for (const c of Object.values(BIAS_CONSTRUCTS)) {
  const s1 = SOURCES[c.src];
  const s2 = c.src2 ? SOURCES[c.src2] : null;
  const s3 = c.src3 ? SOURCES[c.src3] : null;
  P(`### ${c.code} — ${c.name} (${c.items.length} items)`);
  P();
  P(`**Adapted from:** ${s1.citation}${s2 ? `  \n**and:** ${s2.citation}` : ""}${s3 ? `  \n**and:** ${s3.citation}` : ""}`);
  P();
  if (c.note) { P(`> ${c.note}`); P(); }
  P("| Code | Item | Provenance |");
  P("|---|---|---|");
  c.items.forEach((it, n) => P(`| ${c.code}${n + 1} | ${it.q} | ${it.adapt} |`));
  P();
}

P("## Section 6 — Simulated Social Media Feed");
P();
P("10 fictional posts on a single scrollable page. For each: **Would you invest?** (Yes, I would act on this / I need more information / No, I would scroll past), then **Why?** from ten reason codes each mapped to a bias. Dwell time and use of the verification affordance are recorded.");
P();

P("## Section 7 — Mindfulness (MAAS-15)");
P();
P("**15 items VERBATIM · 6-point, 1 = almost always … 6 = almost never.** Brown & Ryan (2003).");
P();
P("> **Scoring warning:** do NOT reverse-code. All items describe attention lapses and the anchoring already inverts them. Administered in the fixed published order — not randomised.");
P();
P("| Code | Item |");
P("|---|---|");
MAAS.items.forEach((it, n) => P(`| MAAS${n + 1} | ${it.q} |`));
P();

P("## Section 8 — Financial well-being (CFPB-10)");
P();
P("**10 items VERBATIM.** Items 1–6 use the \"describes me\" anchors; items 7–10 use the frequency anchors.");
P();
P("> **Scoring warning:** the 0–100 score is an IRT lookup keyed on raw total × age group × administration mode, not a linear sum.");
P();
P("| Code | Item |");
P("|---|---|");
CFPB.items.forEach((it, n) => P(`| FWB${n + 1} | ${it.q} |`));
P();

P("## Section 9 — Financial literacy");
P();
P("**5 items VERBATIM** (₹ localised). Big Three plus the GFLEC Big Five extension. \"Do not know\" is retained as a distinct option and recorded separately.");
P();
LITERACY.items.forEach((it, n) => {
  P(`**LIT${n + 1} (${it.concept}).** ${it.q}`);
  P();
  P(`- Options: ${it.options.join(" / ")}`);
  P(`- **Correct: ${it.correct}**`);
  P();
});

P("---");
P();
P("## Full reference list");
P();
Object.values(SOURCES).filter((s) => s.instrument).forEach((s) => P(`- ${s.citation}`));

console.log(L.join("\n"));
