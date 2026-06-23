// Challenge.jsx — commit to one solution for a set number of days, and see your
// well-being score BEFORE vs AFTER. This makes the cause-and-effect explicit:
// "did following this advice actually move my score?"

const TEMPLATES = [
  { key: "wait24", type: "nudge", days: 7, title: "Wait 24 hours before any social-media-triggered buy" },
  { key: "save10", type: "choice", days: 7, title: "Save 10% the moment money arrives" },
  { key: "pause", type: "mindful", days: 7, title: "One mindful pause before every purchase" },
  { key: "noimpulse", type: "nudge", days: 7, title: "No impulse buys from the feed" },
  { key: "learn", type: "mindful", days: 7, title: "Learn one finance basic each day" },
];

const DAY = 24 * 60 * 60 * 1000;
const daysSince = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / DAY);

function Delta({ value }) {
  if (value === 0) return <span className="strong">no change yet</span>;
  const up = value > 0;
  return (
    <span className={"strong " + (up ? "up" : "down")}>
      {up ? "▲ +" : "▼ "}
      {value} {up ? "🎉" : ""}
    </span>
  );
}

export default function Challenge({ currentScore, canStart, challenges, onStart, onFinish, onCancel }) {
  const active = challenges.find((c) => c.status === "active");
  const done = challenges.filter((c) => c.status === "done").reverse();

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>🎯 Challenge — does it actually help?</h2>
      </div>
      <p className="small muted">
        Pick one solution, commit for a week, and the app records your score before and after — so
        you can see whether the advice really improves your financial well-being.
      </p>

      {/* ---- active challenge ---- */}
      {active ? (
        <div className="challenge-card">
          <h3>{active.title}</h3>
          {(() => {
            const elapsed = Math.min(daysSince(active.startDate), active.days);
            const pct = Math.min(100, Math.round((daysSince(active.startDate) / active.days) * 100));
            const delta = currentScore - active.startScore;
            const finished = daysSince(active.startDate) >= active.days;
            return (
              <>
                <div className="chart-row" style={{ gridTemplateColumns: "90px 1fr 60px" }}>
                  <span className="chart-label">Day {elapsed}/{active.days}</span>
                  <div className="chart-bar-track">
                    <div className="chart-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="chart-amt">{pct}%</span>
                </div>

                <div className="stat-row" style={{ marginTop: 12 }}>
                  <div className="stat">
                    <span className="stat-num">{active.startScore}</span>
                    <span className="small muted">score before</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num">{currentScore}</span>
                    <span className="small muted">score now</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num"><Delta value={delta} /></span>
                    <span className="small muted">change</span>
                  </div>
                </div>

                <p className="small muted" style={{ marginTop: 8 }}>
                  {finished
                    ? "Your challenge week is up! Mark it complete to log the result."
                    : `Keep going — ${active.days - elapsed} day(s) left. Your score updates as your habits change.`}
                </p>

                <div className="post-actions">
                  <button className="btn btn-primary" onClick={() => onFinish(active.id)}>
                    ✓ Mark complete
                  </button>
                  <button className="btn btn-ghost" onClick={() => onCancel(active.id)}>
                    Give up
                  </button>
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="challenge-templates">
          <h3>Start a challenge</h3>
          {!canStart && (
            <p className="small warn">
              Add a few expenses and mark some posts first, so your starting score is real.
            </p>
          )}
          {TEMPLATES.map((t) => (
            <div className="challenge-template" key={t.key}>
              <span>{t.title}</span>
              <button className="btn btn-primary small" disabled={!canStart} onClick={() => onStart(t)}>
                Start ({t.days} days)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ---- past results ---- */}
      {done.length > 0 && (
        <div className="analysis-block" style={{ marginTop: 18 }}>
          <h3>Past challenges</h3>
          <ul className="expense-list">
            {done.map((c) => (
              <li className="expense-item" key={c.id}>
                <div>
                  <strong>{c.title}</strong>
                  <div className="small muted">
                    {c.startScore} → {c.endScore}
                  </div>
                </div>
                <Delta value={c.endScore - c.startScore} />
              </li>
            ))}
          </ul>
          <p className="small muted">
            A rising score after a challenge is evidence the solution helped your well-being.
          </p>
        </div>
      )}
    </section>
  );
}
