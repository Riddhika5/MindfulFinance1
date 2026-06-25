// ===========================================================================
// solutions.js  —  for each bias: a nudge, a choice-architecture tip, and a
// mindfulness prompt. Keyed by the bias "key" returned by biasEngine.js.
// ---------------------------------------------------------------------------
//   - nudge:    a gentle push toward a better default action
//   - choice:   re-arranging your options so the good choice is the easy one
//   - mindful:  a short pause-and-notice exercise
// ===========================================================================

export const SOLUTIONS = {
  fomo: {
    nudge: "Add a 24-hour cooling-off rule: screenshot it now, decide tomorrow. If it's still worth it then, buy it.",
    choice:
      "Make 'do nothing' the default. Keep a separate 'fun money' account; if it's empty, the answer is automatically no.",
    mindful:
      "Pause and name the feeling: 'I feel rushed.' Take 3 slow breaths. Urgency is manufactured — real opportunities rarely vanish in minutes.",
  },
  herding: {
    nudge: "Before copying the crowd, write one sentence on WHY this fits YOUR plan. No reason = no buy.",
    choice:
      "Default to your written plan, not the feed. Pre-decide your monthly investing amount so crowd posts can't change it.",
    mindful:
      "Notice the pull to belong. Ask: 'Am I choosing this, or following?' Picture the crowd being wrong — would you still do it?",
  },
  "loss-aversion": {
    nudge: "Don't act on a scare-post. Set a rule: no buy/sell decisions within 1 hour of reading panic content.",
    choice:
      "Automate it so emotion can't interfere: a fixed monthly auto-invest means market scares never trigger manual panic-selling.",
    mindful:
      "Feel where the fear sits in your body. Remind yourself: a dip on paper is not a real loss until you sell. Breathe, then revisit calmly.",
  },
  recency: {
    nudge: "Zoom out: open your monthly total before the next buy. Compare today's urge to the whole month.",
    choice:
      "Set a weekly spending cap. Once hit, further buys wait until next week by default — recent bursts can't snowball.",
    mindful:
      "Notice that 'right now' feels huge. Ask: 'Will this matter in a month?' Let the bigger timeline calm the moment.",
  },
  anchoring: {
    nudge: "Ignore the 'was' price. Ask only: 'What is this worth to ME at the NOW price?' Decide on that alone.",
    choice:
      "Default to a needs list. If the item isn't already on your list, a discount doesn't add it — the sale becomes irrelevant.",
    mindful:
      "Pause on the discount thrill. Notice the 'before' number was chosen to impress you. Re-read the real price with fresh eyes.",
  },
  impulse: {
    nudge: "Move 'Buy' one step away: log out of saved cards so every purchase needs a deliberate re-entry.",
    choice:
      "Set the feed to a fixed daily time-box, and default-save 10% the moment money arrives so it's gone before scrolling tempts you.",
    mindful:
      "When a reel sparks a buy, pause and notice: 'This want came from a screen, not from me.' Put the phone down for 10 minutes.",
  },
  "knowledge-gap": {
    nudge: "Rule of thumb: if you can't explain it in one sentence, don't put money in it yet. Learn first, invest later.",
    choice:
      "Default to simple, well-understood options (an index fund, a fixed deposit) and treat anything you don't understand as 'no' until you do.",
    mindful:
      "Notice the discomfort of not understanding — that's a signal, not something to hide. Pause and ask 'do I actually get how this works?' before acting.",
  },
  overconfidence: {
    nudge:
      "Before any trade, write your prediction down. Review your past calls monthly — seeing your real hit-rate keeps confidence honest.",
    choice:
      "Default to fewer, slower moves: a fixed monthly auto-invest beats frequent self-directed trades and removes the urge to 'time' the market.",
    mindful:
      "Notice the certainty you feel. Ask: 'What would have to be true for me to be wrong?' Confidence is not the same as being right.",
  },
  "sunk-cost": {
    nudge:
      "Ask the reset question: 'Knowing only today's price, would I buy this now?' If no, money already spent shouldn't change that.",
    choice:
      "Pre-set an exit/stop-loss rule when you enter, so walking away is decided calmly in advance — not in the heat of a loss.",
    mindful:
      "Notice the pull to 'not waste' what you've put in. Money already gone is gone; breathe and choose from where you are now, not the past.",
  },
};

// A general fallback so every bias always has something useful to show.
export const DEFAULT_SOLUTION = {
  nudge: "Build in a short delay before any purchase prompted by social media.",
  choice: "Pre-commit a savings amount so the good choice happens automatically.",
  mindful: "Pause, take three breaths, and ask whether this is a want or a need.",
};

// Bite-size finance basics, shown under the "Knowledge gap" insight so people
// can actually CLOSE the gap (not just be told they have one).
export const LEARN_BASICS = [
  {
    term: "Compound interest",
    text: "Your money earns returns, then those returns earn more. Starting small but early beats starting big but late — time does the heavy lifting.",
  },
  {
    term: "Diversification",
    text: "Don't put all your money in one place. Spreading it (e.g. a mutual fund holding many companies) means one bad bet can't wipe you out.",
  },
  {
    term: "Index fund & SIP",
    text: "An index fund quietly buys a little of many companies. A monthly SIP (fixed amount) into one is a simple, proven long-term strategy — no tips needed.",
  },
  {
    term: "Emergency fund",
    text: "3–6 months of expenses kept safe and easy to reach, so a surprise (job loss, repair) doesn't force you into debt or a panic-sell.",
  },
  {
    term: "Risk vs return",
    text: "Higher promised returns ALWAYS mean higher risk. There is no safe way to 'double your money fast' — that phrasing is the #1 sign of a scam.",
  },
  {
    term: "Spotting a scam",
    text: "Be very wary of: 'guaranteed', 'no risk', paying/sharing an OTP to 'unlock', private DMs, and pressure to 'act now'. Real opportunities don't expire in minutes.",
  },
];

// A short wellness reminder for the knowledge-gap card.
export const WELLNESS_NOTE =
  "Financial wellness isn't about earning the most — it's about feeling in control, spending on purpose, and not letting a screen decide for you. Learning one basic at a time builds that calm confidence.";
