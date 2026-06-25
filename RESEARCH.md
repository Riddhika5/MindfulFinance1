# Why these biases? — research basis for MindfulFinance

MindfulFinance detects **9 behavioural-finance biases**. They were not picked at
random — each had to pass **three filters**.

## Selection criteria
1. **Established in the literature** — documented in peer-reviewed behavioural
   economics / finance research, not pop psychology.
2. **Triggered or amplified by social media** — it must be something a hype /
   scam-risk / calm feed can realistically set off (this app is specifically about
   *social-media influence on money*).
3. **Detectable from the data we have** — inferable from what the app can actually
   observe: the posts you engage with and the expenses you log. Biases we cannot
   observe were deliberately left out.

## The 9 biases and their sources
| Bias | Why it's in scope | Key research |
|------|-------------------|--------------|
| Loss aversion | "Sell before it crashes / panic" posts exploit it | Kahneman & Tversky, *Prospect Theory* (1979) |
| Anchoring | "Was ₹999, now ₹499" pricing is textbook anchoring | Tversky & Kahneman, *Judgment under Uncertainty* (1974) |
| Recency bias (availability) | A burst of recent posts/buys feels "normal" | Tversky & Kahneman, *Availability* (1973) |
| Herding | "Everyone is buying this" cascades | Banerjee (1992); Bikhchandani, Hirshleifer & Welch (1992) |
| FOMO | Core driver of social-media-led spending | Przybylski et al., *FoMO scale* (2013) |
| Impulse / doomscroll spending | Scrolling lowers self-control right before a buy | Rook, *The Buying Impulse* (1987) |
| Knowledge gap (low financial literacy) | Acting on misunderstood tips → hype & scams | Lusardi & Mitchell (2014) |
| **Overconfidence** (new) | Over-trading on "sure-win" tips | Barber & Odean, *Trading Is Hazardous to Your Wealth* (2000); *Boys Will Be Boys* (2001) |
| **Sunk-cost fallacy** (new) | "Average down to recover" / "double down" content | Arkes & Blumer, *The Psychology of Sunk Cost* (1985) |

## Why overconfidence and sunk-cost specifically?
- **Overconfidence** is the single most-studied bias behind *excessive trading*, and
  social feeds are full of "guaranteed", "easy 2x", "trust me" tips that inflate it.
  Barber & Odean showed empirically that the more people trade (the behavioural
  signature of overconfidence), the worse their net returns. The app already sees
  trade urges, so it is **detectable**.
- **Sunk-cost fallacy** is the classic trap behind "buy the dip to recover" and
  "I'm already in, I'll average down" — extremely common in crypto/stock hype
  communities. Arkes & Blumer established it as a robust, money-specific error.
  It maps cleanly onto posts/notes the app can read.

Both pass all three filters, which is exactly why they were chosen over other
candidates.

## Why NOT other famous biases (yet)?
Biases such as **framing**, **mental accounting**, and **hyperbolic discounting** are
real and important, but were **excluded for this version** because they fail
**criterion 3** — they can't be detected reliably from feed-engagement + expense
data alone. They need richer inputs (full transaction history, or deliberately
framed A/B choices) that the app does not yet collect. They are strong candidates
for a future version.

---
*Educational adaptation. References are for academic grounding, not clinical
diagnosis or financial advice.*
