// ===========================================================================
// instruments.js — THE VALIDATED INSTRUMENT BANK
// ---------------------------------------------------------------------------
// Every item below is either (a) reproduced from a published, validated
// instrument, or (b) a documented contextual ADAPTATION of one. Nothing here
// is author-invented. Each item carries a `src` key pointing at an entry in
// SOURCES, and each construct carries its scoring rule and the psychometrics
// reported in the source paper.
//
// Provenance levels used in `adapt`:
//   "verbatim"  — item wording is the published wording (currency/locale only)
//   "adapted"   — published item re-anchored to the financial / social-media
//                 context; requires fresh EFA/CFA in the study sample
//   "contextual"— item written from the source's published construct
//                 definition and item pool; requires fresh EFA/CFA
//
// IMPORTANT — permissions:
//   MAAS       : free for research use, cite Brown & Ryan (2003); written
//                permission from the Center for Self-Determination Theory is
//                required for COMMERCIAL use.
//   CFPB       : public domain, free, attribution expected.
//   Big Three  : free, cite Lusardi & Mitchell.
//   FoMO       : reproduced in the source article; cite Przybylski et al. (2013).
//   Bias items : adapted from journal-published sources (Waweru et al., 2008;
//                Kengatharan & Kengatharan, 2014; Glaser & Weber, 2007; Park
//                et al., 2013; Rozenblit & Keil, 2002) plus Pompian (2006) and
//                Nofsinger (2017). Seek author permission before reproducing
//                any source item verbatim in a thesis appendix.
//
// HONEST NOTE ON THIS BATTERY — three of the ten constructs have no validated
// Likert instrument anywhere in the literature, and the code says so per
// construct rather than hiding it:
//   • Overconfidence      — Glaser & Weber use estimation TASKS, not items.
//   • Recency             — no standalone validated scale in investor samples.
//   • Illusion of knowledge — none exists in finance (Franco Moreno et al., 2025);
//                           paired here with the objective literacy score to give
//                           a subjective-objective calibration gap.
// All three therefore require fresh EFA/CFA in the study sample and must be
// reported as scale development, not as adapted validated scales.
// ===========================================================================

