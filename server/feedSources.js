// ===========================================================================
// feedSources.js  —  the PLUGGABLE "feed source" slot
// ---------------------------------------------------------------------------
// A "feed source" is just an object with:
//    - name:        a short id ("reddit", "simulated", ...)
//    - label:       a human-friendly name
//    - fetchPosts:  an async function that returns an ARRAY of posts
//
// Every source must return posts in the SAME shape (we call this "normalized"),
// so the rest of the app never cares where a post came from:
//
//    {
//      id:        unique string,
//      source:    which source it came from,
//      author:    who posted it,
//      text:      the post text we analyze,
//      url:       a link (optional),
//      createdAt: ISO date string
//    }
//
// To add Instagram (Meta) LATER, you only write one new source object below
// and register it in the `sources` map at the bottom. Nothing else changes.
// ===========================================================================

// ---------------------------------------------------------------------------
// SOURCE 1: Simulated "Instagram-style reels"
// Realistic hype / scam / calm financial posts so the app works instantly,
// even with no internet and no API keys.
// ---------------------------------------------------------------------------
const SIMULATED_POSTS = [
  // ---- HYPE / FOMO ----
  {
    author: "@moonshot.gains",
    text: "🚀🚀 This penny stock is about to EXPLODE 100x!! Everyone is buying NOW. Don't miss out, last chance before it moons!!",
    url: "https://example.com/reel/1",
  },
  {
    author: "@hustle.harder",
    text: "Everyone in my group already bought this coin and made bank. If you're not in, you're already late. FOMO is real 😤",
    url: "https://example.com/reel/5",
  },
  {
    author: "@10x.trader",
    text: "I turned ₹10,000 into ₹2 lakh in 3 weeks 🤯 Screenshot proof in my story. Don't be the only one who missed this rocket 🚀",
    url: "https://example.com/reel/11",
  },
  {
    author: "@ipo.frenzy",
    text: "This IPO is oversubscribed 50x! All my friends applied. If you don't apply today you'll regret it forever. Buy now!",
    url: "https://example.com/reel/12",
  },

  // ---- SCAM RISK ----
  {
    author: "@cryptoking_official",
    text: "GUARANTEED returns 🤑 Double your money in 7 days. DM me to join the private group. Limited seats!! 100% safe, no risk.",
    url: "https://example.com/reel/2",
  },
  {
    author: "@trade.signals.pro",
    text: "🔥 Insider tip: this stock will rocket tomorrow morning. Buy at open, thank me later. Act fast, opportunity won't wait!",
    url: "https://example.com/reel/7",
  },
  {
    author: "@forex.guru.vip",
    text: "Secret strategy banks don't want you to know. 100% win rate. Pay ₹999 to unlock my private signals. Get rich this month!",
    url: "https://example.com/reel/13",
  },
  {
    author: "@quick.loan.app",
    text: "Instant ₹50,000 loan, no documents, no risk! Just share your bank OTP to verify. Limited seats, apply fast!",
    url: "https://example.com/reel/14",
  },

  // ---- CALM ADVICE ----
  {
    author: "@calm.investor",
    text: "Boring but true: invest a fixed amount every month in a low-cost index fund and ignore the noise. Time in the market beats timing the market.",
    url: "https://example.com/reel/3",
  },
  {
    author: "@finance.basics",
    text: "Build a 3-6 month emergency fund before investing. Slow, steady, diversified. No hype, just discipline.",
    url: "https://example.com/reel/6",
  },
  {
    author: "@mindful.money",
    text: "Before any purchase, pause and ask: do I want this, or did an ad make me want it? A 24-hour wait removes most regret buys.",
    url: "https://example.com/reel/8",
  },
  {
    author: "@wealth.wisdom",
    text: "Pay yourself first: automatically move 10% of income to savings the day you get paid. Spend what's left, not the other way around.",
    url: "https://example.com/reel/10",
  },
  {
    author: "@sip.sensible",
    text: "A boring monthly SIP in an index fund will quietly beat 90% of 'hot tips'. No drama, just consistency over years.",
    url: "https://example.com/reel/15",
  },

  // ---- ANCHORING (was/now, % off) ----
  {
    author: "@deals.daily",
    text: "MEGA SALE 🔥 Was ₹4999, NOW ₹1499 only! Today only. Cart is filling fast, grab before stock runs out!",
    url: "https://example.com/reel/4",
  },
  {
    author: "@gadget.drops",
    text: "Flagship phone: MRP ₹79,999, now ₹49,999 — 38% off! Lowest price ever. Sale ends at midnight ⏰",
    url: "https://example.com/reel/16",
  },

  // ---- LOSS AVERSION / PANIC ----
  {
    author: "@market.alerts",
    text: "⚠️ MARKET WILL CRASH tomorrow! Sell everything NOW before it drops 40%. Don't lose your hard-earned money, get out now!",
    url: "https://example.com/reel/17",
  },
  {
    author: "@panic.trader",
    text: "Everyone is dumping this stock. If you don't sell now you'll be left holding the bag. Cut your losses before it's zero!",
    url: "https://example.com/reel/18",
  },

  // ---- IMPULSE / LIFESTYLE ----
  {
    author: "@flexlife",
    text: "Treat yourself 💅 New phone, new shoes, new everything. You only live once, swipe that card!",
    url: "https://example.com/reel/9",
  },
  {
    author: "@latenight.shopping",
    text: "Can't sleep? Same 😅 Just added 4 things to cart at 2am. Add to cart is cheaper than therapy, right? 🛒",
    url: "https://example.com/reel/19",
  },
];

