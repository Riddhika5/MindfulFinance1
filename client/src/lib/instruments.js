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
  note: "Descriptive covariates. Modelled on the usage battery reported alongside Ni et al. (2020) and the OSC (2024) finfluencer survey.",
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
      id: "sm_platforms",
      type: "multi",
      q: "Which platforms do you use at least weekly?",
      options: ["Instagram", "YouTube", "WhatsApp", "X (Twitter)", "LinkedIn", "Reddit", "Facebook", "Telegram", "Other"],
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
    {
      id: "sm_follow",
      type: "choice",
      q: "How many finance creators / 'finfluencers' do you actively follow?",
      options: ["None", "1–2", "3–5", "6–10", "More than 10"],
      src: "osc2024",
      adapt: "contextual",
    },
    {
      id: "sm_acted",
      type: "choice",
      q: "In the last 12 months, have you made a financial decision (bought, sold, invested, or spent) at least partly because of something you saw on social media?",
      options: ["Never", "Once", "2–3 times", "4–10 times", "More than 10 times"],
      src: "osc2024",
      adapt: "contextual",
    },
  ],
};

// ===========================================================================
// BLOCK B — Social Media Financial Influence (SMFI)
// A NEWLY CONSTRUCTED scale. No validated instrument exists for this construct
// (confirmed by the Paradigm 2024 systematic review). Built from three
// validated parents; must be reported as scale DEVELOPMENT with full
// EFA → CFA → HTMT discriminant validity in the sample.
// ===========================================================================
export const SMFI = {
  id: "smfi",
  title: "Social media and your money decisions",
  icon: "📲",
  scored: true,
  scoring: "mean",
  range: [1, 5],
  scale: "agree5",
  note: "Newly developed scale. Parent instruments: Ni et al. (2020) engagement structure; Ohanian (1990) source credibility; eWOM information-adoption items.",
  subscales: {
    engagement: "Financial-content engagement (affective / behavioural / cognitive)",
    credibility: "Perceived finfluencer credibility",
    adoption: "Information adoption and acting on feed content",
  },
  items: [
    // --- Engagement (Ni et al. 2020 tri-factor structure, re-specified) ---
    { id: "smfi1", sub: "engagement", facet: "affective", src: "ni2020", adapt: "adapted",
      q: "I feel excited when I see posts about people making money from investments." },
    { id: "smfi2", sub: "engagement", facet: "affective", src: "ni2020", adapt: "adapted",
      q: "Financial content on social media holds my attention more than other content." },
    { id: "smfi3", sub: "engagement", facet: "behavioural", src: "ni2020", adapt: "adapted",
      q: "I like, save, or share financial posts I come across." },
    { id: "smfi4", sub: "engagement", facet: "behavioural", src: "ni2020", adapt: "adapted",
      q: "I actively search social media for investment or money-saving ideas." },
    { id: "smfi5", sub: "engagement", facet: "cognitive", src: "ni2020", adapt: "adapted",
      q: "I think about financial posts I have seen even after I stop scrolling." },
    { id: "smfi6", sub: "engagement", facet: "cognitive", src: "ni2020", adapt: "adapted",
      q: "Social media is one of my main sources of information about money." },
    // --- Credibility (Ohanian 1990, semantic differential → Likert) ---
    { id: "smfi7", sub: "credibility", facet: "expertise", src: "ohanian1990", adapt: "adapted",
      q: "The finance creators I follow are knowledgeable about investing." },
    { id: "smfi8", sub: "credibility", facet: "trustworthiness", src: "ohanian1990", adapt: "adapted",
      q: "The finance creators I follow are honest about the risks involved." },
    { id: "smfi9", sub: "credibility", facet: "trustworthiness", src: "ohanian1990", adapt: "adapted",
      q: "I can rely on the financial information shared by creators I follow." },
    { id: "smfi10", sub: "credibility", facet: "attractiveness", src: "ohanian1990", adapt: "adapted",
      q: "I find the lifestyle shown by finance creators appealing." },
    // --- Information adoption / acting ---
    { id: "smfi11", sub: "adoption", src: "ni2020", adapt: "contextual",
      q: "I have changed a money decision because of something I saw on social media." },
    { id: "smfi12", sub: "adoption", src: "ni2020", adapt: "contextual",
      q: "Social media posts influence which investments I consider." },
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
  { id: "decisionStyle",        title: "How you decide",                  icon: "🧭", constructs: ["herding", "fomo"] },
  { id: "informationProcessing", title: "How you read information",       icon: "🔎", constructs: ["availability", "confirmation", "representativeness", "recency"] },
  { id: "confidence",           title: "How sure you feel",               icon: "🎯", constructs: ["overconfidence", "illusionOfKnowledge"] },
  { id: "risk",                 title: "How you handle risk and numbers", icon: "⚖️", constructs: ["lossAversion", "anchoring"] },
];

/**
 * Ten constructs, 34 items, all on a 5-point scale.
 * `code` is the short label used in the codebook and CSV export.
 */
export const BIAS_CONSTRUCTS = {
  herding: {
    id: "herding", code: "HER", name: "Herding", plainName: "Following the crowd",
    block: "decisionStyle", scale: "agree5", scoring: "mean",
    src: "waweru2008", src2: "kengatharan2014",
    note: "Herding is the one construct in this battery with strong published reliability (α = .851, Kengatharan & Kengatharan, 2014).",
    items: [
      { id: "her1", adapt: "adapted", q: "Other investors' decisions about which investments to buy influence my own decisions." },
      { id: "her2", adapt: "adapted", q: "Other investors' decisions about how much to invest influence my own decisions." },
      { id: "her3", adapt: "adapted", q: "Other investors' decisions about when to buy or sell influence my own decisions." },
      { id: "her4", adapt: "adapted", q: "I react quickly to changes in other investors' decisions and follow their reactions to the market." },
    ],
  },
  overconfidence: {
    id: "overconfidence", code: "OVC", name: "Overconfidence", plainName: "Backing your own judgment",
    block: "confidence", scale: "agree5", scoring: "mean",
    src: "glaserWeber2007", src2: "pompian2006",
    note: "Items 2–3 render Glaser & Weber's better-than-average measure and item 4 their miscalibration measure as agreement items. The source used estimation tasks, so these are documented adaptations requiring fresh EFA/CFA.",
    items: [
      { id: "ovc1", adapt: "adapted", q: "I believe my skills and knowledge of the market help me to outperform it." },
      { id: "ovc2", adapt: "adapted", q: "I am better than most investors at identifying investments that will perform above average." },
      { id: "ovc3", adapt: "adapted", q: "My returns over the past few years have been better than those of most investors I know." },
      { id: "ovc4", adapt: "adapted", q: "When I estimate what an investment will be worth in future, my estimate is usually close to what actually happens." },
    ],
  },
  fomo: {
    id: "fomo", code: "FOM", name: "FOMO", plainName: "Fear of missing out",
    block: "decisionStyle", scale: "agree5", scoring: "mean",
    src: "przybylski2013",
    note: "Investment-adapted from the FoMOs (α = .87–.90). No validated financial-FOMO scale exists; requires fresh EFA/CFA. SCALE NOTE: the source uses 'not at all true of me … extremely true of me' anchors. Because these items are already an adaptation requiring fresh validation, they are administered on the same 5-point agreement scale as the rest of the battery — a uniform metric across all 46 adapted items makes the second-order factor model cleaner and removes a needless source of method variance. The deviation from source anchors must be reported.",
    items: [
      { id: "fom1", adapt: "adapted", q: "I fear that others are making money on opportunities I am missing." },
      { id: "fom2", adapt: "adapted", q: "I get anxious when I do not know what investments the people around me are making." },
      { id: "fom3", adapt: "adapted", q: "It bothers me when I miss the chance to invest in something that is trending." },
      { id: "fom4", adapt: "adapted", q: "When I make a good return, I feel it is important to tell people about it." },
    ],
  },
  availability: {
    id: "availability", code: "AVL", name: "Availability", plainName: "Going by what comes to mind",
    block: "informationProcessing", scale: "agree5", scoring: "mean",
    src: "waweru2008", src2: "tverskyKahneman1974",
    note: "Kengatharan & Kengatharan's availability items were dropped at EFA in the source, so these draw on Waweru et al. (2008) and the original heuristic definition.",
    items: [
      { id: "avl1", adapt: "adapted", q: "I rely on the information that comes to mind most easily when I make money decisions." },
      { id: "avl2", adapt: "adapted", q: "I prefer to invest in companies I am familiar with rather than ones I know little about." },
      { id: "avl3", adapt: "adapted", q: "A story I have recently heard about someone gaining or losing money strongly affects what I do next." },
    ],
  },
  recency: {
    id: "recency", code: "REC", name: "Recency", plainName: "Weighting what happened lately",
    block: "informationProcessing", scale: "agree5", scoring: "mean",
    src: "nofsinger2017", src2: "kengatharan2014",
    note: "No standalone validated recency scale exists in investor samples; existing instruments subsume recency within representativeness or extrapolation. Item 1 follows the extrapolation item retained in Kengatharan & Kengatharan (2014). DISCRIMINANT VALIDITY: these items are deliberately confined to TEMPORAL WEIGHTING — recent information outweighing older information — with no reference to resemblance or pattern-matching, which belongs to REP. Check HTMT(REC, REP) < 0.85 at analysis.",
    items: [
      { id: "rec1", adapt: "adapted", q: "I forecast future price changes on the basis of recent price changes." },
      { id: "rec2", adapt: "contextual", q: "How an investment has performed lately matters more to me than how it has performed over many years." },
      { id: "rec3", adapt: "contextual", q: "Recent news about the market changes my plans more than older information does." },
    ],
  },
  anchoring: {
    id: "anchoring", code: "ANC", name: "Anchoring", plainName: "Sticking to the first number",
    block: "risk", scale: "agree5", scoring: "mean",
    src: "kengatharan2014", src2: "tverskyKahneman1974",
    items: [
      { id: "anc1", adapt: "adapted", q: "I rely on my previous experiences in the market when making my next investment." },
      { id: "anc2", adapt: "adapted", q: "The price I originally paid strongly affects when I decide to sell an investment." },
      { id: "anc3", adapt: "adapted", q: "I use recent highs or lows as my reference point for judging whether a price is fair." },
    ],
  },
  confirmation: {
    id: "confirmation", code: "CNF", name: "Confirmation bias", plainName: "Looking for agreement",
    block: "informationProcessing", scale: "agree5", scoring: "mean",
    src: "park2013",
    note: "The source measures confirmation bias behaviourally (a −3…+3 selective-exposure click index, N = 502). These items render that selective-exposure paradigm as self-report and require fresh EFA/CFA.",
    items: [
      { id: "cnf1", adapt: "adapted", q: "I prefer to read opinions that agree with the view I already hold about an investment." },
      { id: "cnf2", adapt: "adapted", q: "I pay less attention to information that contradicts a decision I have already made." },
      { id: "cnf3", adapt: "adapted", q: "When I look into an investment, I mostly look for reasons that support what I already think." },
    ],
  },
  lossAversion: {
    id: "lossAversion", code: "LAV", name: "Loss aversion", plainName: "Feeling losses more than gains",
    block: "risk", scale: "agree5", scoring: "mean",
    src: "kahnemanTversky1979", src2: "kengatharan2014",
    note: "Prospect-theory-derived self-report. Item 2 follows the prospect item retained in Kengatharan & Kengatharan (2014), α = .618 in the source.",
    items: [
      { id: "lav1", adapt: "adapted", q: "Losing ₹1,000 causes me more distress than gaining ₹1,000 causes me pleasure." },
      { id: "lav2", adapt: "adapted", q: "I avoid selling investments that have fallen in value, and readily sell those that have risen." },
      { id: "lav3", adapt: "adapted", q: "I avoid investments where I could lose money, even when the expected return is good." },
    ],
  },
  illusionOfKnowledge: {
    id: "illusionOfKnowledge", code: "IOK", name: "Illusion of knowledge", plainName: "Feeling you understand it",
    block: "confidence", scale: "agree5", scoring: "mean",
    src: "rozenblitKeil2002", src2: "glaserWeber2007", src3: "park2013",
    note: "No validated illusion-of-knowledge scale exists in finance (Franco Moreno et al., 2025). Items render self-rated explanatory depth (Rozenblit & Keil, 2002) and perceived knowledge (Park et al., 2013, α = .81) as agreement items. Item 4 is the explanatory-depth hook. Scored BOTH as a subscale and as a subjective–objective calibration gap against the financial literacy score.",
    items: [
      { id: "iok1", adapt: "adapted", q: "I have a good understanding of how the financial products I hold actually work." },
      { id: "iok2", adapt: "adapted", q: "I know enough about the market to judge whether an investment is priced fairly." },
      { id: "iok3", adapt: "adapted", q: "The more financial information I gather, the more accurate my decisions become." },
      { id: "iok4", adapt: "adapted", q: "I could explain in detail, step by step, how a mutual fund actually generates its returns." },
    ],
  },
  representativeness: {
    id: "representativeness", code: "REP", name: "Representativeness", plainName: "Judging by resemblance",
    block: "informationProcessing", scale: "agree5", scoring: "mean",
    src: "tverskyKahneman1974", src2: "waweru2008",
    note: "DISCRIMINANT VALIDITY: these items are deliberately confined to the SIMILARITY heuristic — judging by resemblance to a category or to past winners (REP1, REP2) and sample-size neglect (REP3) — with no reference to recency, which belongs to REC. REP1 is the classic good-company/good-stock error.",
    items: [
      { id: "rep1", adapt: "adapted", q: "A company that makes good products is usually a good investment." },
      { id: "rep2", adapt: "adapted", q: "I judge an investment by how closely it resembles other investments that have done well." },
      { id: "rep3", adapt: "adapted", q: "A small amount of information about an investment is enough for me if it fits a pattern I recognise." },
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
export const CFPB = {
  id: "cfpb",
  title: "Your financial well-being",
  icon: "💰",
  src: "cfpb2015",
  scoring: "cfpbLookup",
  range: [0, 100],
  shortForm: { name: "CFPB-5", items: ["fwb3", "fwb5", "fwb6", "fwb8", "fwb10"] },
  items: [
    { id: "fwb1", scale: "cfpbDescribes", adapt: "verbatim", q: "I could handle a major unexpected expense." },
    { id: "fwb2", scale: "cfpbDescribes", adapt: "verbatim", q: "I am securing my financial future." },
    { id: "fwb3", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "Because of my money situation, I feel like I will never have the things I want in life." },
    { id: "fwb4", scale: "cfpbDescribes", adapt: "verbatim", q: "I can enjoy life because of the way I'm managing my money." },
    { id: "fwb5", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "I am just getting by financially." },
    { id: "fwb6", scale: "cfpbDescribes", adapt: "verbatim", reverse: true, q: "I am concerned that the money I have or will save won't last." },
    { id: "fwb7", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "Giving a gift for a wedding, birthday or other occasion would put a strain on my finances for the month." },
    { id: "fwb8", scale: "cfpbOften", adapt: "verbatim", q: "I have money left over at the end of the month." },
    { id: "fwb9", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "I am behind with my finances." },
    { id: "fwb10", scale: "cfpbOften", adapt: "verbatim", reverse: true, q: "My finances control my life." },
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
  { id: "maas", label: "Mindfulness (MAAS)", range: [1, 6], source: "brownRyan2003" },
  { id: "cfpb", label: "Financial Well-Being (CFPB)", range: [0, 100], source: "cfpb2015" },
  { id: "literacy", label: "Financial Literacy (Big Five)", range: [0, 5], source: "lusardiMitchell2014" },
];

// Total item count, for the "12–15 minutes" claim on the About screen.
export const ITEM_COUNT =
  SM_USE.items.length +
  SMFI.items.length +
  ALL_BIAS_IDS.reduce((n, k) => n + BIAS_CONSTRUCTS[k].items.length, 0) +
  MAAS.items.length +
  CFPB.items.length +
  LITERACY.items.length;