export const SOURCES = {
  garbinsky2025: {
    key: "garbinsky2025",
    citation:
      "Garbinsky, E. N., Blanchard, S. J., & Kim, L. (2025). Financial mindfulness: A scale. Personality and Social Psychology Bulletin, 51(9), 1793–1809.",
    doi: "10.1177/01461672241265995",
    instrument: "Financial Mindfulness Scale (8 items; awareness + acceptance)",
    reliability:
      "Nine studies including a financial-services field survey. Predicts sunk cost bias, impulse buying and financial withdrawal INCREMENTALLY over money-management stress, trait self-control and general trait mindfulness.",
    licence:
      "⚠️ ITEM WORDING INCOMPLETE. Two items are reproduced from public summaries; the remaining six are constructed from the published construct definition. RETRIEVE THE ARTICLE AND ITS SUPPLEMENT, replace the wording, and confirm the response anchors before collecting data.",
  },
  brownRyanState: {
    key: "brownRyanState",
    citation:
      "Brown, K. W., & Ryan, R. M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. Journal of Personality and Social Psychology, 84(4), 822–848. [State MAAS, 5 items]",
    doi: "10.1037/0022-3514.84.4.822",
    instrument: "State MAAS (5 items, 0–6)",
    reliability:
      "⚠️ No reliability coefficient is published in any publicly available distribution document. The state version is also absent from the official SDT distribution page. Report your own alpha and treat it as an exploratory manipulation check, not a headline measure.",
    licence: "Travels under the same free-for-research terms as the trait MAAS.",
  },
  rookFisher1995: {
    key: "rookFisher1995",
    citation:
      "Rook, D. W., & Fisher, R. J. (1995). Normative influences on impulsive buying behavior. Journal of Consumer Research, 22(3), 305–313.",
    doi: "10.1086/209452",
    instrument: "Buying Impulsiveness Scale (9 items, 5-point)",
    reliability: "α = .88 (Study 1), .82 (Study 2)",
    licence:
      "Items printed in the article. ⚠️ Three items here follow published wording; the rest are constructed from the construct definition. Verify against the article before collecting.",
  },
  tangney2004: {
    key: "tangney2004",
    citation:
      "Tangney, J. P., Baumeister, R. F., & Boone, A. L. (2004). High self-control predicts good adjustment, less pathology, better grades, and interpersonal success. Journal of Personality, 72(2), 271–324.",
    doi: "10.1111/j.0022-3506.2004.00263.x",
    instrument: "Brief Self-Control Scale (13 items, 5-point)",
    reliability: "⚠️ Secondary sources report α ≈ .75–.85 for the brief form; verify against the original before citing a figure.",
    licence:
      "Free for non-commercial academic research with citation. Included here as a COVARIATE, because trait mindfulness and trait self-control overlap substantially (Bowlin & Baer, 2012: r = .53; the acting-with-awareness facet, which the MAAS most resembles, r = .55).",
  },
  bowlinBaer2012: {
    key: "bowlinBaer2012",
    citation:
      "Bowlin, S. L., & Baer, R. A. (2012). Relationships between mindfulness, self-control, and psychological functioning. Personality and Individual Differences, 52(4), 411–415.",
    doi: "10.1016/j.paid.2011.10.050",
    instrument: "Evidence for the mindfulness / self-control overlap",
    reliability: "N = 280. FFMQ total (excluding observe) r = .53 with self-control; acting with awareness r = .55.",
    licence: "Cited as the basis for including a self-control covariate.",
  },
  vanDam2024: {
    key: "vanDam2024",
    citation:
      "Van Dam, N. T., Targett, J., Burger, A., Davies, J. N., & Galante, J. (2024). Development and validation of the Inventory of Meditation Experiences. Mindfulness, 15(6), 1429–1442.",
    doi: "10.1007/s12671-024-02384-9",
    instrument: "Critique of single-item meditation-practice measures",
    licence:
      "Cited to acknowledge that the meditation-practice items here are an author-constructed practice history, not a validated scale — which pre-empts the objection rather than inviting it.",
  },
  waweru2008: {
    key: "waweru2008",
    citation:
      "Waweru, N. M., Munyoki, E., & Uliana, E. (2008). The effects of behavioural factors in investment decision-making: A survey of institutional investors operating at the Nairobi Stock Exchange. International Journal of Business and Emerging Markets, 1(1), 24–41.",
    doi: "10.1504/IJBEM.2008.019243",
    instrument: "Behavioural factors questionnaire (heuristics, prospect, herding)",
    reliability: "α = .68–.79; N = 23 institutional investors",
    licence:
      "Origin of the most widely adapted item pool in survey behavioural finance. NOTE: small-N survey, Yes/No + 5-point impact format, no CFA. Cited as the source of item CONTENT, not as a validated Likert scale.",
  },
  kengatharan2014: {
    key: "kengatharan2014",
    citation:
      "Kengatharan, L., & Kengatharan, N. (2014). The influence of behavioral factors in making investment decisions and performance: Study on investors of Colombo Stock Exchange, Sri Lanka. Asian Journal of Finance & Accounting, 6(1), 1–23.",
    doi: "10.5296/ajfa.v6i1.4893",
    instrument: "Behavioural factors scale (6-point Likert, EFA-reduced)",
    reliability: "Herding α = .851; heuristics α = .732; prospect α = .618; N = 128; KMO = .630",
    licence:
      "Retained items cover herding, overconfidence, anchoring and prospect. Availability and representativeness items were DROPPED at EFA in the source, so those constructs here draw on Waweru et al. (2008) and Tversky & Kahneman (1974) instead.",
  },
  glaserWeber2007: {
    key: "glaserWeber2007",
    citation:
      "Glaser, M., & Weber, M. (2007). Overconfidence and trading volume. The Geneva Risk and Insurance Review, 32(1), 1–36.",
    doi: "10.1007/s10713-007-0003-3",
    instrument: "Overconfidence measures: miscalibration (90% confidence intervals) and better-than-average (percentile self-placement)",
    reliability: "No α — these are estimation tasks, not reflective scales. misc–volest r = .338; bta1–bta2 r = .646. N = 215.",
    licence:
      "IMPORTANT: the source uses estimation TASKS, not Likert items. The better-than-average and miscalibration constructs are rendered here as agreement items; this is a documented adaptation requiring fresh EFA/CFA. Their key finding — that overconfidence sub-types do not converge — is why this study treats OVC and IOK as separate constructs.",
  },
  pompian2006: {
    key: "pompian2006",
    citation:
      "Pompian, M. M. (2006). Behavioral finance and wealth management: How to build optimal portfolios that account for investor biases. Hoboken, NJ: John Wiley & Sons.",
    instrument: "Bias diagnostic question sets (practitioner tradition)",
    reliability: "None reported — textbook diagnostics, not a psychometric instrument.",
    licence:
      "Cited for bias definitions, the cognitive/emotional taxonomy and the self-report diagnostic tradition. NOT claimed as a validated scale.",
  },
  nofsinger2017: {
    key: "nofsinger2017",
    citation: "Nofsinger, J. R. (2017). The psychology of investing (6th ed.). Abingdon: Routledge.",
    doi: "10.4324/9781315230856",
    instrument: "Conceptual treatment of recency and extrapolative expectations",
    reliability: "None — conceptual textbook, no instrument.",
    licence:
      "Recency has no standalone validated Likert scale in investor samples; existing instruments subsume it within representativeness or anchoring/extrapolation. Items here are built from this conceptual definition plus the extrapolation item retained in Kengatharan & Kengatharan (2014), and require fresh EFA/CFA.",
  },
  park2013: {
    key: "park2013",
    citation:
      "Park, J., Konana, P., Gu, B., Kumar, A., & Raghunathan, R. (2013). Information valuation and confirmation bias in virtual communities: Evidence from stock message boards. Information Systems Research, 24(4), 1050–1067.",
    doi: "10.1287/isre.2013.0492",
    instrument: "Confirmation bias field experiment (−3…+3 click index) + 3-item perceived knowledge scale",
    reliability: "Perceived knowledge α = .81, variance extracted 72.79%; N = 502 investors",
    licence:
      "Confirmation bias in the source is a BEHAVIOURAL click measure, not a Likert scale — the CNF items here are adapted from its selective-exposure paradigm. The 3-item perceived knowledge scale (α = .81) is directly borrowable and informs the IOK items.",
  },
  rozenblitKeil2002: {
    key: "rozenblitKeil2002",
    citation:
      "Rozenblit, L., & Keil, F. (2002). The misunderstood limits of folk science: An illusion of explanatory depth. Cognitive Science, 26(5), 521–562.",
    doi: "10.1207/s15516709cog2605_1",
    instrument: "Illusion of explanatory depth — 7-point self-rated understanding before vs after explaining",
    reliability: "None — a within-subject difference score, not a multi-item scale.",
    licence:
      "No published financial-domain adaptation was located. The IOK items here render self-rated explanatory depth as agreement items and are paired with the objective literacy score to yield a subjective–objective calibration gap, which is the defensible operationalisation (see Franco Moreno et al., 2025).",
  },
  francoMoreno2025: {
    key: "francoMoreno2025",
    citation:
      "Franco Moreno, C. A., Rodríguez-Priego, N., & Galán Valdivieso, F. (2025). A bibliographic review of illusion of knowledge in the financial field. Journal of Interdisciplinary Economics, 37(2), 242–264.",
    doi: "10.1177/02601079231179806",
    instrument: "Systematic review establishing that no unified validated illusion-of-knowledge scale exists in finance",
    licence: "Cited as the evidence for the measurement gap this study addresses.",
  },
  brownRyan2003: {
    key: "brownRyan2003",
    citation:
      "Brown, K. W., & Ryan, R. M. (2003). The benefits of being present: Mindfulness and its role in psychological well-being. Journal of Personality and Social Psychology, 84(4), 822–848.",
    doi: "10.1037/0022-3514.84.4.822",
    instrument: "Mindful Attention Awareness Scale (MAAS)",
    reliability: "α = .80–.87 across samples; 4-week test–retest ICC = .81",
    licence: "Free for research use; commercial use requires CSDT permission.",
  },
  cfpb2015: {
    key: "cfpb2015",
    citation:
      "Consumer Financial Protection Bureau. (2015). Financial well-being: The goal of financial education / CFPB Financial Well-Being Scale user guide. Washington, DC: CFPB.",
    instrument: "CFPB Financial Well-Being Scale (10-item)",
    reliability:
      "IRT graded-response calibration; CFPB reports marginal reliability rather than α.",
    licence: "Public domain; attribution to CFPB expected.",
  },
  bearden1989: {
    key: "bearden1989",
    citation:
      "Bearden, W. O., Netemeyer, R. G., & Teel, J. E. (1989). Measurement of consumer susceptibility to interpersonal influence. Journal of Consumer Research, 15(4), 473–481.",
    doi: "10.1086/209186",
    instrument:
      "Consumer Susceptibility to Interpersonal Influence (CSII) — 12 items, two factors: normative influence (buying to match what others expect or admire) and informational influence (treating others' choices as evidence about what is good).",
    reliability:
      "Normative α = .82–.88; informational α = .82–.83. Replicated across four studies and widely re-validated since.",
    licence:
      "Items printed in the article; free for academic use with citation. Used here as the PARENT for the purchase- and spending-influence items, which are re-anchored from interpersonal influence to social media sources (creators, advertising, brands, celebrities). Reported as contextual adaptation requiring fresh EFA/CFA.",
  },
  susis2023: {
    key: "susis2023",
    citation:
      "Alves de Castro, C. (2023). Designing and validating a method to measure young people's susceptibility to social media influencers: The SUSIS questionnaire. Studies in Media and Communication, 11(6), 398–411.",
    doi: "10.11114/smc.v11i6.6165",
    instrument:
      "SUSIS — Susceptibility to Social Media Influencers Questionnaire. SOCIAL_PERCEPTION subscale (9 items: perception towards influencers, parasocial relationship, consumer trust).",
    reliability:
      "SOCIAL_PERCEPTION α = .829; HARMFUL α = .907; overall influence α = .912. 25 items retained from an initial pool of 112 through factor analysis.",
    licence:
      "Open access (Redfame, CC BY). Items are printed in Table 6 of the article. The HARMFUL subscale is NOT administered here — it rates promotion of violence, tobacco, alcohol and sexual content, which is unrelated to financial decision making and inappropriate in a finance questionnaire.",
  },
  netemeyer2018: {
    key: "netemeyer2018",
    citation:
      "Netemeyer, R. G., Warmath, D., Fernandes, D., & Lynch, J. G. (2018). How am I doing? Perceived financial well-being, its potential antecedents, and its relation to overall well-being. Journal of Consumer Research, 45(1), 68–89.",
    doi: "10.1093/jcr/ucx109",
    instrument: "Perceived Financial Well-Being Scale (PFWBS) — Current Money Management Stress (5 items) + Expected Future Financial Security (5 items)",
    reliability:
      "Current Money Management Stress α = .84; Expected Future Financial Security α = .87 (see also the cross-cultural validation in Journal of Family and Economic Issues, 2026).",
    licence:
      "Published in the article; free for non-commercial academic research with citation. Seek the authors' permission before reproducing the items verbatim in a thesis appendix.",
  },
  lusardiMitchell2014: {
    key: "lusardiMitchell2014",
    citation:
      "Lusardi, A., & Mitchell, O. S. (2014). The economic importance of financial literacy: Theory and evidence. Journal of Economic Literature, 52(1), 5–44.",
    doi: "10.1257/jel.52.1.5",
    instrument: "'Big Three' financial literacy questions (GFLEC Big Five extension)",
    reliability:
      "Formative knowledge index — report % correct and item difficulty, NOT Cronbach's α.",
    licence: "Free to use; cite Lusardi & Mitchell.",
  },
  przybylski2013: {
    key: "przybylski2013",
    citation:
      "Przybylski, A. K., Murayama, K., DeHaan, C. R., & Gladwell, V. (2013). Motivational, emotional, and behavioral correlates of fear of missing out. Computers in Human Behavior, 29(4), 1841–1848.",
    doi: "10.1016/j.chb.2013.02.014",
    instrument: "Fear of Missing Out Scale (FoMOs), 10 items",
    reliability: "α = .87 / .90 / .89 across Studies 1–3",
    licence: "Reproduced in source article; cite Przybylski et al. (2013).",
  },
  ni2020: {
    key: "ni2020",
    citation:
      "Ni, X., Shao, X., Geng, Y., Qu, R., Niu, G., & Wang, Y. (2020). Development of the Social Media Engagement Scale for Adolescents. Frontiers in Psychology, 11, 701.",
    doi: "10.3389/fpsyg.2020.00701",
    instrument: "Social Media Engagement Scale (affective / behavioural / cognitive)",
    reliability: "α = .804 / .798 / .709; ω = .805 / .805 / .712; N = 2,519",
    licence: "Open access (CC BY); adapted here to financial content.",
  },
  ohanian1990: {
    key: "ohanian1990",
    citation:
      "Ohanian, R. (1990). Construction and validation of a scale to measure celebrity endorsers' perceived expertise, trustworthiness, and attractiveness. Journal of Advertising, 19(3), 39–52.",
    doi: "10.1080/00913367.1990.10673191",
    instrument: "Source Credibility Scale (expertise / trustworthiness / attractiveness)",
    reliability: "α > .80 across dimensions; the standard source-credibility instrument",
    licence: "Journal-published; semantic-differential items adapted to Likert here.",
  },
  kahnemanTversky1979: {
    key: "kahnemanTversky1979",
    citation:
      "Kahneman, D., & Tversky, A. (1979). Prospect theory: An analysis of decision under risk. Econometrica, 47(2), 263–291.",
    instrument: "Prospect theory — basis for the loss-aversion self-report items and the gamble task",
    licence: "Theory; task implementation follows Gächter et al. (2022).",
  },
  gachter2022: {
    key: "gachter2022",
    citation:
      "Gächter, S., Johnson, E. J., & Herrmann, A. (2022). Individual-level loss aversion in riskless and risky choices. Theory and Decision, 92(3), 599–624.",
    doi: "10.1007/s11238-021-09839-8",
    instrument: "Six-gamble loss-aversion elicitation (λ at switch point)",
    reliability: "Median λ ≈ 1.15–1.50 in reference samples",
    licence: "Open access; implemented here in ₹ with a fixed gain.",
  },
  tverskyKahneman1974: {
    key: "tverskyKahneman1974",
    citation:
      "Tversky, A., & Kahneman, D. (1974). Judgment under uncertainty: Heuristics and biases. Science, 185(4157), 1124–1131.",
    instrument: "Judgment under uncertainty — basis for the anchoring, availability and representativeness heuristics",
    licence: "Theory; task implementation is the standard random-anchor paradigm.",
  },
  osc2024: {
    key: "osc2024",
    citation:
      "Ontario Securities Commission & The Decision Lab. (2024). Social media and retail investing: The rise of finfluencers. Toronto: OSC.",
    instrument: "Simulated social-media feed + simulated trading RCT (N = 1,465)",
    reliability:
      "38% of participants exposed to un-intervened finance posts bought the promoted asset vs 8% of controls",
    licence: "Public report; paradigm precedent for the SSMF module.",
  },
  sherman2016: {
    key: "sherman2016",
    citation:
      "Sherman, L. E., Payton, A. A., Hernandez, L. M., Greenfield, P. M., & Dapretto, M. (2016). The power of the like in adolescence. Psychological Science, 27(7), 1027–1035.",
    doi: "10.1177/0956797616645673",
    instrument: "Simulated-feed paradigm with manipulated engagement metrics",
    licence: "Paradigm precedent for like-count manipulation in the SSMF module.",
  },
  kuerzinger2024: {
    key: "kuerzinger2024",
    citation:
      "Kuerzinger, L., & Stangor, P. (2024). The relevance and influence of social media posts on investment decisions of young and social media-savvy individuals. Journal of Behavioral and Experimental Finance, 44, 101005.",
    doi: "10.1016/j.jbef.2024.101005",
    instrument: "Synthetic-post exposure experiment with mediation analysis",
    licence: "Paradigm precedent for synthetic-post stimuli.",
  },
};

