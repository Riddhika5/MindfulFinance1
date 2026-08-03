# Research basis — MindfulFinance (instrument version 2.0)

Every item in the assessment is either **reproduced from** or **documented as an
adaptation of** a published, peer-reviewed instrument. Nothing is author-invented.
The machine-readable version of this table lives in
[`client/src/lib/instruments.js`](client/src/lib/instruments.js) — each item
carries a `src` key and an `adapt` level (`verbatim` / `adapted` / `contextual`).

## The measurement model

| Code | Construct | Items | Adapted from | Provenance |
|------|-----------|------:|--------------|------------|
| HER | Herding | 4 | Waweru, Munyoki & Uliana (2008); Kengatharan & Kengatharan (2014) | adapted |
| OVC | Overconfidence | 4 | Glaser & Weber (2007); Pompian (2006) | adapted |
| FOM | FOMO | 4 | Przybylski et al. (2013), investment-adapted | adapted |
| AVL | Availability | 3 | Waweru et al. (2008); Tversky & Kahneman (1974) | adapted |
| REC | Recency | 3 | Nofsinger (2017); Kengatharan & Kengatharan (2014) | adapted / contextual |
| ANC | Anchoring | 3 | Kengatharan & Kengatharan (2014); Tversky & Kahneman (1974) | adapted |
| CNF | Confirmation bias | 3 | Park, Konana, Gu, Kumar & Raghunathan (2013) | adapted |
| LAV | Loss aversion | 3 | Kahneman & Tversky (1979); Kengatharan & Kengatharan (2014) | adapted |
| IOK | Illusion of knowledge | 4 | Rozenblit & Keil (2002); Glaser & Weber (2007); Park et al. (2013) | adapted |
| REP | Representativeness | 3 | Tversky & Kahneman (1974); Waweru et al. (2008) | adapted |

**10 constructs, 34 bias items, all on the same 5-point agreement scale.**

Every adapted item in the study — 12 SMFI plus 34 bias items, 46 in total — uses
one metric. FOMO was moved off Przybylski's "true of me" anchors to join them:
because those items are already an adaptation requiring fresh validation, a
uniform metric across the whole adapted battery makes the second-order factor
model cleaner and removes a needless source of method variance. **The deviation
from source anchors must be reported.** MAAS (6-point) and CFPB (its own two
anchor sets) keep their published response formats — changing those would
invalidate the very psychometrics they are being used for.

### The rest of the battery

| Construct | Instrument | Items | Scale | Provenance |
|-----------|-----------|------:|-------|------------|
| Social media use | Descriptive covariates | 5 | categorical | contextual (OSC, 2024) |
| Social Media Financial Influence | **Newly developed** from three parents | 12 | 1–5 agree | adapted |
| Mindfulness | **MAAS-15** | 15 | 1–6 frequency | **verbatim** |
| Financial well-being | **CFPB Scale (10-item)** | 10 | CFPB anchors | **verbatim** |
| Financial literacy | **Big Three + Big Five** | 5 | knowledge | **verbatim** (₹ localised) |
| Feed behaviour | Simulated Social Media Feed | 10 trials | behavioural | novel paradigm |

**81 items total**, roughly 12–15 minutes.

## Full references

