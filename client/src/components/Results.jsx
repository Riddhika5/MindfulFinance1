// ===========================================================================
// Results.jsx — the Analyse + Improve phases
// ---------------------------------------------------------------------------
// Behavioural bias profile, construct scores, personalised insights,
// micro-learning modules, a weekly challenge, a downloadable report, and the
// submit-to-research step. All scoring comes from lib/scoring.js.
// ===========================================================================

import { useEffect, useMemo, useState } from "react";
import { scoreAll, band } from "../lib/scoring.js";
import { downloadReport } from "../lib/report.js";
import { queueSubmission, clearSubmission, postResponse } from "../lib/pendingSubmission.js";
import { recordWave } from "../lib/history.js";
import { SOURCES, BIAS_CONSTRUCTS } from "../lib/instruments.js";
import { MODULES, CHALLENGES } from "../lib/learn.js";
import { ARMS } from "../lib/scenarios.js";
import { isConfigured, needsSupport, SUPPORT } from "../lib/ethics.js";
import Debrief from "./Debrief.jsx";

function Meter({ label, value, max = 100, tone = "mid", suffix = "", blocks = 14 }) {
  // Segmented bar in the spec's style: ███████░░░ — filled blocks against
  // empty ones, so the profile reads at a glance rather than needing a number.
  const filled = value === null ? 0 : Math.round((Math.max(0, Math.min(max, value)) / max) * blocks);
  return (
    <div className="meter">
      <div className="meter-head">
        <span className="meter-label">{label}</span>
        <span className="meter-val">{value === null ? "—" : Number(value.toFixed(1))}{suffix}</span>
      </div>
      <div className="blocks" role="img" aria-label={`${value === null ? "no" : value} out of ${max}`}>
        {Array.from({ length: blocks }, (_, i) => (
          <span key={i} className={"blk " + (i < filled ? "blk-on tone-" + tone : "blk-off")} />
        ))}
      </div>
    </div>
  );
}

function ScoreTile({ icon, label, value, sub, range }) {
  const shown = typeof value === "number" ? Number(value.toFixed(2)) : value;
  return (
    <div className="score-tile">
      <div className="tile-icon">{icon}</div>
      <div className="tile-val">{shown === null || shown === undefined ? "—" : shown}</div>
      <div className="tile-label">{label}</div>
      {range && <div className="tile-range">of {range}</div>}
      {sub && <div className="tile-sub">{sub}</div>}
    </div>
  );
}

function insightFor(results) {
  const cs = Object.values(results.biases.constructs)
    .filter((c) => c.pomp !== null)
    .sort((a, b) => b.pomp - a.pomp);
  const top = cs.slice(0, 2);
  const low = cs[cs.length - 1];
  const smfi = results.smfi.score;
  const maas = results.maas?.score ?? null;

  const lines = [];

  if (smfi !== null) {
    if (smfi >= 3.5) {
      lines.push("Social media is a substantial input into your money decisions — you engage with financial content often and it reaches the point of action.");
    } else if (smfi >= 2.5) {
      lines.push("Social media plays a moderate role in your money decisions: you see and think about financial content, but it does not usually decide things for you.");
    } else {
      lines.push("Social media plays a fairly small role in your financial decisions compared with most people who take this assessment.");
    }
  }

  if (top.length) {
    const names = top.map((t) => t.plainName.toLowerCase()).join(" and ");
    lines.push(`Your responses point most strongly towards ${names}. That is a tendency, not a verdict — it describes what pulls at you, not what you always do.`);
  }

  if (maas !== null) {
    if (maas < 3.5) {
      lines.push("Your everyday attention scores suggest a fair amount of running on automatic. That matters here, because most of the tendencies above operate in the gap between seeing something and noticing that you're reacting to it.");
    } else if (maas >= 4.5) {
      lines.push("You score relatively high on present-moment awareness, which is a genuine protective factor — noticing a reaction is most of what it takes to interrupt it.");
    }
  }

  if (results.feed && results.feed.verificationRate >= 0.4) {
    lines.push("In the simulated feed you opened the 'how would I check this' option often. That habit is worth more than any single insight on this page.");
  } else if (results.feed && results.feed.actionRate >= 0.4) {
    lines.push("In the simulated feed you were fairly quick to act on posts. Building in one checking step is the highest-value change available to you.");
  }

  const kc = results.literacy?.skipped ? null : results.knowledgeCalibration;
  if (kc && kc.direction === "overestimates") {
    lines.push(`There is a gap between how well you feel you understand financial products and how the knowledge questions went — you rated your understanding higher than the answers bore out. That gap is the most useful thing on this page, because it is invisible from the inside.`);
  } else if (kc && kc.direction === "underestimates") {
    lines.push("You know more than you give yourself credit for — you answered the knowledge questions better than your own confidence suggested. Under-confidence has its own costs, mainly staying out of decisions you could handle.");
  }

  if (low && low.pomp !== null && low.pomp < 35) {
    lines.push(`Worth noting: ${low.plainName.toLowerCase()} appears to be a relative strength for you.`);
  }

  return lines;
}