// ---------------------------------------------------------------------------
// Response scales (anchors reproduced exactly as published)
// ---------------------------------------------------------------------------
export const SCALES = {
  // MAAS: 6-point, 1 = almost always ... 6 = almost never.
  // NOTE: all MAAS items describe a LAPSE of attention. The anchoring already
  // inverts them, so NO further reverse-coding is applied. Applying reverse
  // coding here is the single most common error in applied MAAS papers.
  maas6: {
    id: "maas6",
    points: 6,
    labels: [
      "Almost always",
      "Very frequently",
      "Somewhat frequently",
      "Somewhat infrequently",
      "Very infrequently",
      "Almost never",
    ],
    stem: "How frequently or infrequently do you currently have each experience?",
  },
  // CFPB items 1–6
  cfpbDescribes: {
    id: "cfpbDescribes",
    points: 5,
    values: [4, 3, 2, 1, 0],
    labels: [
      "Describes me completely",
      "Describes me very well",
      "Describes me somewhat",
      "Describes me very little",
      "Does not describe me at all",
    ],
    stem: "How well does this statement describe you or your situation?",
  },
  // CFPB items 7–10
  cfpbOften: {
    id: "cfpbOften",
    points: 5,
    values: [0, 1, 2, 3, 4],
    labels: ["Always", "Often", "Sometimes", "Rarely", "Never"],
    stem: "How often does this statement apply to you?",
  },
  // State MAAS anchors: 0 = not at all, 3 = somewhat, 6 = very much.
  // Stored 1-7 by the UI; scoring subtracts 1 and reverse-scores.
  state7: {
    id: "state7",
    points: 7,
    labels: ["Not at all", "", "", "Somewhat", "", "", "Very much"],
    stem: "Thinking about the last few minutes while you were looking at the feed…",
  },

  // Standard agreement Likert used for bias and social-media constructs.
  agree5: {
    id: "agree5",
    points: 5,
    labels: ["Strongly disagree", "Disagree", "Neither", "Agree", "Strongly agree"],
  },
  // Przybylski et al. (2013) FoMO anchors — RETAINED FOR REFERENCE ONLY.
  // Not administered: FOMO now uses agree5 so the whole adapted battery shares
  // one metric. Kept here so the source anchors remain documented.
  fomo5: {
    id: "fomo5",
    points: 5,
    labels: [
      "Not at all true of me",
      "Slightly true of me",
      "Moderately true of me",
      "Very true of me",
      "Extremely true of me",
    ],
    stem: "Indicate how true each statement is of your general experiences.",
  },
  // Costa et al. (2025) confidence anchors (7-point)
  confidence7: {
    id: "confidence7",
    points: 7,
    labels: [
      "Very little confidence",
      "Little confidence",
      "Some confidence",
      "Moderate confidence",
      "Considerable confidence",
      "High confidence",
      "A lot of confidence",
    ],
  },
};

// ===========================================================================
// BLOCK A — Social media use (descriptive; no scoring)
// ===========================================================================
export const SM_USE = {
  id: "smUse",
  title: "Your social media use",
  icon: "📱",
  scored: false,
  // Cut to two items. The platform multi-select asked nine checkboxes to
  // produce a variable nothing in the analysis plan used.
  note: "Descriptive covariates. Modelled on the usage battery reported alongside Ni et al. (2020) and the OSC (2024) finfluencer survey.",
  sourceLine: "Usage items modelled on the Ontario Securities Commission & The Decision Lab (2024) finfluencer survey and the usage battery reported alongside Ni, Chan & Cheung (2020).",
  items: [
    {
      id: "sm_hours",
      type: "choice",
      q: "On a typical day, roughly how much time do you spend on social media?",
      options: ["Less than 1 hour", "1–2 hours", "3–4 hours", "5 or more hours"],
      src: "osc2024",
      adapt: "contextual",
    },
    {
      id: "sm_fincontent",
      type: "choice",
      q: "How often do you come across financial content (investing tips, money advice, trading, deals) on social media?",
      options: ["Never", "Rarely", "Sometimes", "Often", "Several times a day"],
      src: "osc2024",
      adapt: "contextual",
    },
    // NOTE — `sm_follow` (number of finfluencers followed) was removed at the
    // researcher's instruction to shorten this block. Exposure is now captured
    // by sm_hours × sm_fincontent. `sm_acted` was also removed from this block
    // but RETAINED as SMFI_CRITERION below, where it serves as the criterion
    // variable for the SMFI scale rather than as a descriptive covariate.
  ],
};