const simulatedSource = {
  name: "simulated",
  label: "Simulated reels (offline demo)",
  async fetchPosts() {
    // Add a fresh id + timestamp each time so it behaves like a live feed.
    return SIMULATED_POSTS.map((p, i) => ({
      id: `sim-${i}`,
      source: "simulated",
      author: p.author,
      text: p.text,
      url: p.url,
      createdAt: new Date().toISOString(),
    }));
  },
};

// ---------------------------------------------------------------------------
// SOURCE 2: Reddit (REAL, FREE)
// Pulls public posts from finance subreddits using Reddit's public .json
// endpoints. No API key needed — Reddit just asks for a descriptive
// User-Agent header so they know who is calling.
// ---------------------------------------------------------------------------
const SUBREDDITS = ["wallstreetbets", "IndianStreetBets", "personalfinance"];

const redditSource = {
  name: "reddit",
  label: "Reddit (live public posts)",
  async fetchPosts() {
    const all = [];

    // Reddit blocks blank/generic User-Agents. They recommend the format
    // <platform>:<app-id>:<version> (by /u/username). We also send Accept so
    // we get JSON back. (Note: some cloud/datacenter IPs are blocked with 403
    // no matter what — in that case the app auto-falls back to simulated data.)
    const headers = {
      "User-Agent": "windows:mindfulmoney:v1.0.0 (educational demo)",
      Accept: "application/json",
    };

    for (const sub of SUBREDDITS) {
      // Try the normal host first, then old.reddit.com as a backup.
      let res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8`, { headers });
      if (!res.ok) {
        res = await fetch(`https://old.reddit.com/r/${sub}/hot.json?limit=8`, { headers });
      }

      if (!res.ok) {
        throw new Error(`Reddit returned ${res.status} for r/${sub}`);
      }

      const json = await res.json();
      const children = json?.data?.children || [];

      for (const child of children) {
        const d = child.data;
        if (!d || d.stickied) continue; // skip pinned mod posts

        // Combine title + body text — that's what we analyze.
        const text = [d.title, d.selftext].filter(Boolean).join(" — ");

        all.push({
          id: `reddit-${d.id}`,
          source: "reddit",
          author: `r/${sub} · u/${d.author}`,
          text,
          url: `https://www.reddit.com${d.permalink}`,
          createdAt: new Date((d.created_utc || 0) * 1000).toISOString(),
        });
      }
    }

    if (all.length === 0) {
      throw new Error("Reddit returned no usable posts");
    }
    return all;
  },
};

// ---------------------------------------------------------------------------
// (FUTURE) SOURCE 3: Instagram / Meta
// Left intentionally open. When you have Meta business verification + an
// approved app, write an instagramSource object with the same shape and
// register it in the `sources` map below. Nothing else in the app changes.
// ---------------------------------------------------------------------------
// const instagramSource = { name: "instagram", label: "Instagram", async fetchPosts() { ... } };

// ---------------------------------------------------------------------------
// The registry: maps a source name -> source object.
// ---------------------------------------------------------------------------
const sources = {
  simulated: simulatedSource,
  reddit: redditSource,
  // instagram: instagramSource,   // <-- add here later
};

// getFeed: try the requested source; if it fails for ANY reason, automatically
// fall back to the simulated source so the app ALWAYS shows something.
export async function getFeed(requestedName) {
  const wanted = sources[requestedName] || simulatedSource;

  try {
    const posts = await wanted.fetchPosts();
    return { sourceUsed: wanted.name, fellBack: false, posts };
  } catch (err) {
    console.warn(
      `[feed] source "${wanted.name}" failed (${err.message}); falling back to simulated.`
    );
    const posts = await simulatedSource.fetchPosts();
    return {
      sourceUsed: simulatedSource.name,
      fellBack: true,
      reason: err.message,
      posts,
    };
  }
}

export function listSources() {
  return Object.values(sources).map((s) => ({ name: s.name, label: s.label }));
}