- **MAAS** — Brown, K. W., & Ryan, R. M. (2003). The benefits of being present. *Journal of Personality and Social Psychology, 84*(4), 822–848. α = .80–.87; test–retest ICC = .81. *Free for research; commercial use requires CSDT permission.*
- **CFPB Financial Well-Being Scale** — Consumer Financial Protection Bureau (2015). *Public domain.* The **10-item** form is used deliberately: Heck, Ratcliffe & Tibbitts (2025, *Journal of Financial Literacy and Wellbeing*) show the 5-item form scores ~0.90 points lower on average, and 2.3 points lower among lower-income respondents, because of its higher share of negatively worded items.
- **Financial literacy** — Lusardi, A., & Mitchell, O. S. (2014). *Journal of Economic Literature, 52*(1), 5–44. Big Five extension per GFLEC.
- **Behavioral Biases Scale** — Ritika, & Kishor, N. (2022). *Review of Behavioral Finance, 14*(2), 237–259. 13 first-order constructs, 2 second-order factors; EFA n = 274, higher-order CFA n = 576; all α > .70, CR > .70, AVE > .50. The only published instrument covering herding, anchoring, availability, representativeness, confirmation and loss aversion within one validated structure.
- **Overconfidence** — Costa, D. F., Soares, C. C., Moreira, B. C. M., & Tonelli, A. O. (2025). *Future Business Journal, 11*(1), 6. Three dimensions × 10 items; CR .927–.958, AVE .564–.700, RMSEA = .017 (n = 380). Theoretical basis: Moore & Healy (2008).
- **FoMO** — Przybylski, A. K., Murayama, K., DeHaan, C. R., & Gladwell, V. (2013). *Computers in Human Behavior, 29*(4), 1841–1848. α = .87/.90/.89.
- **Social media engagement** — Ni, X., Shao, X., Geng, Y., Qu, R., Niu, G., & Wang, Y. (2020). *Frontiers in Psychology, 11*, 701. α = .804/.798/.709; N = 2,519.
- **Source credibility** — Ohanian, R. (1990). *Journal of Advertising, 19*(3), 39–52.
- **Loss-aversion task** — Gächter, S., Johnson, E. J., & Herrmann, A. (2022). *Theory and Decision, 92*(3), 599–624. Theory: Kahneman & Tversky (1979).
- **Anchoring task** — Tversky, A., & Kahneman, D. (1974). *Science, 185*(4157), 1124–1131.
- **Simulated feed paradigm** — Ontario Securities Commission & The Decision Lab (2024), *Social media and retail investing: The rise of finfluencers* (N = 1,465; 38% vs 8% action rate); Sherman, L. E., et al. (2016), *Psychological Science, 27*(7), 1027–1035; Kuerzinger, L., & Stangor, P. (2024), *JBEF, 44*, 101005.

## Five honest caveats

Stated plainly, because reviewers will ask. Each is also recorded per construct in `instruments.js`.