// ---------------------------------------------------------------------------
// CRITERION ITEM for the newly developed SMFI scale.
// Rendered at the foot of the SMFI page, NOT in the social-media-use block and
// NOT summed into the SMFI mean. Its only job is criterion validity: a new
// scale must predict something outside itself, and this is the single most
// face-valid behavioural indicator available without a longitudinal design.
// Analysis: Spearman rho(SMFI_mean, sm_acted_num) and an ordinal regression of
// sm_acted_num on SMFI_mean controlling for sm_hours and sm_fincontent.
// ---------------------------------------------------------------------------
export const SMFI_CRITERION = {
  id: "sm_acted",
  type: "choice",
  q: "In the last 12 months, how often have you spent money on something — a purchase, a subscription, a trip, an investment — at least partly because of something you saw on social media?",
  options: ["Never", "Once", "2–3 times", "4–10 times", "More than 10 times"],
  src: "osc2024",
  adapt: "contextual",
};

// ===========================================================================
// BLOCK B — Social Media Financial Influence (SMFI)
// A NEWLY CONSTRUCTED scale. No validated instrument exists for this construct
// (confirmed by the Paradigm 2024 systematic review). Built from three
// validated parents; must be reported as scale DEVELOPMENT with full
// EFA → CFA → HTMT discriminant validity in the sample.
// ===========================================================================
export const SMI = {
  id: "smi",
  title: "Social media and your money",
  icon: "📲",
  scored: true,
  scoring: "mean",
  range: [1, 5],
  scale: "agree5",
  // Unidimensional at 5 items. The two-subscale split was dropped with the
  // cut from 8: two or three indicators per factor is not enough to identify
  // them separately, and one clean 5-item score is worth more than two
  // sub-scores neither of which can be defended.
  note:
    "Five items, every one adapted from a published parent — no author-invented items. Scope is everyday money (buying, spending, saving) and the influence sources are the whole commercial surface of a feed: creators, advertising, brands, celebrities and peers.",
  sourceLine:
    "Adapted from the Consumer Susceptibility to Interpersonal Influence scale (Bearden, Netemeyer & Teel, 1989, Journal of Consumer Research, 15(4), 473–481), the SUSIS questionnaire (Alves de Castro, 2023) and the Source Credibility Scale (Ohanian, 1990).",
  items: [
    // Informational influence (CSII): treating others' choices as evidence.
    { id: "smi1", src: "bearden1989", adapt: "adapted",
      q: "When I want to buy something, I look at what people I follow on social media say about it." },
    // Normative influence (CSII): buying to match what others have.
    { id: "smi2", src: "bearden1989", adapt: "adapted",
      q: "I feel I should own the kinds of things that people I follow on social media have." },
    // Source credibility (Ohanian 1990), re-anchored from one endorser to the
    // mix of creators, brands and celebrities a feed actually contains.
    { id: "smi3", src: "ohanian1990", adapt: "adapted",
      q: "I trust what creators, brands and celebrities on social media say about products and money." },
    // Consumer trust → purchase intention (SUSIS C4).
    { id: "smi4", src: "susis2023", adapt: "adapted",
      q: "I have bought something because I saw it promoted on social media." },
    // Engagement → behaviour (Ni et al. 2020), anchored on the spending plan.
    { id: "smi5", src: "ni2020", adapt: "adapted",
      q: "What I see on social media makes it harder for me to stick to my spending plans." },
  ],
};

/**
 * Legacy alias. The block was called SMFI ("Social Media Financial
 * Influence") while it was a newly developed scale. It is now anchored on
 * SUSIS and is called SMI. The alias keeps older imports working.
 */
export const SMFI = SMI;

// ===========================================================================
// OPEN-ENDED PROBE — shown at the foot of the feed, after every closed item
// in the social-media and bias sections has been answered.
// ---------------------------------------------------------------------------
// Purpose: catch influences the fixed battery does not name. Ten bias
// constructs and a 12-item influence scale between them fix what can be
// reported; anything outside that frame is invisible unless a participant is
// given somewhere to put it. Responses are analysed by inductive thematic
// coding, and a theme that recurs is grounds for a follow-up study or an
// added construct — not for a post-hoc addition to this dataset's models.
//
// Both items are OPTIONAL, by design. A forced free-text box produces "na",
// "nothing" and keyboard mash, which is worse than an empty field because it
// looks like data.
//
// ANONYMITY. Free text is the one place a participant can accidentally
// identify themselves or someone else. The consent form promises anonymity,
// so the prompt says plainly what not to type, and the responses must be
// screened for identifying detail before the dataset is shared or archived.
// ===========================================================================
export const OPEN_ENDED = {
  id: "openEnded",
  title: "Anything we missed?",
  icon: "💬",
  scored: false,
  optional: true,
  sourceLine:
    "Author-constructed open probe. Analysed by inductive thematic coding (Braun & Clarke, 2006) to identify influences not covered by the closed battery.",
  privacyNote:
    "Please do not include your name, anyone else's name, or contact details — your answers are stored anonymously and we cannot remove personal details from them afterwards.",
  items: [
    {
      id: "open_influence",
      type: "text",
      rows: 4,
      maxLength: 1000,
      q: "Apart from the things we have already asked about, is there anything else on social media that influences your money decisions?",
      hint: "Optional. Anything at all — a type of post, a person, a group, a feeling, a habit.",
    },
    {
      id: "open_feed",
      type: "text",
      rows: 3,
      maxLength: 1000,
      q: "Thinking about the posts you just saw — was there anything that made you want to act, or made you hold back, that we did not ask about?",
      hint: "Optional.",
    },
  ],
};

// ===========================================================================
// BLOCK C — Behavioural biases
// Primary anchor: Ritika & Kishor (2022) Behavioral Biases Scale — the only
// published, higher-order-validated instrument covering herding, anchoring,
// availability, representativeness, confirmation and loss aversion together.
// Overconfidence uses Costa et al. (2025), which is purpose-built and
// three-dimensional; "illusion of knowledge" is folded into OVERPRECISION
// rather than treated as a separate construct, because no validated
// illusion-of-knowledge scale exists.
// Financial FOMO adapts Przybylski et al. (2013), re-anchored to investing.
// ===========================================================================

export const BIAS_BLOCKS = [
  { id: "decisionStyle", title: "Following others", icon: "🧭", constructs: ["herding", "fomo"] },
  { id: "judgement", title: "How you judge", icon: "🔎", constructs: ["availability", "anchoring", "overconfidence"] },
];

/**
 * FIVE constructs, 15 items, 3 each.
 * ---------------------------------------------------------------------------
 * Cut from ten constructs to five so the whole instrument fits 30 items. The
 * cut is BY CONSTRUCT, not by items within a construct: three items is the
 * floor at which a construct can still carry a reliability estimate and be
 * identified in a CFA, so trimming ten constructs to two items each would
 * have produced ten unusable scales instead of five usable ones.
 *
 * Retained: herding, FOMO, availability, anchoring, overconfidence — the five
 * with the most direct line to a social-media feed and to everyday spending.
 * Dropped: recency, confirmation, loss aversion, illusion of knowledge,
 * representativeness. They remain in git history and can be restored.
 *
 * EVERY CONSTRUCT NOW SPANS THREE DECISION DOMAINS — investing, spending as a
 * consumer, and saving. The previous battery asked only about investing
 * ("other investors", "the market"), which did not match a research question
 * about consumption and saving; and it asked one question three times in
 * slightly different words ("...which investments to buy / how much to invest
 * / when to buy or sell"). One item per domain per construct removes that
 * repetition, and makes the battery TEST whether a tendency generalises across
 * domains rather than assuming it does.
 *
 * Wording is ADAPTED from the cited parents. Re-anchoring an item to a new
 * decision domain is a contextual adaptation, so the published reliabilities
 * belong to the parents and this battery needs its own EFA/CFA.
 */
