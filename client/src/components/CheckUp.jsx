// ===========================================================================
// CheckUp.jsx — Screen 16: the monthly check-up
// ---------------------------------------------------------------------------
// Reassess · compare scores · track improvement. Direction-aware: a fall in
// bias and a rise in mindfulness both read as progress.
// ===========================================================================

import { getWaves, compareLatest, checkUpStatus, METRICS } from "../lib/history.js";

function Delta({ row }) {
  if (row.delta === null) return <span className="delta delta-flat">—</span>;
  if (row.delta === 0) return <span className="delta delta-flat">no change</span>;
  const arrow = row.delta > 0 ? "▲" : "▼";
  const cls = row.improved ? "delta-good" : "delta-bad";
  return (
    <span className={"delta " + cls}>
      {arrow} {Math.abs(row.delta)}{row.suffix === "%" ? "%" : ""}
    </span>
  );
}

function TrendBar({ row }) {
  const pctOf = (v) => (v === null ? 0 : Math.max(0, Math.min(100, (v / row.max) * 100)));
  return (
    <div className="cmp-trend">
      <div className="cmp-track">
        <div className="cmp-prev" style={{ width: `${pctOf(row.prev)}%` }} />
        <div
          className={"cmp-curr " + (row.improved === false ? "cmp-worse" : "cmp-better")}
          style={{ width: `${pctOf(row.curr)}%` }}
        />
      </div>
    </div>
  );
}

export default function CheckUp({ onReassess }) {
  const waves = getWaves();
  const status = checkUpStatus();
  const cmp = compareLatest();

  // ---- no assessment yet --------------------------------------------------
  if (!waves.length) {
    return (
      <div className="screen">
        <h2 className="screen-title">🔄 Monthly check-up</h2>
        <p className="screen-note">
          Once you have completed the assessment, this is where you come back to retake it and see
          what has actually changed.
        </p>
        <div className="screen-actions">
          <button className="btn btn-primary btn-lg" onClick={onReassess}>Take the assessment →</button>
        </div>
      </div>
    );
  }

  // ---- one wave only ------------------------------------------------------
  if (!cmp) {
    const w = waves[0];
    return (
      <div className="screen">
        <h2 className="screen-title">🔄 Monthly check-up</h2>
        <p className="screen-note">
          You have one assessment on record, from {new Date(w.completedAt).toLocaleDateString()}
          {status.daysSince > 0 && ` — ${status.daysSince} day${status.daysSince === 1 ? "" : "s"} ago`}.
          Retake it and this page will show you exactly what moved.
        </p>

        <div className="baseline-grid">
          {METRICS.map((m) => (
            <div className="baseline-tile" key={m.id}>
              <div className="tile-icon">{m.icon}</div>
              <div className="tile-val">{w.metrics[m.id] ?? "—"}</div>
              <div className="tile-label">{m.label}</div>
              <div className="tile-range">baseline{m.suffix}</div>
            </div>
          ))}
        </div>

        <div className={"notice " + (status.due ? "notice-soft" : "notice-calm")}>
          <h4>{status.due ? "You're due for a check-up" : "Come back in a few weeks"}</h4>
          <p>
            {status.due
              ? "Enough time has passed for a re-assessment to mean something. Changes over a few days are mostly noise; changes over a month are worth looking at."
              : `Best to wait about ${status.daysLeft} more day${status.daysLeft === 1 ? "" : "s"}. Re-taking too soon mostly measures what you remember answering, not what changed.`}
          </p>
        </div>

        <div className="screen-actions">
          <button className={"btn btn-lg " + (status.due ? "btn-primary" : "btn-ghost")} onClick={onReassess}>
            Retake the assessment →
          </button>
        </div>
      </div>
    );
  }

  // ---- comparison ---------------------------------------------------------
  const improvedBiases = cmp.biasRows.filter((b) => b.delta < -2);
  const worseBiases = cmp.biasRows.filter((b) => b.delta > 2);

  return (
    <div className="screen">
      <h2 className="screen-title">🔄 Your check-up</h2>
      <p className="screen-note">
        Comparing your latest assessment ({new Date(cmp.curr.completedAt).toLocaleDateString()}) with the
        previous one ({new Date(cmp.prev.completedAt).toLocaleDateString()})
        {cmp.daysBetween > 0 && ` — ${cmp.daysBetween} days apart`}.
      </p>

      <div className="checkup-headline">
        <div className="checkup-big">{cmp.improvedCount}<span>/{cmp.scoredCount}</span></div>
        <p>
          measures moved in the direction you'd want. That is worth reading gently — single-person
          score changes are noisy, and a mixed picture is the normal picture.
        </p>
      </div>

      <div className="compare-list">
        {cmp.rows.map((row) => (
          <div className="compare-row" key={row.id}>
            <div className="compare-label">
              <span className="compare-icon">{row.icon}</span>
              {row.label}
            </div>
            <TrendBar row={row} />
            <div className="compare-nums">
              <span className="was">{row.prev ?? "—"}</span>
              <span className="arrow">→</span>
              <span className="now">{row.curr ?? "—"}</span>
              <Delta row={row} />
            </div>
          </div>
        ))}
      </div>

      <h3 className="q-group-title" style={{ marginTop: 26 }}>Bias by bias</h3>
      <div className="compare-list">
        {cmp.biasRows.map((b) => (
          <div className="compare-row compare-row-slim" key={b.id}>
            <div className="compare-label">{b.name}</div>
            <TrendBar row={{ prev: b.prev, curr: b.curr, max: 100, improved: b.delta < 0 }} />
            <div className="compare-nums">
              <span className="was">{b.prev}</span>
              <span className="arrow">→</span>
              <span className="now">{b.curr}</span>
              <Delta row={{ delta: b.delta, improved: b.delta < 0, suffix: "" }} />
            </div>
          </div>
        ))}
      </div>

      {(improvedBiases.length > 0 || worseBiases.length > 0) && (
        <div className="notice notice-calm">
          <h4>What stands out</h4>
          <p>
            {improvedBiases.length > 0 && (
              <>Most improved: <strong>{improvedBiases[0].name.toLowerCase()}</strong>
                {improvedBiases.length > 1 && `, followed by ${improvedBiases[1].name.toLowerCase()}`}. </>
            )}
            {worseBiases.length > 0 && (
              <>Worth attention: <strong>{worseBiases[worseBiases.length - 1].name.toLowerCase()}</strong> moved
                the other way. That happens, and one reading is not a trend.</>
            )}
          </p>
        </div>
      )}

      <div className="wave-log">
        <h3 className="q-group-title">All check-ups</h3>
        {waves.slice().reverse().map((w) => (
          <div className="wave-row" key={w.participantId}>
            <span className="wave-n">#{w.wave}</span>
            <span className="wave-date">{new Date(w.completedAt).toLocaleDateString()}</span>
            <span className="wave-metrics">
              🧠 {w.metrics.biasIndex ?? "—"} · 📲 {w.metrics.smfi ?? "—"} · 💰 {w.metrics.cfpb ?? "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="screen-actions">
        <button className={"btn btn-lg " + (status.due ? "btn-primary" : "btn-ghost")} onClick={onReassess}>
          {status.due ? "Take your next check-up →" : `Retake anyway (best in ${status.daysLeft} days)`}
        </button>
      </div>
    </div>
  );
}
