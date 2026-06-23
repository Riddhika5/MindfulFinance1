// ===========================================================================
// survey.js  —  the research survey: questions + scoring
// ---------------------------------------------------------------------------
// These items are ADAPTED (simplified, for education) from publicly known
// scales so your project rests on real instruments rather than made-up ones:
//   - Financial well-being items ~ inspired by the CFPB Financial Well-Being Scale
//   - Mindfulness items ~ inspired by the Mindful Attention Awareness Scale (MAAS)
//   - Bias items map 1:1 to the six biases the app already detects
// NOTE: this is an educational adaptation, NOT a clinically validated test.
//
// Each "scale" question is answered 1–5 (Strongly disagree → Strongly agree).
// Some are reverse-scored (a high answer means LOWER well-being/mindfulness);
// those are marked `reverse: true` and flipped during scoring (6 - value).
// ===========================================================================

export const LIKERT = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

export const SURVEY_SECTIONS = [
  {
    title: "About you (optional)",
    note: "Helps group results. You can skip these.",
    items: [
      {
        id: "age",
        type: "choice",
        q: "Your age range",
        options: ["Under 18", "18–24", "25–34", "35–44", "45+", "Prefer not to say"],
      },
      {
        id: "sm_time",
        type: "choice",
        q: "How much time do you spend on social media per day?",
        options: ["Under 30 min", "30 min – 1 hour", "1–3 hours", "3+ hours"],
      },
    ],
  },
  {
    title: "Social media & your money",
    items: [
      { id: "inf1", type: "scale", cat: "influence", q: "I often see investing or shopping content on social media." },
      { id: "inf2", type: "scale", cat: "influence", q: "I have bought or invested in something because I saw it on social media." },
      { id: "inf3", type: "scale", cat: "influence", q: "Seeing other people's purchases or gains makes me want to spend or invest too." },
    ],
  },
  {
    title: "How you make money decisions",
    note: "These map to the six behavioural biases the app detects.",
    items: [
      { id: "fomo", type: "scale", cat: "bias", biasName: "FOMO", q: "I worry about missing out on a deal or opportunity I see online." },
      { id: "herding", type: "scale", cat: "bias", biasName: "Herding", q: "If many people online are buying something, I feel I should buy it too." },
      { id: "loss", type: "scale", cat: "bias", biasName: "Loss aversion", q: "I make quick money decisions when I am afraid of losing money." },
      { id: "recency", type: "scale", cat: "bias", biasName: "Recency bias", q: "Recent news or posts strongly change how I spend or invest." },
      { id: "anchor", type: "scale", cat: "bias", biasName: "Anchoring", q: "A “was ₹999, now ₹499” discount makes me much more likely to buy." },
      { id: "impulse", type: "scale", cat: "bias", biasName: "Impulse spending", q: "I make unplanned purchases after scrolling social media." },
    ],
  },
  {
    title: "Your financial well-being",
    items: [
      { id: "fw1", type: "scale", cat: "wellbeing", reverse: true, q: "Because of my money situation, I feel I will never have the things I want." },
      { id: "fw2", type: "scale", cat: "wellbeing", reverse: true, q: "I am just getting by financially." },
      { id: "fw3", type: "scale", cat: "wellbeing", q: "I could handle a major unexpected expense." },
      { id: "fw4", type: "scale", cat: "wellbeing", q: "I feel in control of my day-to-day finances." },
    ],
  },
  {
    title: "Mindfulness & awareness",
    items: [
      { id: "mf1", type: "scale", cat: "mindfulness", reverse: true, q: "I rush through activities without being really attentive to them." },
      { id: "mf2", type: "scale", cat: "mindfulness", reverse: true, q: "I find it hard to stay focused on what is happening in the present." },
      { id: "mf3", type: "scale", cat: "mindfulness", q: "Before spending, I pause and notice what I am feeling." },
      { id: "mf4", type: "scale", cat: "mindfulness", q: "I am aware of my emotions when I make money decisions." },
    ],
  },
  {
    title: "Financial knowledge (quick quiz)",
    note: "The standard “Big Three” financial-literacy questions (Lusardi & Mitchell). Pick the best answer.",
    items: [
      {
        id: "lit1",
        type: "quiz",
        cat: "literacy",
        q: "You have ₹100 in a savings account earning 2% per year. After 5 years, if you never touch it, you'll have…",
        options: ["More than ₹102", "Exactly ₹102", "Less than ₹102", "Not sure"],
        correct: "More than ₹102",
      },
      {
        id: "lit2",
        type: "quiz",
        cat: "literacy",
        q: "If your savings earn 1% per year but prices (inflation) rise 2% per year, after 1 year you can buy…",
        options: ["More than today", "Exactly the same", "Less than today", "Not sure"],
        correct: "Less than today",
      },
      {
        id: "lit3",
        type: "quiz",
        cat: "literacy",
        q: "True or false: buying a single company's stock usually gives a SAFER return than a stock mutual fund.",
        options: ["True", "False", "Not sure"],
        correct: "False",
      },
    ],
  },
];

// Flat lists (handy for validation/scoring).
export const SCALE_ITEMS = SURVEY_SECTIONS.flatMap((s) => s.items).filter((i) => i.type === "scale");
export const QUIZ_ITEMS = SURVEY_SECTIONS.flatMap((s) => s.items).filter((i) => i.type === "quiz");

// Turn raw answers ({id: 1..5 or choice string}) into a tidy summary.
export function scoreSurvey(answers) {
  const adj = (item) => {
    const v = Number(answers[item.id]);
    if (!v) return null;
    return item.reverse ? 6 - v : v; // flip reverse-scored items
  };
  const avg = (arr) => {
    const nums = arr.filter((n) => n != null);
    return nums.length ? Number((nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2)) : null;
  };

  const byCat = (cat) => SCALE_ITEMS.filter((i) => i.cat === cat).map(adj);

  // per-bias scores (1–5), keyed by bias name
  const bias = {};
  for (const i of SCALE_ITEMS.filter((x) => x.cat === "bias")) {
    const v = adj(i);
    if (v != null) bias[i.biasName] = v;
  }

  // financial-literacy quiz: count correct answers
  let literacyCorrect = 0;
  for (const i of QUIZ_ITEMS) {
    if (answers[i.id] === i.correct) literacyCorrect += 1;
  }
  const literacyTotal = QUIZ_ITEMS.length;
  const literacyPct = literacyTotal ? Math.round((literacyCorrect / literacyTotal) * 100) : null;

  return {
    age: answers.age || "",
    sm_time: answers.sm_time || "",
    bias,
    biasAvg: avg(Object.values(bias)),
    influence: avg(byCat("influence")),
    wellbeing: avg(byCat("wellbeing")),
    mindfulness: avg(byCat("mindfulness")),
    literacyCorrect,
    literacyTotal,
    literacyPct,
  };
}