1. **No validated instrument exists for "social media influence on financial decisions."** The 2024 *Paradigm* systematic review confirms the gap. The SMFI scale is therefore a **newly developed scale** built from three validated parents, and must be reported as scale development with full EFA → CFA → HTMT discriminant validity — not as an "adapted" scale.
2. **No validated financial-FOMO scale exists.** The four items are an investment adaptation of Przybylski et al. (2013) and require fresh EFA/CFA.
3. **Glaser & Weber (2007) measure overconfidence with estimation tasks, not Likert items** — 90% confidence intervals for miscalibration, and percentile self-placement for better-than-average. The OVC items here render those constructs as agreement statements. That is a documented adaptation, and it needs its own validation. Note also their headline finding, which shapes this design: **miscalibration and better-than-average are essentially uncorrelated**, which is precisely why OVC and IOK are treated as separate constructs here rather than as one overconfidence factor.
4. **No validated illusion-of-knowledge scale exists in finance.** Franco Moreno, Rodríguez-Priego & Galán Valdivieso (2025) establish this in a systematic review. Rozenblit & Keil (2002) measure the illusion of explanatory depth as a *pre–post difference score*, which a single-administration Likert item cannot reproduce. This study therefore does two things: it fields four IOK items (informed by Park et al.'s 3-item perceived knowledge scale, α = .81), **and** it computes a **subjective–objective calibration gap** against the objective literacy score. The gap is the defensible operationalisation; the subscale alone would only measure perceived knowledge.
5. **No standalone validated recency scale exists in investor samples.** Existing instruments subsume recency within representativeness or anchoring/extrapolation. Item REC1 follows the extrapolation item retained at EFA in Kengatharan & Kengatharan (2014); the other two are built from Nofsinger's conceptual definition. Fresh EFA/CFA required.

**Two sources are textbooks, not instruments**, and are cited as such: Pompian (2006) for the cognitive/emotional taxonomy and the self-report diagnostic tradition, and Nofsinger (2017) for the conceptual definition of recency. Neither is claimed as a validated scale.

**One caveat about the anchor sources.** Waweru et al. (2008) is the origin of the most widely adapted item pool in survey behavioural finance, but it is an N = 23 survey of institutional investors using Yes/No and impact-rating formats, with no CFA. Kengatharan & Kengatharan (2014) is stronger (N = 128, EFA, herding α = .851) but **dropped its availability and representativeness items at EFA**, so those constructs here draw on Waweru and on the original Tversky–Kahneman definitions instead. Neither is a fully validated multi-construct instrument, and the chapter should say so rather than implying otherwise.

## Scoring rules that are easy to get wrong

- **MAAS is not reverse-coded.** Every item describes an attention *lapse*, and the 1 = *almost always* → 6 = *almost never* anchoring already inverts them. Applying reverse coding is the single most common error in applied MAAS papers. See `scoring.js`.
- **CFPB is not a linear sum.** The 0–100 score comes from an IRT lookup keyed on raw total × age group × administration mode. The official Appendix A tables are **not** shipped with this repo — `CFPB_LOOKUP` in `scoring.js` is `null`, and the app returns the **raw total** plus a clearly-labelled provisional display figure. Paste the official tables in before analysis.
- **Financial literacy has no Cronbach's α.** It is a formative knowledge index. Report % correct, DK rate and item difficulty.
- **"Do not know" is kept as its own category** at collection. DK rates are substantively informative and gendered; merge them into "incorrect" at analysis, not at data entry.
- **Recency and Representativeness are deliberately separated.** REC items are confined to *temporal weighting* (recent information outweighing older information); REP items are confined to the *similarity heuristic* (resemblance to a category or to past winners, plus sample-size neglect). Neither set references the other's mechanism. This matters because the two constructs collapse into one in most published instruments — check HTMT(REC, REP) < 0.85 and report it.
- **Illusion of knowledge is scored twice.** As a subscale mean (the construct), and as a **calibration gap** = IOK POMP − objective literacy %, both on 0–100. A positive gap is the illusion; the app reports it as `knowledgeCalibration` and stores it as `knowledgeGap` in the export. Report both — the subscale alone measures perceived knowledge, not the illusion.
- **The bias index uses POMP normalisation** ((x − min)/(max − min) × 100) so 5-point and 7-point subscales are commensurable. It is descriptive only — report subscale means separately.

## Experimental arms

Participants are randomised at session start (deterministically, from the
participant code, so a page refresh keeps the allocation):

| Arm | Treatment | Precedent |
|-----|-----------|-----------|
| Control | Feed as-is | OSC (2024) control |
| Disclosure | Paid-promotion / risk banner on each promotional post | OSC (2024) disclosure arm |
| Prebunk | Inoculation screen naming four persuasion techniques, shown before the feed | OSC (2024) inoculation arm |
| Mindful pause | Attention-to-present prompt with a forced 10-second delay before confirming | **This study's own contribution** |

Social proof (like/comment counts) is manipulated **within** participant across
trials, following Sherman et al. (2016).

## Presentation controls

- **Item order.** The SMFI scale and every adapted bias subscale are **randomised per participant** using a seed derived from the participant code, so the order is stable across a page refresh and reproducible at analysis. The order actually presented is stored with the response (`presentedOrder`) so order effects can be tested rather than assumed away.
- **The MAAS is deliberately NOT randomised.** It is validated and normed in its published order, and its reported reliability applies to that order. Randomising it would trade a real psychometric guarantee for a marginal fatigue benefit.
- **Blocking.** The bias battery is split into four thematic screens (decision style / information processing / confidence / risk) rather than one long grid — a completion-rate measure, with the secondary benefit of a plain-language heading per block.
- **Progress** is shown as a percentage rather than "question n of N", because a large absolute denominator is itself a source of attrition.

## Repeat measurement

Completed assessments are summarised locally as *waves*. The check-up screen compares the two most recent waves **direction-aware** — a fall in bias and a rise in mindfulness both count as improvement — and reports per-construct deltas. A minimum interval of 28 days is recommended in the interface, because re-taking sooner largely measures recall of previous answers rather than change.

Wave-2 uptake is voluntary and therefore self-selected; it is treated as a supplementary sub-sample and reported with attrition analysis, not as a longitudinal design.

## Data collected

Item-level raw responses are always stored, so the dataset can be re-scored if any
rule above is later corrected. Also captured: assigned experimental arm, per-item
response, feed-trial decisions with dwell times and social-proof condition, and
data-quality flags (straightlining runs, response SD, seconds per item) for
transparent exclusion.

Export endpoints (require `RESEARCHER_KEY` in the environment):

```
GET /api/export/data.xlsx?key=…   ← the main export. Multi-sheet, SPSS-ready
GET /api/export/wide.csv?key=…    one row per participant-wave, one column per item
GET /api/export/feed.csv?key=…    one row per feed trial
```

### The Excel workbook

| Sheet | Contents |
|---|---|
| **Data** | One row per participant-wave; every item plus every derived score. 141 columns. |
| **Codebook** | Every variable: label, construct, subscale, type, range, value labels, scoring note, full source citation. |
| **ValueLabels** | Numeric code → label, ready for SPSS *Define Variable Properties*. |
| **Scores** | Derived construct scores only, for a quick look. |
| **FeedTrials** | Long format, one row per trial — the shape the multilevel experimental analysis needs. |
| **Meta** | Instrument version, export timestamp, N, exclusion counts, and the scoring warnings that matter. |

Variable names are SPSS-safe (≤32 characters, alphanumeric plus underscore, never
digit-initial) and numeric responses are written as numbers rather than text, so
SPSS reads them as scale variables instead of strings — the single most common
thing that goes wrong when moving survey data across.

Three conversions are done in the export rather than left to you: CFPB responses
are written as **scored values** rather than option indices; financial literacy
gets a `_correct` and a `_DK` column per item; and `Q_excludeAny` collapses the
three quality flags into one exclusion variable.

---
*Educational adaptation. Not clinical diagnosis and not financial advice.*


## Research governance and participant safeguards

Configured in `client/src/lib/ethics.js`. **The app runs in PILOT MODE until every
governance field is filled in** — a banner is shown and research submission is
disabled, so nothing can be collected under placeholder consent. That guard is
deliberate: an invented ethics reference is worse than a blank field, because
nobody catches it later.

| Safeguard | Implementation |
|---|---|
| Informed consent | 11 sections, 3 mandatory affirmations; no substantive item is administered before consent |
| Partial disclosure declared up front | Consent states that one design aspect is explained only at the end, and that data may be withdrawn at that point |
| Debriefing | Full post-participation screen: which of the four arms the participant was in, what the others were, why the grouping could not be disclosed beforehand, and that all feed posts were fictional |
| Right to withdraw | `DELETE /api/response/:participantId`, exposed as a button in the debrief. Deliberately unauthenticated — withdrawal must never be harder than participating |
| Retention | Stated in consent, configurable; ICMR (2017) sets 3 years as the floor for non-regulatory health research |
| Erasure timeline | 90 days, per the Digital Personal Data Protection Rules, 2025, which carry no research exemption |
| Ethics committee route | Contact details for the committee shown separately from the researcher, so questions about participant rights do not go through the person running the study |
| Distress signposting | Surfaced when CFPB well-being falls to ≤35% of maximum |

### On signposting support

The battery asks whether participants are "just getting by financially" and
whether their "finances control their life". Some will be in genuine hardship. A
study that asks those questions and offers nothing back is not a neutral act.

Shipped helplines, verified from the organisations' own sites, government
sources or peer-reviewed reporting: **Tele-MANAS 14416** (Government of India,
24×7, 20+ languages), **Vandrevala Foundation +91 99996 66555** (24×7, phone and
WhatsApp), **AASRA +91 22 2754 6669** (24×7), **iCALL 9152987821** (Mon–Sat,
hours labelled because it is not a 24-hour service). For grievances against a
lender or intermediary: **RBI CMS 14448** and **SEBI SCORES 1800 266 7575**, both
free to file.

Three deliberate decisions:

1. **Commercial "debt settlement" firms are excluded.** They dominate Indian
   search results for financial distress, charge fees, and some are predatory.
   Signposting them from a study of financial hardship would be an ethics
   failure.
2. **The absence of national debt counselling is stated, not papered over.**
   India has ~2,400 RBI-linked Centres for Financial Literacy, but they run
   awareness programmes rather than individual casework and have no public
   number. The app says so rather than implying free debt advice exists.
3. **AASRA's widely circulated mobile number is not used** — it does not appear
   on the organisation's own site. The landline is.

**Dial-test every number before launch and at each recruitment wave.** A wrong
helpline number is worse than no helpline number.