export const BIAS_CONSTRUCTS = {
  herding: {
    id: "herding", code: "HER", name: "Herding", plainName: "Following the crowd",
    block: "decisionStyle", scale: "agree5", scoring: "mean",
    src: "waweru2008", src2: "kengatharan2014",
    note: "Herding has the strongest published reliability in this battery (α = .851, Kengatharan & Kengatharan, 2014), but that figure belongs to the investing-only parent; the consumer and saving items are re-anchored and need their own estimate.",
    items: [
      { id: "her1", domain: "investing", adapt: "adapted",
        q: "When people around me are putting money into something, I feel I should put money into it too." },
      { id: "her2", domain: "consumption", adapt: "adapted",
        q: "If something becomes popular with people I know, I am more likely to buy it myself." },
      { id: "her3", domain: "saving", adapt: "adapted",
        q: "I judge whether I am saving enough by looking at what people like me seem to be saving." },
    ],
  },

  fomo: {
    id: "fomo", code: "FOM", name: "Fear of missing out", plainName: "Fear of missing out",
    block: "decisionStyle", scale: "agree5", scoring: "mean",
    src: "przybylski2013",
    note: "Adapted from the FoMO scale. The parent measures social fear of missing out; these items re-anchor it to money — an opportunity, a purchase, and a comparison.",
    items: [
      { id: "fom1", domain: "investing", adapt: "adapted",
        q: "I worry that other people are making money from opportunities I am missing." },
      { id: "fom2", domain: "consumption", adapt: "adapted",
        q: "It bothers me to miss a deal or an offer that everyone else seems to be getting." },
      { id: "fom3", domain: "saving", adapt: "adapted",
        q: "Seeing what other people can afford makes me feel I am falling behind with my own money." },
    ],
  },

  availability: {
    id: "availability", code: "AVL", name: "Availability", plainName: "What comes to mind first",
    block: "judgement", scale: "agree5", scoring: "mean",
    src: "waweru2008", src2: "tverskyKahneman1974",
    note: "Judging how likely or how good something is by how easily examples come to mind. Directly relevant to a feed, which decides what comes to mind.",
    items: [
      { id: "avl1", domain: "investing", adapt: "adapted",
        q: "If I have heard about an investment several times recently, I think it is more likely to do well." },
      { id: "avl2", domain: "consumption", adapt: "adapted",
        q: "Brands I come across often feel more reliable to me than ones I rarely see." },
      { id: "avl3", domain: "saving", adapt: "adapted",
        q: "Stories I have heard about people running into money trouble shape how careful I am with my own." },
    ],
  },

  anchoring: {
    id: "anchoring", code: "ANC", name: "Anchoring", plainName: "Starting from a number",
    block: "judgement", scale: "agree5", scoring: "mean",
    src: "kengatharan2014", src2: "tverskyKahneman1974",
    note: "Anchoring on an arbitrary reference number. The consumer item is the discount anchor, which is the form of anchoring people meet most often on social media.",
    items: [
      { id: "anc1", domain: "consumption", adapt: "adapted",
        q: "A discount feels like a good deal when the original price shown is high, even if I do not know the usual price." },
      { id: "anc2", domain: "investing", adapt: "adapted",
        q: "Whether a price looks cheap or expensive to me depends on the first price I saw for it." },
      { id: "anc3", domain: "saving", adapt: "adapted",
        q: "When I set a savings target, I start from a figure I have seen somewhere rather than from my own budget." },
    ],
  },

  overconfidence: {
    id: "overconfidence", code: "OVC", name: "Overconfidence", plainName: "How sure you feel",
    block: "judgement", scale: "agree5", scoring: "mean",
    src: "glaserWeber2007", src2: "pompian2006",
    note: "Three facets across three domains: overplacement (better than others), overestimation (can tell good from well-marketed) and overprecision (my plan will go as expected). Glaser & Weber measure overconfidence with estimation TASKS rather than Likert items, so these are constructed from the published construct definition and need fresh EFA/CFA.",
    items: [
      { id: "ovc1", domain: "investing", adapt: "adapted",
        q: "I am better than most people at judging which investments will do well." },
      { id: "ovc2", domain: "consumption", adapt: "adapted",
        q: "I can tell a genuinely good product from one that is simply marketed well." },
      { id: "ovc3", domain: "saving", adapt: "adapted",
        q: "I am confident my plans for my money will work out the way I expect." },
    ],
  },
};

// ===========================================================================
// BLOCK D — Behavioural tasks (incentive-compatible measures, not self-report)
// ===========================================================================
export const TASKS = {
  // Gächter, Johnson & Herrmann (2022): six 50–50 gambles, fixed gain,
  // varying loss. λ is read off the switch point.
  lossAversionGamble: {
    id: "lossAversionGamble",
    title: "Six coin-flip choices",
    src: "gachter2022",
    theory: "kahnemanTversky1979",
    instruction:
      "For each coin flip, decide whether you would take the bet. There are no right answers — a 50% chance of each outcome.",
    fixedGain: 6000,
    losses: [2000, 3000, 4000, 5000, 6000, 7000],
    currency: "₹",
    scoring:
      "λ = fixedGain / loss at the switch point (first rejected gamble). Never rejects → λ < 0.86; always rejects → λ > 3.0 (censored).",
  },
  // Tversky & Kahneman (1974) random-anchor estimation.
  anchoringEstimate: {
    id: "anchoringEstimate",
    title: "A quick estimate",
    src: "tverskyKahneman1974",
    instruction:
      "Participants are randomly shown a HIGH or LOW anchor before estimating. Anchor assignment is stored with the response.",
    anchors: { low: 8000, high: 34000 },
    question:
      "Do you think the Nifty 50 will be above or below {anchor} points one year from today? What is your own best estimate?",
    scoring:
      "Anchoring index = (mean estimate | high anchor − mean estimate | low anchor) / (high anchor − low anchor), computed between-subjects.",
  },
};

// ===========================================================================
// BLOCK E — Mindfulness: MAAS-15 (Brown & Ryan, 2003), VERBATIM
// ===========================================================================
export const MAAS = {
  id: "maas",
  title: "Everyday awareness",
  icon: "🌱",
  scale: "maas6",
  scoring: "mean",
  range: [1, 6],
  src: "brownRyan2003",
  reverseNote:
    "Do NOT reverse-code. All items describe attention lapses and the 1 = almost always / 6 = almost never anchoring already inverts them. Higher mean = greater dispositional mindfulness.",
  shortForm: { name: "MAAS-5", items: ["maas7", "maas8", "maas9", "maas10", "maas14"] },
  items: [
    { id: "maas1", adapt: "verbatim", q: "I could be experiencing some emotion and not be conscious of it until some time later." },
    { id: "maas2", adapt: "verbatim", q: "I break or spill things because of carelessness, not paying attention, or thinking of something else." },
    { id: "maas3", adapt: "verbatim", q: "I find it difficult to stay focused on what's happening in the present." },
    { id: "maas4", adapt: "verbatim", q: "I tend to walk quickly to get where I'm going without paying attention to what I experience along the way." },
    { id: "maas5", adapt: "verbatim", q: "I tend not to notice feelings of physical tension or discomfort until they really grab my attention." },
    { id: "maas6", adapt: "verbatim", q: "I forget a person's name almost as soon as I've been told it for the first time." },
    { id: "maas7", adapt: "verbatim", q: "It seems I am 'running on automatic' without much awareness of what I'm doing." },
    { id: "maas8", adapt: "verbatim", q: "I rush through activities without being really attentive to them." },
    { id: "maas9", adapt: "verbatim", q: "I get so focused on the goal I want to achieve that I lose touch with what I'm doing right now to get there." },
    { id: "maas10", adapt: "verbatim", q: "I do jobs or tasks automatically, without being aware of what I'm doing." },
    { id: "maas11", adapt: "verbatim", q: "I find myself listening to someone with one ear, doing something else at the same time." },
    { id: "maas12", adapt: "verbatim", q: "I drive places on 'automatic pilot' and then wonder why I went there." },
    { id: "maas13", adapt: "verbatim", q: "I find myself preoccupied with the future or the past." },
    { id: "maas14", adapt: "verbatim", q: "I find myself doing things without paying attention." },
    { id: "maas15", adapt: "verbatim", q: "I snack without being aware that I'm eating." },
  ],
};

// ===========================================================================
// BLOCK F — CFPB Financial Well-Being Scale (10-item), VERBATIM
// The 10-item form is used deliberately: Heck, Ratcliffe & Tibbitts (2025) show
// the 5-item form runs ~0.90 points lower on average (2.3 points among
// lower-income respondents) because of its higher share of negatively worded items.
// ===========================================================================
/**
 * DEPRECATED as the administered outcome — superseded by FWB (Netemeyer et al.,
 * 2018) so that the whole study shares one agreement metric. Kept in the bank,
 * with its item ids namespaced to cfpb1–cfpb10, so the CFPB form can be
 * restored by flipping DESIGN.wellbeingScale back to "cfpb".
 */
