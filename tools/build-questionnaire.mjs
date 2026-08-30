// Regenerates the appendix-ready questionnaire document straight from the
// instrument definitions, so the document can never drift from what the app
// actually administers.
//
//   node tools/build-questionnaire.mjs > questionnaire.md
//
import { SOURCES, SMI, SMFI_CRITERION, OPEN_ENDED, BIAS_CONSTRUCTS, MAAS, CFPB, FWB, FWB_FRAMEWORK, LITERACY, ITEM_COUNT } from "../client/src/lib/instruments.js";

const L = [];
const P = (s = "") => L.push(s);

P("# MindfulFinance — Full Questionnaire (Instrument v3.5)");
P();
P("*Appendix-ready. Every item with its code, source and provenance level. Provenance: **verbatim** = published wording; **adapted** = published item re-anchored to this context; **contextual** = built from the source construct definition where no transferable wording exists.*");
P();
P(`**${ITEM_COUNT} items total**, plus 10 simulated-feed trials. Median completion ~8–12 minutes.`);
P();
P("*EVERY block, without exception, uses the SAME five-point agreement scale: 1 = Strongly disagree … 5 = Strongly agree. The response format does not change anywhere in the instrument.*");
P();
P("> **Sampling.** Quota-controlled, n = 600: gender 300 male / 300 female; age 105 / 145 / 120 / 95 / 75 / 60 across the six bands; location 180 Tier-1 / 210 Tier-2 / 120 Tier-3–4 / 90 rural. Data collection into a cell stops automatically once its target is met.");
P();
P("> **Not administered in this version.** Mindfulness (MAAS-15, Financial Mindfulness, State Mindfulness, meditation history) and the behaviour covariates (Buying Impulsiveness, Brief Self-Control) were removed at the researcher's instruction. There are no randomised arms.");
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
P("*Demographic covariates. Gender, age and location are REQUIRED because they drive the recruitment quota; everything else is skippable.*");
P();
P("| # | Item | Options |");
P("|---|---|---|");
P("| D1 | Gender **(required)** | Male / Female / Other |");
P("| D2 | Highest level of education completed | School / Diploma / Bachelor's degree / Master's degree / Professional degree (CA, CS, CFA, MBBS, LLB, B.Ed, etc.) / Doctorate / Prefer not to say |");
P("| D3 | Current occupation | Student / Salaried / Self-employed / Freelance / Homemaker / Retired / Not working / Prefer not to say |");
P("| D4 | Approximate monthly household income | Below ₹25,000 / ₹25,000–₹50,000 / ₹50,001–₹1,00,000 / ₹1,00,001–₹2,00,000 / Above ₹2,00,000 / Prefer not to say |");
P("| D5 | Where do you live? **(required)** | Metro / Tier-1 city · Tier-2 city · Tier-3 or Tier-4 town · Rural area |");
P("| D6 | Investor experience | Don't invest yet / <1 year / 1–3 years / 3–7 years / >7 years |");
P("| D7 | Products currently held | Savings only / FDs / Mutual funds / Direct stocks / Gold / Crypto / Insurance-linked / None |");
P();

P("## Section 3 — Social media use");
P();
P("*Descriptive covariates, 3 items — ALL REQUIRED: daily hours on social media · platforms used at least weekly · frequency of encountering financial content.*");
P();
P("**Source:** Ontario Securities Commission & The Decision Lab (2024), *Social media and retail investing: The rise of finfluencers*; usage battery reported alongside Ni, Chan & Cheung (2020).");
P();

