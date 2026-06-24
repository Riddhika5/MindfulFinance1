// ===========================================================================
// App.jsx — the main screen. Holds the data, talks to the server, and wires
// the three tabs (Feed, Expenses, Insights) together.
// ===========================================================================

import { useEffect, useMemo, useState } from "react";
import Feed from "./components/Feed.jsx";
import ExpenseTracker from "./components/ExpenseTracker.jsx";
import InsightsPanel from "./components/InsightsPanel.jsx";
import CommunityResults from "./components/CommunityResults.jsx";
import Survey from "./components/Survey.jsx";
import Challenge from "./components/Challenge.jsx";
import { tagPost } from "./lib/tagging.js";
import { detectBiases } from "./lib/biasEngine.js";
import { computeScore } from "./lib/score.js";
import { load, save } from "./lib/storage.js";

export default function App() {
  const [tab, setTab] = useState("feed");

  // ---- feed state ---------------------------------------------------------
  const [source, setSource] = useState("simulated"); // which feed source to ask for
  const [sources, setSources] = useState([]); // list for the dropdown
  const [posts, setPosts] = useState([]); // tagged posts
  const [sourceInfo, setSourceInfo] = useState(null); // {sourceUsed, fellBack, reason}
  const [loadingFeed, setLoadingFeed] = useState(false);

  // ---- user data (persisted in the browser) -------------------------------
  const [engagements, setEngagements] = useState(() => load("engagements", {}));
  const [expenses, setExpenses] = useState(() => load("expenses", []));

  // "Did this help?" votes, keyed like "fomo:nudge" -> "up" | "down".
  const [votes, setVotes] = useState(() => load("helpfulness", {}));
  // A history of daily well-being scores so we can show a trend over time.
  const [scoreHistory, setScoreHistory] = useState(() => load("scoreHistory", []));
  // Before/after "challenges" the user commits to.
  const [challenges, setChallenges] = useState(() => load("challenges", []));

  // Save whenever they change.
  useEffect(() => save("engagements", engagements), [engagements]);
  useEffect(() => save("expenses", expenses), [expenses]);
  useEffect(() => save("helpfulness", votes), [votes]);
  useEffect(() => save("scoreHistory", scoreHistory), [scoreHistory]);
  useEffect(() => save("challenges", challenges), [challenges]);

  // Record (or update) today's score so the trend chart can grow over days.
  function recordScore(value) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    setScoreHistory((prev) => {
      const rest = prev.filter((p) => p.date !== today);
      return [...rest, { date: today, score: value }].slice(-30); // keep last 30 days
    });
  }

  // Toggle a helpfulness vote. Clicking the same vote again clears it.
  function voteHelpful(biasKey, type, vote) {
    const k = `${biasKey}:${type}`;
    setVotes((prev) => {
      const next = { ...prev };
      if (next[k] === vote) delete next[k];
      else next[k] = vote;
      return next;
    });
  }

  // Load the list of sources once.
  useEffect(() => {
    fetch("/api/sources")
      .then((r) => r.json())
      .then((d) => setSources(d.sources || []))
      .catch(() => setSources([{ name: "simulated", label: "Simulated reels" }]));
  }, []);

  // Fetch the feed (and re-tag the posts) whenever the source changes.
  async function loadFeed(which = source) {
    setLoadingFeed(true);
    try {
      const r = await fetch(`/api/feed?source=${encodeURIComponent(which)}`);
      const d = await r.json();
      const tagged = (d.posts || []).map((p) => {
        const t = tagPost(p.text);
        return { ...p, tag: t.tag, label: t.label, emoji: t.emoji, matched: t.matched };
      });
      setPosts(tagged);
      setSourceInfo({ sourceUsed: d.sourceUsed, fellBack: d.fellBack, reason: d.reason });
    } catch (err) {
      setSourceInfo({ sourceUsed: "none", fellBack: true, reason: "server unreachable" });
      setPosts([]);
    } finally {
      setLoadingFeed(false);
    }
  }

  useEffect(() => {
    loadFeed(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source]);

  // ---- engagement toggle ("influenced me" / "buy-sell") -------------------
  function toggleEngagement(post, kind) {
    setEngagements((prev) => {
      const existing = prev[post.id] || {
        post: { id: post.id, author: post.author, text: post.text, tag: post.tag, url: post.url },
        influenced: false,
        trade: false,
        anxious: false,
        confused: false, // "I didn't fully understand this" (low financial literacy)
        notInfluenced: false, // "this didn't influence me" (resistance — a good sign)
        at: new Date().toISOString(),
      };
      const updated = { ...existing, [kind]: !existing[kind], at: new Date().toISOString() };
      return { ...prev, [post.id]: updated };
    });
  }

  // ---- expenses -----------------------------------------------------------
  function addExpense(exp) {
    setExpenses((prev) => [...prev, exp]);
  }
  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  // ---- live analysis ------------------------------------------------------
  // Turn the engagement map into the array shape the engine expects, keeping
  // only posts the user actually reacted to.
  const engagementList = useMemo(
    () => Object.values(engagements).filter((e) => e.influenced || e.trade || e.anxious || e.confused),
    [engagements]
  );

  const biases = useMemo(
    () => detectBiases({ expenses, engagements: engagementList }),
    [expenses, engagementList]
  );

  const score = useMemo(
    () => computeScore({ expenses, engagements: engagementList, biases }),
    [expenses, engagementList, biases]
  );

  // Once there's real data, log today's score for the trend chart.
  useEffect(() => {
    if (score.hasData) recordScore(score.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score.score, score.hasData]);

  const biasCount = biases.length;

  // ---- challenge handlers (before/after score tracking) -------------------
  function startChallenge(template) {
    const record = {
      id: "ch-" + Date.now(),
      key: template.key,
      title: template.title,
      type: template.type,
      days: template.days,
      startDate: new Date().toISOString(),
      startScore: score.score,
      endScore: null,
      status: "active",
    };
    // only one active challenge at a time
    setChallenges((prev) => [...prev.filter((c) => c.status !== "active"), record]);
  }
  function finishChallenge(id) {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "done", endScore: score.score, completedDate: new Date().toISOString() } : c
      )
    );
  }
  function cancelChallenge(id) {
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }

  // Build the snapshot we'd share to the community dashboard (no private detail).
  const shareSnapshot = useMemo(() => {
    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const help = { nudge: { up: 0, down: 0 }, choice: { up: 0, down: 0 }, mindful: { up: 0, down: 0 } };
    for (const [k, v] of Object.entries(votes)) {
      const type = k.split(":")[1];
      if (help[type] && (v === "up" || v === "down")) help[type][v] += 1;
    }
    return {
      score: score.score,
      band: score.band,
      biasNames: biases.map((b) => b.name),
      expenseCount: expenses.length,
      totalSpent,
      help,
    };
  }, [score, biases, expenses, votes]);

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>🪙 MindfulFinance</h1>
          <p className="tagline">See how social media nudges your spending — and take back control.</p>
        </div>

        <div className="source-picker">
          <label className="small">Feed source</label>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            {sources.map((s) => (
              <option key={s.name} value={s.name}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="intro">
        <p>
          <strong>The goal: your financial well-being</strong> — feeling in control of your money
          today and calm about tomorrow. MindfulFinance shows how social media quietly nudges your
          spending, spots the behavioural biases behind it, and offers gentle nudges, smarter
          defaults, and mindfulness prompts to help you spend on purpose.
        </p>
        <p className="small muted">
          📱 <strong>Your Feed</strong> is a scroll of real financial posts (pulled from Reddit) or
          realistic sample posts — each auto-labelled <em>hype</em>, <em>scam-risk</em>, or{" "}
          <em>calm advice</em>. Tap “this influenced me” on any post that made you want to buy or
          sell, and the app learns what’s really driving your money decisions.
        </p>
      </section>

      <nav className="tabs">
        <button className={tab === "feed" ? "tab tab-on" : "tab"} onClick={() => setTab("feed")}>
          📱 Feed
        </button>
        <button
          className={tab === "expenses" ? "tab tab-on" : "tab"}
          onClick={() => setTab("expenses")}
        >
          🧾 Expenses ({expenses.length})
        </button>
        <button
          className={tab === "insights" ? "tab tab-on" : "tab"}
          onClick={() => setTab("insights")}
        >
          🧠 Insights {biasCount > 0 && <span className="dot">{biasCount}</span>}
        </button>
        <button
          className={tab === "community" ? "tab tab-on" : "tab"}
          onClick={() => setTab("community")}
        >
          🌍 Community
        </button>
        <button
          className={tab === "survey" ? "tab tab-on" : "tab"}
          onClick={() => setTab("survey")}
        >
          📋 Survey
        </button>
        <button
          className={tab === "challenge" ? "tab tab-on" : "tab"}
          onClick={() => setTab("challenge")}
        >
          🎯 Challenge
        </button>
      </nav>

      <main>
        {tab === "feed" && (
          <Feed
            posts={posts}
            loading={loadingFeed}
            sourceInfo={sourceInfo}
            engagements={engagements}
            onToggle={toggleEngagement}
            onReload={() => loadFeed(source)}
          />
        )}

        {tab === "expenses" && (
          <ExpenseTracker
            expenses={expenses}
            posts={posts}
            onAdd={addExpense}
            onDelete={deleteExpense}
          />
        )}

        {tab === "insights" && (
          <InsightsPanel
            biases={biases}
            score={score}
            scoreHistory={scoreHistory}
            votes={votes}
            onVote={voteHelpful}
          />
        )}

        {tab === "community" && (
          <CommunityResults snapshot={shareSnapshot} canShare={score.hasData} />
        )}

        {tab === "survey" && <Survey />}

        {tab === "challenge" && (
          <Challenge
            currentScore={score.score}
            canStart={score.hasData}
            challenges={challenges}
            onStart={startChallenge}
            onFinish={finishChallenge}
            onCancel={cancelChallenge}
          />
        )}
      </main>

      <footer className="app-footer">
        <p className="small muted">
          All your data stays in this browser (localStorage). This tool is for education and
          self-awareness, not financial advice.
        </p>
      </footer>
    </div>
  );
}
