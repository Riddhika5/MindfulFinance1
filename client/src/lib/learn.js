// ===========================================================================
// learn.js — the Improve phase: micro-modules and behavioural nudges
// ---------------------------------------------------------------------------
// Each module is tied to a measured construct so the app can surface the two
// or three that matter most for a given participant. Language is deliberately
// non-clinical: "tendency", never "disorder"; "notice", never "diagnosis".
// ===========================================================================

export const MODULES = {
  herding: {
    id: "herding",
    title: "Following the crowd",
    seconds: 30,
    what: "Herding is copying what a lot of other people appear to be doing, instead of judging the thing itself. Feeds make it worse because they show you agreement, not disagreement — you see the people who bought, almost never the people who quietly didn't.",
    why: "Information cascades mean the hundredth person to buy adds no new information; they are just copying the ninety-nine before them. The crowd can be large and still be uninformed.",
    do: "Before acting on something popular, write one sentence explaining why it is a good decision that does not contain the word 'everyone'. If you can't, that's your answer.",
    citation: "Banerjee (1992); Bikhchandani, Hirshleifer & Welch (1992)",
  },
  fomo: {
    id: "fomo",
    title: "Fear of missing out",
    seconds: 30,
    what: "FOMO is the anxious sense that others are getting a gain you're not. In money decisions it shortens the gap between seeing something and acting on it.",
    why: "Urgency is the most reliable persuasion technique there is, precisely because it removes the time you'd otherwise use to check. Real opportunities survive a night's sleep.",
    do: "Apply a 24-hour rule to anything you first heard about on social media. Put it in your notes with the date. Most of it will look different tomorrow.",
    citation: "Przybylski et al. (2013); Friederich et al. (2024)",
  },
  availability: {
    id: "availability",
    title: "Going by what comes to mind",
    seconds: 30,
    what: "You judge how likely something is by how easily you can recall an example. Vivid stories — someone's ₹8 lakh screenshot — are easy to recall, so they feel common.",
    why: "Feeds are not a random sample of reality. Wins get posted, losses don't. What you can bring to mind easily is a measure of what gets posted, not what usually happens.",
    do: "Ask: for every person posting this win, how many people did the same thing and posted nothing? You'll never see them, which is the point.",
    citation: "Tversky & Kahneman (1973)",
  },
  confirmation: {
    id: "confirmation",
    title: "Looking for agreement",
    seconds: 30,
    what: "Once you've formed a view, you search for information that supports it and discount information that doesn't — usually without noticing you're doing it.",
    why: "Recommendation algorithms amplify this by learning what you engage with and giving you more of it. Your feed becomes evidence for whatever you already thought.",
    do: "Before a decision, deliberately look for the strongest argument against it. Search the asset's name with the word 'risk' or 'concerns'. Read it properly.",
    citation: "Park, Konana, Gu, Kumar & Raghunathan (2013)",
  },
  representativeness: {
    id: "representativeness",
    title: "Judging by resemblance",
    seconds: 30,
    what: "You judge something by how much it resembles a pattern you already know — 'this looks like the last big winner' — rather than by base rates.",
    why: "A short run of good performance is extremely weak evidence about the future. Similarity to past winners is not a mechanism; it's a coincidence you've noticed after the fact.",
    do: "Ask what would have to be true for this to work, and whether that thing is actually true — separately from what the chart looks like.",
    citation: "Tversky & Kahneman (1974)",
  },
  overconfidence: {
    id: "overconfidence",
    title: "Backing your own judgment",
    seconds: 30,
    what: "Overconfidence is rating your own judgment more highly than the results justify — about returns, about risk, and about how you compare with other investors.",
    why: "Almost everyone rates themselves above average, which cannot be true. And the evidence on trading is consistent: the more people trade on their own judgment, the worse their net returns tend to be.",
    do: "Write down your prediction and the date before you act. Check it in three months. Nothing calibrates like your own track record in your own handwriting.",
    citation: "Glaser & Weber (2007); Barber & Odean (2000, 2001); Pompian (2006)",
  },
  illusionOfKnowledge: {
    id: "illusionOfKnowledge",
    title: "Feeling you understand it",
    seconds: 30,
    what: "The illusion of knowledge is the sense that you understand how something works in more depth than you actually do. People confidently rate their understanding highly — until they try to explain the mechanism step by step, and the rating collapses.",
    why: "Feeds make this worse, because volume feels like understanding. An hour of scrolling raises confidence far faster than it raises accuracy, and there is no moment that forces you to test the difference.",
    do: "Pick one product you hold and try to explain, out loud and step by step, how it actually makes money. Where you stumble is the real edge of what you know.",
    citation: "Rozenblit & Keil (2002); Glaser & Weber (2007); Park et al. (2013)",
  },
  recency: {
    id: "recency",
    title: "Weighting what happened lately",
    seconds: 30,
    what: "Recency is letting the last few weeks or months carry more weight than the last few years, and expecting whatever has been happening to keep happening.",
    why: "Feeds are built out of the recent by definition — you almost never see a post about the last decade. That makes the newest information feel like the most important information, when usually it is the least informative.",
    do: "Before deciding, deliberately look at a ten-year chart rather than a one-month one. If the decision changes, recency was doing the work.",
    citation: "Nofsinger (2017); Kengatharan & Kengatharan (2014)",
  },
  lossAversion: {
    id: "lossAversion",
    title: "Feeling losses more than gains",
    seconds: 30,
    what: "Losses hurt roughly twice as much as equivalent gains feel good. That asymmetry drives panic selling and, oddly, also holding losers too long.",
    why: "Selling makes a paper loss real. Avoiding that feeling is a powerful motive, and it is not the same as a good reason to hold.",
    do: "Decide your exit rule when you're calm and write it down. A rule made in advance is the only one that survives a bad week.",
    citation: "Kahneman & Tversky (1979); Gächter et al. (2022)",
  },
  anchoring: {
    id: "anchoring",
    title: "Sticking to the first number",
    seconds: 30,
    what: "The first number you see — a past high, an original price, a strike-through — becomes the reference point everything else is judged against, even when it's arbitrary.",
    why: "'Was ₹1,240, now ₹610' tells you about the past price, not about what it's worth. Anchors work even when you know they're arbitrary.",
    do: "Value the thing without looking at its price history. Then look. If the two disagree, trust the first one.",
    citation: "Tversky & Kahneman (1974)",
  },
  smfi: {
    id: "smfi",
    title: "Your feed and your money",
    seconds: 30,
    what: "Social media isn't a neutral information source about money. It's an engagement-optimised one, and confident, urgent, high-return content engages best.",
    why: "That means the financial content that reaches you is selected for how well it performs, not how well it holds up. The selection happens before you ever see it.",
    do: "Separate discovery from decision. It's fine to find ideas in a feed. Make the actual decision somewhere else, on a different day, from independent sources.",
    citation: "OSC & The Decision Lab (2024); Kuerzinger & Stangor (2024)",
  },
  mindfulness: {
    id: "mindfulness",
    title: "Noticing before deciding",
    seconds: 30,
    what: "Dispositional mindfulness is how often you're actually present to what you're doing, rather than running on automatic.",
    why: "Almost every bias above needs one thing to operate: acting before noticing. Attention is the gap where a different decision becomes possible.",
    do: "Before any financial action that came from a screen, name the feeling out loud — 'this is urgency', 'this is envy', 'this is fear'. Naming it is usually enough to slow it.",
    citation: "Brown & Ryan (2003)",
  },
};

/** This week's challenge, chosen from the participant's top construct. */
export const CHALLENGES = {
  herding: "This week: before acting on anything popular, write one sentence for why it's a good decision that doesn't use the word 'everyone'.",
  fomo: "This week: apply a 24-hour rule. Anything you first saw on social media waits a day and gets checked against two independent sources.",
  availability: "This week: for every win you see posted, write down one line about who didn't post.",
  confirmation: "This week: for one decision you're leaning towards, deliberately read the strongest argument against it before acting.",
  representativeness: "This week: for any investment that 'looks like' a past winner, write what would actually have to be true for it to work.",
  overconfidence: "This week: write down one prediction with a date. Set a reminder to check it in three months.",
  illusionOfKnowledge: "This week: pick one thing you hold and try to explain, step by step, how it actually makes money. Note where you stumble.",
  recency: "This week: before any decision, look at a ten-year chart before a one-month one.",
  lossAversion: "This week: write your exit rule for one holding while you're calm, and keep it where you'll find it.",
  anchoring: "This week: when you see a discount or a past high, cover the old number and ask what you'd pay knowing nothing about it.",
  default: "This week: before your next financial decision that came from social media, wait 24 hours and compare two independent sources.",
};