P("## Section 4 — Social media influence (SMI)");
P();
P("**12 items · 5-point agreement.** Anchored on a published, validated instrument rather than newly developed.");
P();
P(`**Source:** ${SOURCES.susis2023.citation}`);
P();
P(`**Reliability reported in the source:** ${SOURCES.susis2023.reliability}`);
P();
P("Items SMI1–SMI9 are the nine items of the SUSIS **SOCIAL_PERCEPTION** subscale (α = .829) — perception towards influencers, parasocial relationship, and consumer trust — re-anchored from influencers-in-general to finance creators. Items SMI10–SMI12 extend the scale into financial adoption, which SUSIS does not cover, and are flagged as an extension rather than as SUSIS items.");
P();
P("> The SUSIS **HARMFUL** subscale (16 items rating the promotion of violence, tobacco, alcohol and sexual content) is deliberately **not** administered. It is unrelated to financial decision making and would be inappropriate in this questionnaire.");
P();
P("| Code | Sub-dimension | Item | Provenance |");
P("|---|---|---|---|");
SMI.items.forEach((it, n) => P(`| SMI${n + 1} | ${it.sub} | ${it.q} | ${it.adapt} |`));
P();
P("**Criterion item (not scored into SMI).** Shown at the foot of the same page. Tests whether the SMI scale predicts self-reported behaviour outside itself.");
P();
P("| Code | Item | Response options |");
P("|---|---|---|");
P(`| sm_acted | ${SMFI_CRITERION.q} | ${SMFI_CRITERION.options.join(" / ")} |`);
P();

P("## Section 5 — Behavioural biases");
P();
P("**10 constructs · 34 items · one shared 5-point agreement scale.** Presented on three screens under the heading *Your decision-making style*, as a compact matrix, with item order randomised within each construct. Screen 1: following others and fear of missing out. Screen 2: how you weigh information. Screen 3: confidence, risk and reference points.");
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
P("10 fictional posts on ONE scrollable page. For each post the participant chooses one action: *Yes, I would act on this* / *I need more information* / *No, I would scroll past*. Dwell time to first decision and use of the \"How would I check this?\" affordance are recorded automatically.");
P();
P("**No randomised arms.** Every participant sees the same feed. The paid-promotion disclosure banner was removed — nothing in this study is sponsored, so a banner implying otherwise would have been inaccurate. The consequence is that the design is a cross-sectional survey with an embedded behavioural task, NOT a randomised experiment, and no between-group causal claim can be made.");
P();
P("> Removed: the follow-up \"Why?\" reason codes, the prebunking screen, the 10-second mindful-pause delay, and the paid-promotion disclosure banner.");
P();
P("**Source:** Ontario Securities Commission & The Decision Lab (2024). All posts, handles, funds and companies are fictional.");
P();

P("## Section 7 — Financial well-being");
P();
P(`**${FWB.items.length} items · the SAME 5-point agreement scale as every other block.**`);
P();
P(`**Source:** ${SOURCES.netemeyer2018.citation}`);
P();
P(`**Reliability reported in the source:** ${SOURCES.netemeyer2018.reliability}`);
P();
P("> **Why this instrument and not the CFPB scale.** The requirement is one agreement metric across the whole questionnaire. Netemeyer et al. (2018) was constructed on a five-point strongly-disagree to strongly-agree scale, so it meets that with no re-anchoring at all. The CFPB scale cannot: its 0–100 score is produced by an IRT graded-response calibration keyed to its own two anchor sets, so re-anchoring the items to agreement would void the published scoring tables and all published norms, leaving ten items with no validated way to score them. The CFPB **dimensional framework** is still used throughout the analysis — see the mapping below — it is simply not administered as a separate block.");
P();
P("> **Scoring.** The five Current Money Management Stress items are negatively worded and are REVERSE-CODED, so a high score always means better financial well-being.");
P();
P("### Conceptual framework — CFPB and Netemeyer dimensions");
P();
P("The CFPB (2015) defines financial well-being on a 2 × 2 of time (present / future) by content (security / freedom of choice):");
P();
P("| | Security | Freedom of choice |");
P("|---|---|---|");
P("| **Present** | Control over day-to-day, month-to-month finances | Financial freedom to make choices that allow enjoyment of life |");
P("| **Future** | Capacity to absorb a financial shock | On track to meet financial goals |");
P();
P("Netemeyer et al. (2018) resolve the same construct into two empirical factors, which map onto the CFPB **time** axis and collapse the **content** axis:");
P();
P("| Netemeyer factor | Items | α | Maps to |");
P("|---|---|---:|---|");
FWB_FRAMEWORK.netemeyer.factors.forEach((f) => {
  P(`| ${f.name} | FWB${f.items[0].replace("fwb","")}–FWB${f.items[f.items.length-1].replace("fwb","")} | ${f.alpha} | ${f.mapsTo} |`);
});
P();
P(`**What this gains.** ${FWB_FRAMEWORK.gained} This matters directly for the research question: social media influence plausibly raises present money stress — through impulsive spending, social comparison and FOMO purchases — while leaving expected future security untouched, or even inflating it through unrealistic optimism. That is a testable prediction only if present and future are measured separately, which the single CFPB score cannot do.`);
P();
P(`**What this loses.** ${FWB_FRAMEWORK.lost}`);
P();
P("| Code | Sub-dimension | Item | Reverse-coded |");
P("|---|---|---|---|");
FWB.items.forEach((it, n) => P(`| FWB${n + 1} | ${it.sub} | ${it.q} | ${it.reverse ? "Yes" : "—"} |`));
P();

