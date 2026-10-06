// CommunityResults.jsx — the shared dashboard. Anyone can submit their results
// snapshot; this view shows the analysis ACROSS everyone who submitted:
//   - how many people, average score
//   - which bias is most common (and least)
//   - whether each solution type (incl. Awareness/mindfulness) helped people

import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

const TYPE_LABELS = { nudge: "Nudges", choice: "Choice architecture", mindful: "Awareness (mindfulness)" };

export default function CommunityResults({ snapshot, canShare }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("");

  async function loadResults() {
    setLoading(true);
    try {
      const r = await fetch(api("/api/results"));
      setResults(await r.json());
    } catch {
      setResults({ error: "Could not reach the server." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  async function share() {
    setStatus("Sending…");
    try {
      const res = await fetch(api("/api/submit"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...snapshot, nickname }),
      });
      const d = await res.json();
      if (d.ok) {
        setStatus("✅ Thanks! Your results were added.");
        await loadResults();
      } else {
        setStatus("⚠️ " + (d.error || "Could not save."));
      }
    } catch {
      setStatus("⚠️ Could not reach the server.");
    }
  }

  const maxBias = results?.biasRanking?.length ? results.biasRanking[0].count : 0;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>🌍 Community results</h2>
        <button className="btn btn-ghost" onClick={loadResults} disabled={loading}>
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </div>

      {/* ---- share your own results ---- */}
      <div className="share-box">
        <h3>Add your results</h3>
        {canShare ? (
          <>
            <p className="small muted">
              Sends a snapshot (your score, detected biases, and which tips helped you). No expense
              details or personal info are sent.
            </p>
            <div className="row">
              <input
                type="text"
                placeholder="Nickname (optional)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <button className="btn btn-primary" onClick={share}>
                Share my results
              </button>
            </div>
            {status && <p className="small">{status}</p>}
          </>
        ) : (
          <p className="small muted">
            Add a few expenses and mark some posts first — then you can share your results here.
          </p>
        )}
      </div>

      {/* ---- the aggregate analysis ---- */}
      {!results && <p className="muted">Loading community data…</p>}
      {results?.error && <p className="warn">{results.error}</p>}

      {results && !results.error && results.count === 0 && (
        <p className="muted">No submissions yet. Be the first to share above! 🙌</p>
      )}

      {results && results.count > 0 && (
        <>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">{results.count}</span>
              <span className="small muted">people shared</span>
            </div>
            <div className="stat">
              <span className="stat-num">{results.avgScore}</span>
              <span className="small muted">avg well-being score</span>
            </div>
          </div>

          {/* which bias is most common */}
          {results.biasRanking?.length > 0 && (
            <div className="analysis-block">
              <h3>Most common biases across everyone</h3>
              {results.biasRanking.map((b, i) => (
                <div className="chart-row" key={b.name}>
                  <span className="chart-label">
                    {i === 0 ? "🔺 " : i === results.biasRanking.length - 1 ? "🔻 " : ""}
                    {b.name}
                  </span>
                  <div className="chart-bar-track">
                    <div
                      className="chart-bar"
                      style={{ width: maxBias ? `${(b.count / maxBias) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="chart-amt">{b.pct}%</span>
                </div>
              ))}
              <p className="small muted">
                Most common: <strong>{results.biasRanking[0].name}</strong>
                {results.biasRanking.length > 1 && (
                  <> · Least common: <strong>{results.biasRanking[results.biasRanking.length - 1].name}</strong></>
                )}
                . (% = share of people who showed it.)
              </p>
            </div>
          )}

          {/* did the solutions help, across everyone */}
          <div className="analysis-block">
            <h3>Did the solutions help people?</h3>
            <div className="help-grid">
              {["nudge", "choice", "mindful"].map((t) => {
                const h = results.help?.[t];
                return (
                  <div className="help-item" key={t}>
                    <span className="help-label">{TYPE_LABELS[t]}</span>
                    <span className="help-pct">
                      {h && h.helpfulPct !== null ? h.helpfulPct + "%" : "—"}
                    </span>
                    <span className="small muted">
                      {h ? `👍 ${h.up} · 👎 ${h.down}` : "no ratings yet"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="small muted">
              This is the real answer to “does Awareness (mindfulness) help?” — measured from
              everyone's 👍/👎 ratings.
            </p>
          </div>

          {/* recent submissions */}
          {results.recent?.length > 0 && (
            <div className="analysis-block">
              <h3>Recent submissions</h3>
              <ul className="expense-list">
                {results.recent.map((r, i) => (
                  <li className="expense-item" key={i}>
                    <span>{r.nickname}</span>
                    <strong>score {r.score}</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}