export const CFPB = {
  id: "cfpb",
  title: "Your financial well-being",
  icon: "💰",
  src: "cfpb2015",
  scoring: "cfpbLookup",
  range: [0, 100],
  shortForm: { name: "CFPB-5", items: ["cfpb3", "cfpb5", "cfpb6", "cfpb8", "cfpb10"] },
  items: [
    { id: "cfpb1", scale: "cfpbDescribes", adapt: "verbatim", q: "I could handle a major unexpected expense." },
    { id: "cfpb2", scale: "cfpbDescribes", adapt: "verbatim", q: "I am securing my financial future." },
    { id: "cfpb3", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "Because of my money situation, I feel like I will never have the things I want in life." },
    { id: "cfpb4", scale: "cfpbDescribes", adapt: "verbatim", q: "I can enjoy life because of the way I'm managing my money." },
    { id: "cfpb5", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "I am just getting by financially." },
    { id: "cfpb6", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "I am concerned that the money I have or will save won't last." },
    { id: "cfpb7", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "Giving a gift for a wedding, birthday or other occasion would put a strain on my finances for the month." },
    { id: "cfpb8", scale: "cfpbOften", adapt: "verbatim", q: "I have money left over at the end of the month." },
    { id: "cfpb9", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "I am behind with my finances." },
    { id: "cfpb10", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "My finances control my life." },
  ],
};

// ===========================================================================
// BLOCK F2 — Financial well-being on a UNIFORM AGREEMENT SCALE
// ---------------------------------------------------------------------------
// This REPLACES the CFPB scale as the administered outcome measure.
//
// WHY THE SWAP WAS NECESSARY, stated plainly for the methodology chapter:
// the CFPB scale cannot be moved onto an agree/disagree metric and still be
// the CFPB scale. Its published scores come from an IRT graded-response
// calibration tied to its own two anchor sets ("Describes me completely …"
// and "Always … Never"). Re-anchoring the items to agreement voids the
// CFPB scoring tables, so the 0–100 standardised score and every published
// norm would no longer apply.
//
// Netemeyer et al. (2018) is the correct instrument for that requirement: it
// is a peer-reviewed, widely cited financial well-being scale that was
// DESIGNED on a five-point strongly-disagree → strongly-agree metric, so it
// needs no re-anchoring at all. It is also two-dimensional, which is an
// analytic gain — social media pressure and present-focused decision making
// plausibly hit current money stress and future security differently.
//
// Scoring: CMMS items are negatively worded and are REVERSE-CODED so that a
// high total means better well-being, matching the CFPB direction.
// ===========================================================================
/**
 * CONCEPTUAL FRAMEWORK FOR FINANCIAL WELL-BEING
 * ---------------------------------------------------------------------------
 * Two instruments define this construct in the literature, and the thesis has
 * to be explicit about which one it is measuring and what that costs.
 *
 * CFPB (2015) defines financial well-being on a 2 × 2: a TIME axis (present
 * vs future) crossed with a CONTENT axis (security vs freedom of choice).
 *
 *                    | SECURITY                      | FREEDOM OF CHOICE
 *   -----------------|-------------------------------|--------------------------
 *   PRESENT          | Control over day-to-day and   | Financial freedom to make
 *                    | month-to-month finances       | choices that let you
 *                    |                               | enjoy life
 *   -----------------|-------------------------------|--------------------------
 *   FUTURE           | Capacity to absorb a          | On track to meet your
 *                    | financial shock               | financial goals
 *
 * NETEMEYER et al. (2018) resolves the same construct into TWO empirical
 * factors, which map cleanly onto the CFPB TIME axis and collapse the
 * CONTENT axis:
 *
 *   Current Money Management Stress   ≈ CFPB PRESENT row (both cells)
 *   Expected Future Financial Security ≈ CFPB FUTURE row (both cells)
 *
 * WHAT IS GAINED. Netemeyer separates present from future EMPIRICALLY —
 * they are distinct factors with their own reliabilities (α = .84 and .87),
 * so a predictor can be shown to hit present stress without touching future
 * security, or the reverse. The single CFPB score cannot show that. This
 * matters directly for the research question: social media influence
 * plausibly raises present money stress (impulsive spending, comparison,
 * FOMO purchases) while leaving expected future security untouched, or even
 * inflating it through unrealistic optimism. That is a testable prediction
 * only if the two are measured separately.
 *
 * WHAT IS LOST. The security-vs-freedom distinction. CFPB can say whether a
 * person's difficulty is about having enough or about feeling able to choose;
 * Netemeyer cannot. State this as a limitation rather than leaving it out.
 *
 * The mapping below is used in the codebook, the questionnaire appendix and
 * the methodology chapter so the same framework language appears everywhere.
 */
export const FWB_FRAMEWORK = {
  cfpb: {
    source: "cfpb2015",
    axes: { time: ["Present", "Future"], content: ["Security", "Freedom of choice"] },
    cells: [
      { time: "Present", content: "Security", label: "Control over day-to-day, month-to-month finances" },
      { time: "Present", content: "Freedom of choice", label: "Financial freedom to make choices that allow enjoyment of life" },
      { time: "Future", content: "Security", label: "Capacity to absorb a financial shock" },
      { time: "Future", content: "Freedom of choice", label: "On track to meet financial goals" },
    ],
  },
  netemeyer: {
    source: "netemeyer2018",
    factors: [
      {
        id: "stress",
        name: "Current Money Management Stress",
        alpha: 0.84,
        mapsTo: "CFPB PRESENT row — spans both 'control over day-to-day finances' and 'freedom to enjoy life', without separating them",
        items: ["fwb1", "fwb2", "fwb3", "fwb4", "fwb5"],
      },
      {
        id: "security",
        name: "Expected Future Financial Security",
        alpha: 0.87,
        mapsTo: "CFPB FUTURE row — spans both 'capacity to absorb a shock' and 'on track to meet goals', without separating them",
        items: ["fwb6", "fwb7", "fwb8", "fwb9", "fwb10"],
      },
    ],
  },
  gained:
    "Present and future financial well-being become separate, separately reliable outcomes, so a predictor can be shown to affect one and not the other.",
  lost:
    "The CFPB security vs freedom-of-choice distinction. Report this as a limitation.",
};

export const FWB = {
  id: "fwb",
  title: "Your financial well-being",
  icon: "💰",
  src: "netemeyer2018",
  scale: "agree5",
  scoring: "mean",
  range: [1, 5],
  scored: true,
  sourceLine:
    "Adapted from the Perceived Financial Well-Being Scale — Netemeyer, Warmath, Fernandes & Lynch (2018), Journal of Consumer Research, 45(1), 68–89.",
  note: "Ten items, one 5-point agreement scale. Replaces the CFPB scale so that every attitudinal block in the study shares a single metric. See FWB_FRAMEWORK above for the explicit CFPB-to-Netemeyer dimension mapping.",
  subscales: {
    stress: "Current money management stress (reverse-coded)",
    security: "Expected future financial security",
  },
  items: [
    // --- Current Money Management Stress — all reverse-coded ---------------
    { id: "fwb1", sub: "stress", reverse: true, src: "netemeyer2018", adapt: "verbatim",
      q: "Because of my money situation, I feel I will never have the things I want in life." },
    { id: "fwb2", sub: "stress", reverse: true, src: "netemeyer2018", adapt: "verbatim",
      q: "I am behind with my finances." },
    { id: "fwb3", sub: "stress", reverse: true, src: "netemeyer2018", adapt: "verbatim",
      q: "My finances control my life." },
    { id: "fwb4", sub: "stress", reverse: true, src: "netemeyer2018", adapt: "verbatim",
      q: "Whenever I feel in control of my finances, something happens that sets me back." },
    { id: "fwb5", sub: "stress", reverse: true, src: "netemeyer2018", adapt: "verbatim",
      q: "I am unable to enjoy life because I obsess too much about money." },
    // --- Expected Future Financial Security -------------------------------
    { id: "fwb6", sub: "security", src: "netemeyer2018", adapt: "verbatim",
      q: "I am becoming financially secure." },
    { id: "fwb7", sub: "security", src: "netemeyer2018", adapt: "verbatim",
      q: "I am securing my financial future." },
    { id: "fwb8", sub: "security", src: "netemeyer2018", adapt: "verbatim",
      q: "I will achieve the financial goals that I have set for myself." },
    { id: "fwb9", sub: "security", src: "netemeyer2018", adapt: "verbatim",
      q: "I have saved, or will be able to save, enough money to last me to the end of my life." },
    { id: "fwb10", sub: "security", src: "netemeyer2018", adapt: "verbatim",
      q: "I will be financially secure until the end of my life." },
  ],
};