P("## Section 7b — Open-ended probe (OPTIONAL)");
P();
P("Two free-text boxes at the foot of the feed screen, after every closed item has been answered so they cannot prime the fixed battery. Both optional.");
P();
OPEN_ENDED.items.forEach((it, n) => {
  P(`**OPEN${n + 1}.** ${it.q}`);
  P();
});
P(`*Privacy notice shown with the boxes:* ${OPEN_ENDED.privacyNote}`);
P();
P("> Purpose: identify influences the fixed battery does not name. Ten bias constructs and a 12-item influence scale between them fix what can be reported; anything outside that frame is invisible unless participants are given somewhere to put it. Analysed by inductive thematic coding (Braun & Clarke, 2006). A recurring theme is grounds for a follow-up study or an added construct — NOT for a post-hoc addition to this dataset's models.");
P();
P("> ⚠️ Free text is the one place a participant can identify themselves or someone else. Screen these two columns for identifying detail before the dataset is shared or archived.");
P();

P("## Section 8 — Blocks retired from this version");
P();
P("Kept in the instrument bank and reversible from a single configuration flag, but NOT administered:");
P();
P("| Block | Items | Source |");
P("|---|---|---|");
P(`| Mindful Attention Awareness Scale (MAAS-15) | ${MAAS.items.length} | ${SOURCES.brownRyan2003.citation} |`);

P(`| CFPB Financial Well-Being Scale | ${CFPB.items.length} | ${SOURCES.cfpb2015.citation} |`);
P("| Financial Mindfulness Scale | 8 | Garbinsky, Blanchard & Kim (2025) |");
P("| State Mindfulness (post-feed) | 5 | Brown & Ryan (2003) |");
P("| Buying Impulsiveness Scale | 9 | Rook & Fisher (1995) |");
P("| Brief Self-Control Scale | 13 | Tangney, Baumeister & Boone (2004) |");
P("| Meditation practice history | 3 | Author-constructed |");
P();

P("## Section 9 — Financial knowledge (OPTIONAL)");
P();
P("**5 items VERBATIM** (₹ localised). Big Three plus the GFLEC Big Five extension. \"Do not know\" is retained as a distinct option and recorded separately.");
P();
P(`**Source:** ${SOURCES.lusardiMitchell2014.citation}`);
P();
P("> **This section is SKIPPABLE.** A participant who skips it is recorded with `LIT_skipped = 1` and a BLANK literacy score. A skip must never be recoded to zero — it is missing data with a known reason, not demonstrated ignorance.");
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
