// ===========================================================================
// Hub.jsx — the single post-assessment home.
// ---------------------------------------------------------------------------
// Everything the participant can do after finishing the assessment lives here
// under one navigation: their results, the learning modules, the weekly
// challenge, day-to-day expense tracking, a live financial feed, the community
// view, and the re-assessment. There is no separate "tools" area — this IS the
// app.
// ===========================================================================

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import Feed from "./Feed.jsx";
import ExpenseTracker from "./ExpenseTracker.jsx";
import CommunityResults from "./CommunityResults.jsx";
import Challenge from "./Challenge.jsx";
import Results from "./Results.jsx";
import LearnPanel from "./LearnPanel.jsx";
import CheckUp from "./CheckUp.jsx";
import { tagPost } from "../lib/tagging.js";
import { detectBiases } from "../lib/biasEngine.js";
import { computeScore } from "../lib/score.js";
import { load, save } from "../lib/storage.js";
import { scoreAll } from "../lib/scoring.js";

const NAV = [
  { id: "results", icon: "📊", label: "My results" },
  { id: "learn", icon: "📚", label: "Learn" },
  { id: "challenge", icon: "🎯", label: "Challenge" },
  { id: "track", icon: "🧾", label: "Track spending" },
  { id: "feed", icon: "📱", label: "Live feed" },
  { id: "checkup", icon: "🔄", label: "Check-up" },
  { id: "community", icon: "🌍", label: "Community" },
];