// ===========================================================================
// BLOCK G — Financial literacy: Lusardi & Mitchell Big Three + Big Five
// Wording is the GFLEC canonical wording with currency localised to ₹.
// 'Do not know' is retained as a distinct option — DK rates are substantively
// informative and must NOT be silently merged into 'incorrect' at collection.
// ===========================================================================
export const LITERACY = {
  id: "literacy",
  title: "Financial knowledge",
  icon: "🧾",
  src: "lusardiMitchell2014",
  scoring: "sumCorrect",
  note: "Formative knowledge index. Report % correct, DK rate and item difficulty — NOT Cronbach's α.",
  skippable: true,
  sourceLine: "'Big Three' plus GFLEC 'Big Five' financial literacy questions — Lusardi & Mitchell (2014), Journal of Economic Literature, 52(1), 5–44. Currency localised to ₹.",
  items: [
    {
      id: "lit1", core: "big3", concept: "Compound interest", adapt: "verbatim (₹ localised)",
      q: "Suppose you had ₹100 in a savings account and the interest rate was 2% per year. After 5 years, how much do you think you would have in the account if you left the money to grow?",
      options: ["More than ₹102", "Exactly ₹102", "Less than ₹102", "Do not know"],
      correct: "More than ₹102",
      explain: "Interest compounds: each year you earn interest on the interest already added. After 5 years you would have about ₹110 — comfortably more than ₹102.",
    },
    {
      id: "lit2", core: "big3", concept: "Inflation", adapt: "verbatim",
      q: "Imagine that the interest rate on your savings account was 1% per year and inflation was 2% per year. After 1 year, how much would you be able to buy with the money in this account?",
      options: ["More than today", "Exactly the same", "Less than today", "Do not know"],
      correct: "Less than today",
      explain: "If prices rise faster than your savings grow, your money buys less than before. Earning 1% while inflation runs at 2% means you lose about 1% of purchasing power each year.",
    },
    {
      id: "lit3", core: "big3", concept: "Risk diversification", adapt: "verbatim",
      q: "Do you think the following statement is true or false? 'Buying a single company stock usually provides a safer return than a stock mutual fund.'",
      options: ["True", "False", "Do not know"],
      correct: "False",
      explain: "A mutual fund spreads your money across many companies, so one company failing hurts far less. A single stock concentrates all the risk in one place.",
    },
    {
      id: "lit4", core: "big5", concept: "Mortgage / loan term", adapt: "verbatim",
      q: "Do you think the following statement is true or false? 'A 15-year home loan typically requires higher monthly payments than a 30-year loan, but the total interest paid over the life of the loan will be less.'",
      options: ["True", "False", "Do not know"],
      correct: "True",
      explain: "A shorter loan means larger monthly payments, but you are borrowing for half as long — so far less total interest accumulates over the life of the loan.",
    },
    {
      id: "lit5", core: "big5", concept: "Bond pricing", adapt: "verbatim",
      q: "If interest rates rise, what will typically happen to bond prices?",
      options: ["They will rise", "They will fall", "They will stay the same", "There is no relationship", "Do not know"],
      correct: "They will fall",
      explain: "Existing bonds pay a fixed rate. When new bonds start paying more, the older lower-paying ones become less attractive, so their price falls until the yields match.",
    },
  ],
};


// ===========================================================================
// BLOCK H — Financial Mindfulness (Garbinsky, Blanchard & Kim, 2025)
// ---------------------------------------------------------------------------
// THE construct for a thesis on "the role of mindfulness in financial
// decisions". The MAAS measures general everyday attention — spilling things,
// driving on autopilot — which is a poor match for a question about money.
// This scale measures awareness of one's actual financial state plus
// acceptance of it, and in the source predicts sunk cost bias, impulse buying
// and financial avoidance INCREMENTALLY over trait self-control and general
// trait mindfulness. That incremental-validity result is the published
// precedent for the discriminant-validity argument this thesis needs.
//
// ⚠️ ITEM WORDING IS PROVISIONAL. FM1 and FM5 follow wording reproduced in
// public summaries of the article. The remaining six are constructed from the
// published construct definition because the item list is paywalled. RETRIEVE
// THE ARTICLE AND ITS SUPPLEMENT AND REPLACE THEM BEFORE COLLECTING DATA.
// ===========================================================================
export const FIN_MINDFULNESS = {
  id: "finMindfulness",
  code: "FMI",
  title: "Awareness of your money",
  icon: "🌱",
  scale: "agree5",
  scoring: "mean",
  range: [1, 5],
  src: "garbinsky2025",
  subscales: { awareness: "Financial awareness", acceptance: "Financial acceptance" },
  items: [
    { id: "fmi1", sub: "awareness", adapt: "verbatim", q: "When I want to buy something, I know exactly how much money I have available to spend." },
    { id: "fmi2", sub: "awareness", adapt: "contextual", q: "I know roughly how much is in my bank account without having to check." },
    { id: "fmi3", sub: "awareness", adapt: "contextual", q: "I could say fairly accurately how much I spent last month." },
    { id: "fmi4", sub: "awareness", adapt: "contextual", q: "I know what I currently owe on any loans, cards or borrowings." },
    { id: "fmi5", sub: "acceptance", adapt: "verbatim", reverse: true, q: "I cannot look at my card or account statements without my emotions taking over." },
    { id: "fmi6", sub: "acceptance", adapt: "contextual", q: "I can look at my whole financial situation calmly, even when it is not good news." },
    { id: "fmi7", sub: "acceptance", adapt: "contextual", reverse: true, q: "Thinking about where I stand financially makes me anxious." },
    { id: "fmi8", sub: "acceptance", adapt: "contextual", q: "I can accept my current financial situation as it is, without being hard on myself about it." },
  ],
};

// ===========================================================================
// BLOCK I — State mindfulness, measured immediately after the feed
// ---------------------------------------------------------------------------
// This is what turns the mindful-pause arm from a behavioural manipulation
// into a test of MECHANISM. Without it, the arm can only show that a pause
// changed behaviour; with it, the claim becomes that the pause changed
// state mindfulness, and that state mindfulness is what changed behaviour.
// That is the difference between "a pause helps" and "mindfulness is the
// route by which it helps" — which is the thesis.
//
// Administered ONCE, immediately after the feed, in every arm.
// ===========================================================================
export const STATE_MAAS = {
  id: "stateMaas",
  code: "SMS",
  title: "How that felt",
  icon: "🫧",
  scale: "state7",
  scoring: "meanReversed",
  range: [0, 6],
  src: "brownRyanState",
  note: "All five items describe lapses and ARE reverse-scored (unlike the trait MAAS, whose anchoring does the inverting). Scored 0–6 after subtracting 1 from the stored 1–7 index.",
  items: [
    { id: "sms1", adapt: "verbatim", q: "I was finding it difficult to stay focused on what was happening." },
    { id: "sms2", adapt: "verbatim", q: "I was doing something without paying attention." },
    { id: "sms3", adapt: "verbatim", q: "I was preoccupied with the future or the past." },
    { id: "sms4", adapt: "verbatim", q: "I was doing something automatically, without being aware of what I was doing." },
    { id: "sms5", adapt: "verbatim", q: "I was rushing through something without being really attentive to it." },
  ],
};

