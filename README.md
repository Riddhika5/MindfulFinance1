# 🪙 MindfulFinance

A web app that shows how social media influences your spending. It pulls a
financial feed (real Reddit posts or simulated reels), lets you track expenses,
detects behavioral-finance **biases**, and gives **nudges + choice-architecture
tips + mindfulness prompts** — plus a 0–100 Financial Well-being Score.

## What's inside

```
behavioral-finance-app/
├─ package.json          # runs server + client together
├─ server/               # small Express backend
│  ├─ index.js           #   the API (/api/feed, /api/sources, /api/health)
│  └─ feedSources.js     #   the PLUGGABLE feed-source slot (reddit + simulated)
└─ client/               # Vite + React front-end
   └─ src/
      ├─ App.jsx          # main screen, ties everything together
      ├─ components/      # Feed, ExpenseTracker, InsightsPanel
      └─ lib/             # tagging, biasEngine, solutions, score, storage
```

## How to run (first time)

1. Install everything (once):

   ```
   npm run setup
   ```

2. Start the app (server + client together):

   ```
   npm run dev
   ```

3. Open the URL it prints — **http://localhost:5173**

The Express server runs on http://localhost:4000 and the React app talks to it
through `/api` (Vite proxies it automatically).

## How to use it

1. **Feed** — scroll posts (auto-tagged hype / scam-risk / calm-advice). Tap
   "This influenced me" or "Made me want to buy/sell".
2. **Expenses** — add what you spent; optionally link the post that triggered it.
3. **Insights** — see your detected biases (with reasons + solutions) and your
   well-being score.

Switch the **Feed source** dropdown (top-right) between *Simulated reels* and
*Reddit (live)*. If Reddit fails, it auto-falls back to simulated data.

## Notes
- Currency is ₹ (Indian Rupees).
- Your data (expenses, marked posts) stays in your browser via `localStorage`.
- Educational tool for self-awareness — not financial advice.
- To add Instagram later: add one source object in `server/feedSources.js`.