export default function Results({ session, onRestart, onExit, onContinue, embedded = false }) {
  const results = useMemo(() => scoreAll(session), [session]);
  const [tab, setTab] = useState("profile");
  const [submitted, setSubmitted] = useState(() => {
    try {
      return localStorage.getItem("mf_submitted") === session?.participantId;
    } catch {
      return false;
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Store a compact summary so the monthly check-up can compare waves.
  useEffect(() => {
    try {
      recordWave(results);
    } catch {
      /* storage unavailable — the check-up simply has nothing to compare */
    }
  }, [results]);

  const sorted = Object.values(results.biases.constructs).sort((a, b) => (b.pomp ?? 0) - (a.pomp ?? 0));
  const topKeys = sorted.slice(0, 3).map((c) => c.id);
  const lines = insightFor(results);

  const governanceReady = isConfigured();

  // ---------------------------------------------------------------------
  // Submitting to the research dataset.
  //
  // A participant has just given ten minutes. If the submit fails they are
  // almost certainly gone, so a failure must not simply throw the answers
  // away. Two protections:
  //
  //   1. The payload is written to localStorage BEFORE the request goes out,
  //      and only cleared once the server confirms. If the request fails —
  //      including the 30-to-50-second cold start on Render's free plan,
  //      which is the single most likely cause of a failed first submit —
  //      it is retried automatically the next time the app loads.
  //   2. The error shown is in plain language with a Try again button,
  //      rather than a raw status code the participant cannot act on.
  // ---------------------------------------------------------------------
  async function submit() {
    if (!governanceReady) return; // guarded in the UI too; belt and braces
    setSubmitting(true);
    setError(null);
    const payload = { raw: session, scored: results };

    // Park it first, so a crash or a closed tab does not lose the response.
    queueSubmission(payload);

    try {
      await postResponse(payload);
      setSubmitted(true);
      try {
        localStorage.setItem("mf_submitted", session.participantId);
      } catch { /* storage unavailable — the response is still recorded server-side */ }
      clearSubmission();
    } catch (e) {
      setError(
        e.retryable
          ? "We could not reach the server just now. Your answers are saved on this device and will be sent automatically next time you open this page — or press Try again."
          : `${e.message} Nothing was lost: your report still downloads.`
      );
      // A non-retryable rejection means re-sending the same payload will fail
      // the same way, so do not leave it queued to retry forever.
      if (!e.retryable) clearSubmission();
    } finally {
      setSubmitting(false);
    }
  }

  // The queued-submission flush lives in App.jsx, so it runs on ANY page
  // load rather than only when the results screen is reached again.


  function download() {
    downloadReport(results, session, lines);
  }

  return (
    <div className="screen screen-results">
      {!governanceReady && (
        <div className="pilot-banner">
          <strong>Pilot mode.</strong> This build is not approved for live data collection —
          researcher, supervisor and ethics committee details are not yet configured, so nothing
          can be submitted to the research dataset.
        </div>
      )}

      <div className="results-hero">
        <div className="hero-badge">Your results · {results.participantId}</div>
        <h1 className="hero-title">Your financial decision style</h1>
        <p className="hero-sub">
          Based on {results.quality.itemsAnswered} responses and {results.feed?.trials ?? 0} feed decisions.
        </p>
      </div>

      <div className="score-row">
        <ScoreTile icon="📲" label="Social media influence" value={results.smfi.score} range="5" />
        <ScoreTile icon="🧠" label="Behavioural bias index" value={results.biases.index} range="100" />
        {results.maas?.score != null && (
          <ScoreTile icon="🌱" label="Mindfulness (MAAS)" value={results.maas.score} range="6" />
        )}
        <ScoreTile
          icon="💰" label="Financial well-being"
          value={results.fwb?.score ?? results.cfpb?.raw}
          range={results.fwb?.score != null ? "5" : results.cfpb?.max}
        />
        {results.literacy?.skipped ? (
          <ScoreTile icon="🧾" label="Financial literacy" value="Skipped" />
        ) : (
          <ScoreTile icon="🧾" label="Financial literacy" value={`${results.literacy.correct}/${results.literacy.total}`} />
        )}
      </div>

      <nav className="pill-tabs">
        {[
          ["profile", "🧠 Bias profile"],
          ["insights", "💬 What it means"],
          // In the hub, Learn is a top-level section — no need to duplicate it here.
          ...(embedded ? [] : [["learn", "📚 Learn"]]),
          ["method", "🔬 How this was measured"],
          ["debrief", "📋 About the study"],
        ].map(([k, label]) => (
          <button key={k} className={"pill" + (tab === k ? " pill-on" : "")} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "profile" && (
        <div className="panel">
          <p className="screen-note">
            Each bar shows how strongly your answers lean towards that tendency, on a common
            0–100 scale. Higher is not "bad" — it tells you where your attention buys you the most.
          </p>
          {sorted.map((c) => {
            const b = band(c.pomp);
            return (
              <Meter
                key={c.id}
                label={<><span className={"band-word tone-" + b.tone}>{b.word}</span> {c.name}</>}
                value={c.pomp}
                tone={b.tone}
              />
            );
          })}
          <div className="split-row">
            <Meter label="Cognitive biases" value={results.biases.cognitive} tone="mid" />
            <Meter label="Emotional biases" value={results.biases.emotional} tone="mid" />
          </div>
          {results.feed && (
            <div className="notice notice-soft">
              <h4>In the simulated feed</h4>
              <p>
                You said you'd act on <strong>{Math.round(results.feed.actionRate * 100)}%</strong> of posts,
                and opened the checking panel on <strong>{Math.round(results.feed.verificationRate * 100)}%</strong>.
                Median time per post: {Math.round((results.feed.medianDwellMs || 0) / 1000)}s.
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "insights" && (
        <div className="panel">
          {lines.map((l, i) => (
            <div className="insight" key={i}>
              <span className="insight-mark">›</span>
              <p>{l}</p>
            </div>
          ))}
          <div className="challenge-box">
            <div className="challenge-tag">This week's challenge</div>
            <p>{CHALLENGES[topKeys[0]] || CHALLENGES.default}</p>
          </div>
          <p className="small muted">
            These are patterns in your answers, not a diagnosis. This is educational and is not financial advice.
          </p>
        </div>
      )}

      {tab === "learn" && (
        <div className="panel">
          <p className="screen-note">
            Start with the three that matter most for your profile. Each is about thirty seconds.
          </p>
          {[...topKeys, "smfi", "mindfulness"].map((k) => {
            const m = MODULES[k];
            if (!m) return null;
            return (
              <details className="module" key={k}>
                <summary>
                  <strong>{m.title}</strong>
                  <span className="module-time">{m.seconds}s</span>
                </summary>
                <div className="module-body">
                  <h5>What it is</h5><p>{m.what}</p>
                  <h5>Why it happens on feeds</h5><p>{m.why}</p>
                  <h5>What to do about it</h5><p className="module-do">{m.do}</p>
                  <p className="small muted">Based on: {m.citation}</p>
                </div>
              </details>
            );
          })}
        </div>
      )}

      {tab === "method" && (
        <div className="panel">
          <p className="screen-note">
            Every question in this assessment comes from a published instrument. Nothing was invented for it.
          </p>
          <table className="src-table">
            <thead><tr><th>Construct</th><th>Instrument</th><th>Source</th></tr></thead>
            <tbody>
              {Object.values(BIAS_CONSTRUCTS).map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{SOURCES[c.src]?.instrument}</td>
                  <td className="cite">{SOURCES[c.src]?.citation}</td>
                </tr>
              ))}
              {results.maas?.score != null && (
                <tr><td>Mindfulness</td><td>{SOURCES.brownRyan2003.instrument}</td><td className="cite">{SOURCES.brownRyan2003.citation}</td></tr>
              )}
              <tr>
                <td>Financial well-being</td>
                <td>{results.fwb?.score != null ? SOURCES.netemeyer2018.instrument : SOURCES.cfpb2015.instrument}</td>
                <td className="cite">{results.fwb?.score != null ? SOURCES.netemeyer2018.citation : SOURCES.cfpb2015.citation}</td>
              </tr>
              <tr><td>Financial literacy</td><td>{SOURCES.lusardiMitchell2014.instrument}</td><td className="cite">{SOURCES.lusardiMitchell2014.citation}</td></tr>
              <tr><td>Social media influence</td><td>{SOURCES.ni2020.instrument} + {SOURCES.ohanian1990.instrument}</td><td className="cite">{SOURCES.ni2020.citation}</td></tr>
              <tr><td>Simulated feed</td><td>{SOURCES.osc2024.instrument}</td><td className="cite">{SOURCES.osc2024.citation}</td></tr>
            </tbody>
          </table>
          <p className="small muted">
            You were assigned to the <strong>{ARMS[session.arm]?.label}</strong> condition.
            {" "}{ARMS[session.arm]?.description}
          </p>
        </div>
      )}

      {tab === "debrief" && (
        <div className="panel">
          <Debrief results={results} session={session} onBack={() => setTab("profile")} />
        </div>
      )}

      {needsSupport(results) && tab !== "debrief" && (
        <div className="panel">
          <div className="notice notice-support">
            <h4>If money worries are weighing on you</h4>
            <p className="small">
              Some of your answers touched on financial strain. Support exists and these are free:{" "}
              {SUPPORT.emotional.slice(0, 2).map((x) => `${x.name} ${x.contact} (${x.hours})`).join(" · ")}.
              There is more, with context, under <strong>About the study</strong>.
            </p>
          </div>
        </div>
      )}

      <div className="results-actions">
        {onContinue && (
          <button className="btn btn-primary btn-lg" onClick={onContinue}>
            Continue to my dashboard →
          </button>
        )}
        <button className={"btn btn-lg " + (onContinue ? "btn-secondary" : "btn-primary")} onClick={download}>
          ⬇ Download your report
        </button>
        {!submitted ? (
          <button
            className="btn btn-ghost btn-lg"
            onClick={submit}
            disabled={submitting || !governanceReady}
            title={governanceReady ? "" : "Disabled in pilot mode"}
          >
            {submitting ? "Sending…" : governanceReady ? "Contribute my answers to the research" : "Research submission disabled (pilot mode)"}
          </button>
        ) : (
          <span className="submitted">✓ Thank you — your anonymous responses were recorded.</span>
        )}
        {!embedded && !onContinue && (
          <>
            <button className="btn btn-ghost" onClick={onRestart}>Retake later / monthly check-up</button>
            <button className="btn btn-ghost" onClick={onExit}>Back to home</button>
          </>
        )}
      </div>
      {error && (
        <div className="submit-error">
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={submit} disabled={submitting}>
            {submitting ? "Trying…" : "Try again"}
          </button>
        </div>
      )}

      {results.quality.flagStraightlining && (
        <p className="small muted">
          Note: a long run of identical answers was detected. That's fine for your own report, but it's flagged in the research data.
        </p>
      )}
    </div>
  );
}