// ===========================================================================
// BLOCK J — Buying impulsiveness (Rook & Fisher, 1995)
// ---------------------------------------------------------------------------
// The missing link in the causal chain. SMFI → bias → FINANCIAL WELL-BEING
// skips a step: well-being is driven mostly by income, debt and savings, and
// is not plausibly moved by a feed in the short run. Impulsive buying is the
// behaviour social media actually acts on, and it is the outcome most likely
// to show an effect of the feed manipulation.
//
// ⚠️ BIS1, BIS3 and BIS9 follow published wording; the rest are constructed
// from the construct definition. Verify against the article before collecting.
// ===========================================================================
export const IMPULSIVENESS = {
  id: "impulsiveness",
  code: "BIS",
  title: "How you buy",
  icon: "🛒",
  scale: "agree5",
  scoring: "mean",
  range: [1, 5],
  src: "rookFisher1995",
  items: [
    { id: "bis1", adapt: "verbatim", q: "I often buy things spontaneously." },
    { id: "bis2", adapt: "contextual", q: "\"Just do it\" describes the way I buy things." },
    { id: "bis3", adapt: "verbatim", q: "\"Buy now, think about it later\" describes me." },
    { id: "bis4", adapt: "contextual", q: "Sometimes I feel like buying things on the spur of the moment." },
    { id: "bis5", adapt: "contextual", q: "I buy things according to how I feel at the moment." },
    { id: "bis6", adapt: "contextual", q: "I carefully plan most of my purchases.", reverse: true },
    { id: "bis7", adapt: "contextual", q: "Sometimes I am a bit reckless about what I buy." },
    { id: "bis8", adapt: "contextual", q: "\"I see it, I buy it\" describes me." },
    { id: "bis9", adapt: "verbatim", q: "I avoid buying things that are not on my shopping list.", reverse: true },
  ],
};

// ===========================================================================
// BLOCK K — Trait self-control (Tangney, Baumeister & Boone, 2004)
// ---------------------------------------------------------------------------
// A COVARIATE, not a construct of interest, and the single most effective
// defence against the objection this thesis will certainly face: "your
// mindfulness effect is just self-control wearing a different name."
//
// The objection has teeth. Bowlin & Baer (2012) report r = .53 between
// mindfulness and self-control overall, and r = .55 for the acting-with-
// awareness facet — which is essentially what the MAAS measures. Without this
// covariate there is no way to answer it. With it, the incremental-validity
// test can be pre-registered and reported.
//
// ⚠️ Item wording follows the widely circulated form of the BSCS. Verify
// against the original article before collecting.
// ===========================================================================
export const SELF_CONTROL = {
  id: "selfControl",
  code: "SCS",
  title: "How you handle temptation",
  icon: "🧭",
  scale: "agree5",
  scoring: "mean",
  range: [1, 5],
  src: "tangney2004",
  note: "Covariate. Pre-register the incremental-validity test: mindfulness predicting the outcome while controlling for this.",
  items: [
    { id: "scs1", adapt: "adapted", q: "I am good at resisting temptation." },
    { id: "scs2", adapt: "adapted", reverse: true, q: "I have a hard time breaking bad habits." },
    { id: "scs3", adapt: "adapted", reverse: true, q: "I am lazy." },
    { id: "scs4", adapt: "adapted", reverse: true, q: "I say inappropriate things." },
    { id: "scs5", adapt: "adapted", reverse: true, q: "I do certain things that are bad for me, if they are fun." },
    { id: "scs6", adapt: "adapted", q: "I refuse things that are bad for me." },
    { id: "scs7", adapt: "adapted", reverse: true, q: "I wish I had more self-discipline." },
    { id: "scs8", adapt: "adapted", q: "People would say that I have iron self-discipline." },
    { id: "scs9", adapt: "adapted", reverse: true, q: "Pleasure and fun sometimes keep me from getting work done." },
    { id: "scs10", adapt: "adapted", reverse: true, q: "I have trouble concentrating." },
    { id: "scs11", adapt: "adapted", q: "I am able to work effectively towards long-term goals." },
    { id: "scs12", adapt: "adapted", reverse: true, q: "Sometimes I cannot stop myself from doing something, even if I know it is wrong." },
    { id: "scs13", adapt: "adapted", reverse: true, q: "I often act without thinking through all the alternatives." },
  ],
};

// ===========================================================================
// BLOCK L — Meditation practice history
// ---------------------------------------------------------------------------
// A necessary covariate in any mindfulness study: people who already meditate
// differ systematically. There is no validated short measure of practice
// history — Van Dam et al. (2024) criticise exactly this gap — so these are
// author-constructed and reported as such, which pre-empts the objection
// rather than inviting it.
// ===========================================================================
export const MEDITATION = {
  id: "meditation",
  title: "Mindfulness practice",
  icon: "🧘",
  scored: false,
  src: "vanDam2024",
  items: [
    { id: "med_ever", type: "choice", q: "Have you ever practised meditation or mindfulness regularly?",
      options: ["No, never", "I tried it briefly", "Yes, in the past", "Yes, currently"] },
    { id: "med_years", type: "choice", q: "If yes, for roughly how long in total?",
      options: ["Not applicable", "Less than 6 months", "6 months to 2 years", "2 to 5 years", "More than 5 years"] },
    { id: "med_days", type: "choice", q: "In the past month, on how many days did you practise?",
      options: ["None", "1–3 days", "4–10 days", "11–20 days", "More than 20 days"] },
  ],
};

// ===========================================================================
// Convenience exports
// ===========================================================================
export const ALL_BIAS_IDS = Object.keys(BIAS_CONSTRUCTS);

export const CONSTRUCT_REGISTRY = [
  { id: "smfi", label: "Social Media Financial Influence", range: [1, 5], source: "ni2020 / ohanian1990" },
  ...ALL_BIAS_IDS.map((k) => ({
    id: k,
    label: BIAS_CONSTRUCTS[k].name,
    range: BIAS_CONSTRUCTS[k].scale === "confidence7" ? [1, 7] : [1, 5],
    source: BIAS_CONSTRUCTS[k].src,
  })),
  { id: "fwb", label: "Financial Well-Being (Netemeyer et al., 2018)", range: [1, 5], source: "netemeyer2018" },
  { id: "literacy", label: "Financial Literacy (Big Five)", range: [0, 5], source: "lusardiMitchell2014" },
];

// Total item count, for the "12–15 minutes" claim on the About screen.
// Read from design.js without importing it, to avoid a circular import:
// design.js does not import instruments.js, but tools that load instruments
// first would otherwise get a partially-initialised module.
const DESIGN_WELLBEING = "netemeyer"; // keep in step with DESIGN.wellbeingScale

// Counts only what is ACTUALLY ADMINISTERED under the current DESIGN, so the
// "about N questions" claim on the consent screen cannot drift away from the
// instrument. Blocks switched off in design.js are excluded.
export const ITEM_COUNT =
  SM_USE.items.length +
  SMFI.items.length +
  1 + // SMFI_CRITERION (sm_acted), shown at the foot of the SMFI page
  ALL_BIAS_IDS.reduce((n, k) => n + BIAS_CONSTRUCTS[k].items.length, 0) +
  (DESIGN_WELLBEING === "both"
    ? FWB.items.length + CFPB.items.length
    : DESIGN_WELLBEING === "cfpb"
      ? CFPB.items.length
      : FWB.items.length) +
  LITERACY.items.length;

/**
 * Blocks retired from the administered instrument but kept in the bank so the
 * design can be reversed without rewriting code:
 *   MAAS, FIN_MINDFULNESS, STATE_MAAS, MEDITATION  — mindfulness
 *   IMPULSIVENESS, SELF_CONTROL                     — behaviour covariates
 *   CFPB                                            — superseded by FWB
 */
export const RETIRED_BLOCK_ITEMS =
  MAAS.items.length + FIN_MINDFULNESS.items.length + STATE_MAAS.items.length +
  MEDITATION.items.length + IMPULSIVENESS.items.length + SELF_CONTROL.items.length +
  CFPB.items.length;

// ---------------------------------------------------------------------------
// Source attribution shown ON THE PAGE, so a participant (and an examiner)
// can see which published instrument each screen is adapted from without
// digging through an appendix.
// ---------------------------------------------------------------------------
export function citationsFor(srcKeys) {
  const seen = new Set();
  const out = [];
  for (const k of [].concat(srcKeys).filter(Boolean)) {
    if (seen.has(k)) continue;
    seen.add(k);
    const src = SOURCES[k];
    if (src?.citation) out.push(src.citation);
  }
  return out;
}

/** All distinct source keys used by a set of bias construct ids. */
export function biasSourceKeys(constructIds) {
  return [].concat(constructIds).flatMap((k) => {
    const c = BIAS_CONSTRUCTS[k];
    return c ? [c.src, c.src2] : [];
  }).filter(Boolean);
}