export default function Hub({ session, onRestart, onExit, onResumeAssessment, completed }) {
  const [tab, setTab] = useState("results");

  // ---- live feed state ----------------------------------------------------
  const [source, setSource] = useState("simulated");
  const [sources, setSources] = useState([]);
  const [posts, setPosts] = useState([]);
  const [sourceInfo, setSourceInfo] = useState(null);
  const [loadingFeed, setLoadingFeed] = useState(false);

  // ---- day-to-day tracking (persisted in the browser) ---------------------
  const [engagements, setEngagements] = useState(() => load("engagements", {}));
  const [expenses, setExpenses] = useState(() => load("expenses", []));
  const [votes, setVotes] = useState(() => load("helpfulness", {}));
  const [scoreHistory, setScoreHistory] = useState(() => load("scoreHistory", []));
  const [challenges, setChallenges] = useState(() => load("challenges", []));

  useEffect(() => save("engagements", engagements), [engagements]);
  useEffect(() => save("expenses", expenses), [expenses]);
  useEffect(() => save("helpfulness", votes), [votes]);
  useEffect(() => save("scoreHistory", scoreHistory), [scoreHistory]);
  useEffect(() => save("challenges", challenges), [challenges]);

  // The validated assessment result, if one exists.
  const assessment = useMemo(
    () => (completed && session ? scoreAll(session) : null),
    [completed, session]
  );

  useEffect(() => {
    fetch("https://mindfulfinance1-3-server.onrender.com/api/sources")
      .then((r) => r.json())
      .then((d) => setSources(d.sources || []))
      .catch(() => setSources([{ name: "simulated", label: "Simulated reels" }]));
  }, []);

  async function loadFeed(which = source) {
    setLoadingFeed(true);
    try {
      const r = await fetch(
  `https://mindfulfinance1-3-server.onrender.com/api/feed?source=${encodeURIComponent(which)}`
);
      const d = await r.json();
      setPosts(
        (d.posts || []).map((p) => {
          const t = tagPost(p.text);
          return { ...p, tag: t.tag, label: t.label, emoji: t.emoji, matched: t.matched };
        })
      );
      setSourceInfo({ sourceUsed: d.sourceUsed, fellBack: d.fellBack, reason: d.reason });
    } catch {
      setSourceInfo({ sourceUsed: "none", fellBack: true, reason: "server unreachable" });
      setPosts([]);
    } finally {
      setLoadingFeed(false);
    }
  }

  useEffect(() => {
    if (tab === "feed" || tab === "track") loadFeed(source);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, tab]);

  function toggleEngagement(post, kind) {
    setEngagements((prev) => {
      const existing = prev[post.id] || {
        post: { id: post.id, author: post.author, text: post.text, tag: post.tag, url: post.url },
        influenced: false, trade: false, anxious: false, confused: false, notInfluenced: false,
        at: new Date().toISOString(),
      };
      return { ...prev, [post.id]: { ...existing, [kind]: !existing[kind], at: new Date().toISOString() } };
    });
  }

  const engagementList = useMemo(
    () => Object.values(engagements).filter((e) => e.influenced || e.trade || e.anxious || e.confused),
    [engagements]
  );
  const liveBiases = useMemo(
    () => detectBiases({ expenses, engagements: engagementList }),
    [expenses, engagementList]
  );
  const liveScore = useMemo(
    () => computeScore({ expenses, engagements: engagementList, biases: liveBiases }),
    [expenses, engagementList, liveBiases]
  );

  useEffect(() => {
    if (!liveScore.hasData) return;
    const today = new Date().toISOString().slice(0, 10);
    setScoreHistory((prev) => [...prev.filter((p) => p.date !== today), { date: today, score: liveScore.score }].slice(-30));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveScore.score, liveScore.hasData]);

  // Scroll-reveal for cards.
  useLayoutEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const sel = ".post, .bias-card, .stat, .challenge-template, .expense-item";
    const els = Array.from(document.querySelectorAll(sel)).filter((el) => !el.dataset.revealed);
    if (!els.length) return undefined;
    els.forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${Math.min(i, 6) * 70}ms`);
    });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("reveal-in"); e.target.dataset.revealed = "1"; io.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tab, posts, expenses, challenges]);

  // ---- challenges ---------------------------------------------------------
  function startChallenge(template) {
    setChallenges((prev) => [
      ...prev.filter((c) => c.status !== "active"),
      { id: "ch-" + Date.now(), key: template.key, title: template.title, type: template.type,
        days: template.days, startDate: new Date().toISOString(), startScore: liveScore.score,
        endScore: null, status: "active" },
    ]);
  }
  const finishChallenge = (id) =>
    setChallenges((prev) => prev.map((c) => (c.id === id
      ? { ...c, status: "done", endScore: liveScore.score, completedDate: new Date().toISOString() } : c)));
  const cancelChallenge = (id) => setChallenges((prev) => prev.filter((c) => c.id !== id));

  const shareSnapshot = useMemo(() => {
    const totalSpent = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const help = { nudge: { up: 0, down: 0 }, choice: { up: 0, down: 0 }, mindful: { up: 0, down: 0 } };
    for (const [k, v] of Object.entries(votes)) {
      const type = k.split(":")[1];
      if (help[type] && (v === "up" || v === "down")) help[type][v] += 1;
    }
    return { score: liveScore.score, band: liveScore.band, biasNames: liveBiases.map((b) => b.name),
      expenseCount: expenses.length, totalSpent, help };
  }, [liveScore, liveBiases, expenses, votes]);

  // -------------------------------------------------------------------------
  // If the assessment has not been completed, the hub is not the right place —
  // send them into it rather than showing an empty dashboard.
  // -------------------------------------------------------------------------
  const gate = (what) => (
    <div className="screen">
      <h2 className="screen-title">🔒 Finish the assessment first</h2>
      <p className="screen-note">
        {what} is built from your assessment answers, so it needs those before it can show you anything
        meaningful. It takes about 12–15 minutes and every question comes from a published research instrument.
      </p>
      <div className="screen-actions">
        <button className="btn btn-primary btn-lg" onClick={onResumeAssessment}>
          Take the assessment →
        </button>
      </div>
    </div>
  );

  return (
    <div className="hub">
      <header className="hub-header">
        <button className="hub-logo" onClick={onExit} title="Home">
          <span className="logo-emoji">🪙</span> <span className="logo-text">MindfulFinance</span>
        </button>
        <div className="hub-header-right">
          {completed && assessment && (
            <span className="hub-code" title="Your anonymous participant code">
              {assessment.participantId}
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={onRestart}>🔄 Re-assess</button>
        </div>
      </header>

      <nav className="hub-nav">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={"hub-tab" + (tab === n.id ? " hub-tab-on" : "")}
            onClick={() => setTab(n.id)}
          >
            <span className="hub-tab-icon">{n.icon}</span>
            <span className="hub-tab-label">{n.label}</span>
            {n.id === "track" && expenses.length > 0 && <span className="dot">{expenses.length}</span>}
          </button>
        ))}
      </nav>

      <main className="hub-main">
        {tab === "results" &&
          (completed
            ? <Results session={session} embedded onRestart={onRestart} onExit={onExit} />
            : gate("Your results dashboard"))}

        {tab === "learn" &&
          (completed
            ? <LearnPanel results={assessment} />
            : gate("The learning path"))}

        {tab === "challenge" && (
          <Challenge
            currentScore={liveScore.score}
            canStart={liveScore.hasData || completed}
            challenges={challenges}
            onStart={startChallenge}
            onFinish={finishChallenge}
            onCancel={cancelChallenge}
          />
        )}

        {tab === "track" && (
          <ExpenseTracker expenses={expenses} posts={posts}
            onAdd={(e) => setExpenses((p) => [...p, e])}
            onDelete={(id) => setExpenses((p) => p.filter((x) => x.id !== id))} />
        )}

        {tab === "feed" && (
          <>
            <div className="source-picker source-picker-inline">
              <label className="small">Feed source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                {sources.map((s) => <option key={s.name} value={s.name}>{s.label}</option>)}
              </select>
            </div>
            <Feed posts={posts} loading={loadingFeed} sourceInfo={sourceInfo}
              engagements={engagements} onToggle={toggleEngagement} onReload={() => loadFeed(source)} />
          </>
        )}

        {tab === "checkup" && <CheckUp onReassess={onRestart} />}

        {tab === "community" && (
          <CommunityResults snapshot={shareSnapshot} canShare={liveScore.hasData} />
        )}
      </main>

      <footer className="app-footer">
        <p className="small muted">
          Your tracking data stays in this browser. Assessment responses are anonymous and are used for
          research only if you chose to contribute them. Educational tool — not financial advice.
        </p>
      </footer>
    </div>
  );
}
