// InsightsPanel.jsx — Financial Well-being Score, an Analysis section
// (which bias affects you most/least + whether the insights help), then every
// detected bias with its reason and three solutions you can rate.

import { SOLUTIONS, DEFAULT_SOLUTION, LEARN_BASICS, WELLNESS_NOTE } from "../lib/solutions.js";
import {
  rankBiases,
  helpfulnessByType,
  overallHelpfulness,
  scoreTrend,
} from "../lib/analytics.js";

// "mindful" is kept as the internal key; we just SHOW it as "Awareness".
const SOLUTION_TYPES = [
  { type: "nudge", label: "Nudge", cls: "sol-nudge" },
  { type: "choice", label: "Choice architecture", cls: "sol-choice" },
  { type: "mindful", label: "Awareness", cls: "sol-mindful" },
];

function ScoreCard({ score }) {
  if (!score.hasData) {
    return (
      <div className="scorecard scorecard-empty">
        <h2>Financial Well-being Score</h2>
        <p className="muted">
          Add a few expenses and mark some posts in the feed — your score and insights will appear
          here.
        </p>
      </div>
    );
  }

  const color =
    score.score >= 80
      ? "#16a34a"
      : score.score >= 60
      ? "#65a30d"
      : score.score >= 40
      ? "#d97706"
      : "#dc2626";

  return (
    <div className="scorecard">
      <div
        className="score-ring"
        style={{ background: `conic-gradient(${color} ${score.score * 3.6}deg, #e5e7eb 0deg)` }}
      >
        <div className="score-inner">
          <span className="score-num">{score.score}</span>
          <span className="score-out">/100</span>
        </div>
      </div>

      <div className="score-text">
        <h2>Financial Well-being</h2>
        <p className="score-band" style={{ color }}>
          {score.band}
        </p>

        {score.up.length > 0 && (
          <>
            <p className="small strong up">Pulling it up</p>
            <ul className="reasons">
              {score.up.map((r, i) => (
                <li key={i}>👍 {r}</li>
              ))}
            </ul>
          </>
        )}
        {score.down.length > 0 && (
          <>
            <p className="small strong down">Pulling it down</p>
            <ul className="reasons">
              {score.down.map((r, i) => (
                <li key={i}>👎 {r}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Analysis: ranking + effectiveness ------------------------------------
function Analysis({ biases, scoreHistory, votes }) {
  const ranking = rankBiases(biases);
  const maxStrength = ranking.length ? ranking[0].strength : 0;
  const trend = scoreTrend(scoreHistory);
  const byType = helpfulnessByType(votes);
  const overall = overallHelpfulness(votes);

  const anyData = ranking.length > 0 || trend || overall.total > 0;
  if (!anyData) return null;

  return (
    <div className="analysis">
      <h2>📊 Analysis</h2>

      {/* which bias affects you most / least */}
      {ranking.length > 0 && (
        <div className="analysis-block">
          <h3>Which biases affect you most</h3>
          {ranking.map((b, i) => (
            <div className="chart-row" key={b.key}>
              <span className="chart-label">
                {i === 0 ? "🔺 " : i === ranking.length - 1 ? "🔻 " : ""}
                {b.name}
              </span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{ width: maxStrength ? `${(b.strength / maxStrength) * 100}%` : "0%" }}
                />
              </div>
              <span className="chart-amt">{b.strength}x</span>
            </div>
          ))}
          <p className="small muted">
            Most frequent: <strong>{ranking[0].name}</strong>
            {ranking.length > 1 && (
              <>
                {" "}
                · Affects you least: <strong>{ranking[ranking.length - 1].name}</strong>
              </>
            )}
            . (Based on how much evidence we found for each.)
          </p>
        </div>
      )}

      {/* does the score improve over time? */}
      {trend && (
        <div className="analysis-block">
          <h3>Is your well-being improving?</h3>
          <div className="trend">
            {scoreHistory.slice(-14).map((h) => (
              <div className="trend-col" key={h.date} title={`${h.date}: ${h.score}`}>
                <div className="trend-bar" style={{ height: `${Math.max(4, h.score)}%` }} />
              </div>
            ))}
          </div>
          <p className="small muted">
            Score went from <strong>{trend.first.score}</strong> ({trend.first.date}) to{" "}
            <strong>{trend.last.score}</strong> ({trend.last.date}) —{" "}
            {trend.direction === "up" ? (
              <span className="up strong">up {trend.change} 🎉 the insights seem to be helping.</span>
            ) : trend.direction === "down" ? (
              <span className="down strong">down {Math.abs(trend.change)} — worth slowing down.</span>
            ) : (
              <span className="strong">no change yet.</span>
            )}
          </p>
        </div>
      )}

      {/* do the insights (and mindfulness specifically) help? */}
      {overall.total > 0 && (
        <div className="analysis-block">
          <h3>Do these insights actually help you?</h3>
          <p className="small">
            You rated <strong>{overall.total}</strong> suggestion(s) — and found{" "}
            <strong>{overall.helpfulPct}%</strong> helpful overall.
          </p>
          <div className="help-grid">
            {byType
              .filter((t) => t.total > 0)
              .map((t) => (
                <div className="help-item" key={t.type}>
                  <span className="help-label">{t.label}</span>
                  <span className="help-pct">{t.helpfulPct}% helpful</span>
                  <span className="small muted">
                    👍 {t.up} · 👎 {t.down}
                  </span>
                </div>
              ))}
          </div>
          <p className="small muted">
            This answers questions like “does the Awareness (mindfulness) advice really help me?” —
            it's measured from your own 👍/👎 ratings below.
          </p>
        </div>
      )}
    </div>
  );
}

export default function InsightsPanel({ biases, score, scoreHistory, votes, onVote }) {
  return (
    <section className="panel">
      <ScoreCard score={score} />

      <Analysis biases={biases} scoreHistory={scoreHistory} votes={votes} />

      <div className="panel-head">
        <h2>🧠 Detected biases & solutions</h2>
      </div>

      {biases.length === 0 ? (
        <p className="muted">
          No biases detected yet. Mark some feed posts as influential and add the expenses they
          triggered — patterns will show up here.
        </p>
      ) : (
        <div className="bias-list">
          {biases.map((b) => {
            const sol = SOLUTIONS[b.key] || DEFAULT_SOLUTION;
            return (
              <article key={b.key} className="bias-card">
                <h3 className="bias-name">{b.name}</h3>
                <p className="bias-reason">{b.reason}</p>

                {b.evidence?.length > 0 && (
                  <details className="evidence">
                    <summary>Why we flagged this ({b.evidence.length})</summary>
                    <ul>
                      {b.evidence.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </details>
                )}

                <div className="solutions">
                  {SOLUTION_TYPES.map(({ type, label, cls }) => {
                    const voteKey = `${b.key}:${type}`;
                    const current = votes?.[voteKey];
                    return (
                      <div className={"sol " + cls} key={type}>
                        <span className="sol-tag">{label}</span>
                        <p>{sol[type]}</p>
                        <div className="sol-vote">
                          <span className="small muted">Did this help?</span>
                          <button
                            className={"vote " + (current === "up" ? "vote-up-on" : "")}
                            onClick={() => onVote(b.key, type, "up")}
                          >
                            👍
                          </button>
                          <button
                            className={"vote " + (current === "down" ? "vote-down-on" : "")}
                            onClick={() => onVote(b.key, type, "down")}
                          >
                            👎
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* For the knowledge gap, actually teach the basics + wellness. */}
                {b.key === "knowledge-gap" && (
                  <div className="learn-box">
                    <h4>📚 Fill the gap — finance basics</h4>
                    <ul className="learn-list">
                      {LEARN_BASICS.map((l) => (
                        <li key={l.term}>
                          <strong>{l.term}:</strong> {l.text}
                        </li>
                      ))}
                    </ul>
                    <p className="wellness">🌱 {WELLNESS_NOTE}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
