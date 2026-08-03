// ===========================================================================
// LearnPanel.jsx — the Improve phase as a first-class section of the app.
// ---------------------------------------------------------------------------
// Modules are ordered by the participant's own construct scores, so the ones
// that matter most for them come first. Every module names its research basis.
// ===========================================================================

import { useMemo, useState } from "react";
import { MODULES, CHALLENGES } from "../lib/learn.js";
import { band } from "../lib/scoring.js";

export default function LearnPanel({ results }) {
  const [openId, setOpenId] = useState(null);
  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mf_modules_done") || "[]");
    } catch {
      return [];
    }
  });

  const ordered = useMemo(() => {
    if (!results) return Object.values(MODULES);
    const scored = Object.values(results.biases.constructs)
      .filter((c) => c.pomp !== null)
      .sort((a, b) => b.pomp - a.pomp);
    const keys = [...scored.map((c) => c.id), "smfi", "mindfulness"];
    const seen = new Set();
    return keys
      .filter((k) => MODULES[k] && !seen.has(k) && seen.add(k) !== false)
      .map((k) => ({ ...MODULES[k], pomp: results.biases.constructs[k]?.pomp ?? null }));
  }, [results]);

  const toggleDone = (id) => {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    try {
      localStorage.setItem("mf_modules_done", JSON.stringify(next));
    } catch {
      /* storage unavailable — progress simply is not persisted */
    }
  };

  const topKey = ordered[0]?.id;
  const pct = ordered.length ? Math.round((done.length / ordered.length) * 100) : 0;

  return (
    <div className="screen">
      <h2 className="screen-title">📚 Your learning path</h2>
      <p className="screen-note">
        Ordered by what your own answers pointed to most strongly. Each module takes about thirty
        seconds and names the research it comes from.
      </p>

      <div className="learn-progress">
        <div className="progress-head">
          <span className="progress-section">{done.length} of {ordered.length} completed</span>
          <span className="progress-pct">{pct}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
      </div>

      {topKey && (
        <div className="challenge-box">
          <div className="challenge-tag">Start here — this week's challenge</div>
          <p>{CHALLENGES[topKey] || CHALLENGES.default}</p>
        </div>
      )}

      <div className="learn-list">
        {ordered.map((m, i) => {
          const isOpen = openId === m.id;
          const isDone = done.includes(m.id);
          return (
            <div className={"learn-card" + (isOpen ? " learn-open" : "") + (isDone ? " learn-done" : "")} key={m.id}>
              <button className="learn-head" onClick={() => setOpenId(isOpen ? null : m.id)}>
                <span className="learn-rank">{i + 1}</span>
                <span className="learn-title">
                  {m.title}
                  {m.pomp !== null && m.pomp !== undefined && (
                    <span className={"learn-badge tone-" + band(m.pomp).tone}>{band(m.pomp).label}</span>
                  )}
                </span>
                <span className="learn-time">{m.seconds}s</span>
              </button>
              {isOpen && (
                <div className="module-body">
                  <h5>What it is</h5><p>{m.what}</p>
                  <h5>Why it happens on feeds</h5><p>{m.why}</p>
                  <h5>What to do about it</h5><p className="module-do">{m.do}</p>
                  <p className="small muted">Research basis: {m.citation}</p>
                  <button className={"btn btn-sm " + (isDone ? "btn-ghost" : "btn-primary")} onClick={() => toggleDone(m.id)}>
                    {isDone ? "✓ Marked as read" : "Mark as read"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
