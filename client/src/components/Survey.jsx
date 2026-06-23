// Survey.jsx — the research questionnaire. People answer it, it's scored and
// sent to the server, then we show the aggregate analysis across everyone:
//   - which bias affects people most (self-reported)
//   - average financial well-being, mindfulness, social-media influence
//   - the KEY insight: do more-mindful people report fewer biases?

import { useEffect, useState } from "react";
import { SURVEY_SECTIONS, SCALE_ITEMS, QUIZ_ITEMS, LIKERT, scoreSurvey } from "../lib/survey.js";

export default function Survey() {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("");
  const [results, setResults] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function setAnswer(id, value) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function loadResults() {
    try {
      const r = await fetch("/api/survey-results");
      setResults(await r.json());
    } catch {
      setResults({ error: "Could not reach the server." });
    }
  }

  useEffect(() => {
    loadResults();
  }, []);

  async function submit() {
    // Require every rating + quiz question (the "About you" choices are optional).
    const required = [...SCALE_ITEMS, ...QUIZ_ITEMS];
    const missing = required.filter((i) => !answers[i.id]);
    if (missing.length > 0) {
      setStatus(`⚠️ Please answer all ${required.length} questions (${missing.length} left).`);
      return;
    }
    setStatus("Sending…");
    const summary = scoreSurvey(answers);
    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summary),
      });
      const d = await res.json();
      if (d.ok) {
        setStatus("✅ Thank you! Your response was recorded.");
        setSubmitted(true);
        await loadResults();
      } else {
        setStatus("⚠️ " + (d.error || "Could not save."));
      }
    } catch {
      setStatus("⚠️ Could not reach the server.");
    }
  }

  const maxBias = results?.biasRanking?.length ? results.biasRanking[0].avg : 5;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>📋 Research survey</h2>
      </div>
      <p className="small muted">
        Adapted for education from the CFPB Financial Well-Being Scale and the Mindful Attention
        Awareness Scale. Anonymous — please answer honestly.
      </p>

      {!submitted && (
        <div className="survey">
          {SURVEY_SECTIONS.map((section) => (
            <div className="survey-section" key={section.title}>
              <h3>{section.title}</h3>
              {section.note && <p className="small muted">{section.note}</p>}

              {section.items.map((item) => (
                <div className="q" key={item.id}>
                  <p className="q-text">{item.q}</p>

                  {item.type === "choice" && (
                    <select value={answers[item.id] || ""} onChange={(e) => setAnswer(item.id, e.target.value)}>
                      <option value="">— choose —</option>
                      {item.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}

                  {item.type === "quiz" && (
                    <div className="quiz-opts">
                      {item.options.map((o) => (
                        <button
                          key={o}
                          className={"quiz-opt " + (answers[item.id] === o ? "quiz-on" : "")}
                          onClick={() => setAnswer(item.id, o)}
                        >
                          {o}
                        </button>
                      ))}
                    </div>
                  )}

                  {item.type === "scale" && (
                    <div className="likert">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          className={"likert-btn " + (Number(answers[item.id]) === n ? "likert-on" : "")}
                          title={LIKERT[n - 1]}
                          onClick={() => setAnswer(item.id, n)}
                        >
                          {n}
                        </button>
                      ))}
                      <span className="likert-legend">1 = {LIKERT[0]} · 5 = {LIKERT[4]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          <button className="btn btn-primary" onClick={submit}>
            Submit my answers
          </button>
          {status && <p className="small" style={{ marginTop: 8 }}>{status}</p>}
        </div>
      )}

      {submitted && <p className="small">{status}</p>}

      {/* ---- aggregate research results ---- */}
      <div className="panel-head" style={{ marginTop: 18 }}>
        <h2>📊 Survey results (everyone)</h2>
        <button className="btn btn-ghost" onClick={loadResults}>↻ Refresh</button>
      </div>

      {results?.error && <p className="warn">{results.error}</p>}
      {results && !results.error && results.count === 0 && (
        <p className="muted">No survey responses yet — be the first above!</p>
      )}

      {results && results.count > 0 && (
        <>
          <p className="small muted">Based on {results.count} response(s).</p>

          <div className="stat-row">
            <div className="stat">
              <span className="stat-num">{results.avgWellbeing ?? "—"}</span>
              <span className="small muted">avg well-being /5</span>
            </div>
            <div className="stat">
              <span className="stat-num">{results.avgMindfulness ?? "—"}</span>
              <span className="small muted">avg mindfulness /5</span>
            </div>
            <div className="stat">
              <span className="stat-num">{results.avgInfluence ?? "—"}</span>
              <span className="small muted">avg SM influence /5</span>
            </div>
            <div className="stat">
              <span className="stat-num">{results.avgLiteracy != null ? results.avgLiteracy + "%" : "—"}</span>
              <span className="small muted">avg financial literacy</span>
            </div>
          </div>

          {results.biasRanking?.length > 0 && (
            <div className="analysis-block">
              <h3>Which bias affects people most (self-reported)</h3>
              {results.biasRanking.map((b, i) => (
                <div className="chart-row" key={b.name}>
                  <span className="chart-label">
                    {i === 0 ? "🔺 " : i === results.biasRanking.length - 1 ? "🔻 " : ""}
                    {b.name}
                  </span>
                  <div className="chart-bar-track">
                    <div className="chart-bar" style={{ width: `${(b.avg / 5) * 100}%` }} />
                  </div>
                  <span className="chart-amt">{b.avg}/5</span>
                </div>
              ))}
              <p className="small muted">
                Affects people most: <strong>{results.biasRanking[0].name}</strong>
                {results.biasRanking.length > 1 && (
                  <> · least: <strong>{results.biasRanking[results.biasRanking.length - 1].name}</strong></>
                )}
                .
              </p>
            </div>
          )}

          {/* the headline insight for your project */}
          {results.mindfulnessInsight &&
            results.mindfulnessInsight.highBiasAvg != null &&
            results.mindfulnessInsight.lowBiasAvg != null && (
              <div className="analysis-block insight-box">
                <h3>🧘 Does mindfulness relate to fewer biases?</h3>
                <p>
                  People with <strong>higher mindfulness</strong> ({results.mindfulnessInsight.highCount}{" "}
                  people) reported an average bias score of{" "}
                  <strong>{results.mindfulnessInsight.highBiasAvg}/5</strong>, while those with{" "}
                  <strong>lower mindfulness</strong> ({results.mindfulnessInsight.lowCount} people) reported{" "}
                  <strong>{results.mindfulnessInsight.lowBiasAvg}/5</strong>.
                </p>
                <p className="small muted">
                  {results.mindfulnessInsight.highBiasAvg < results.mindfulnessInsight.lowBiasAvg
                    ? "→ More-mindful people report FEWER biases — supporting mindfulness as a tool in behavioural finance."
                    : "→ No clear reduction yet — collect more responses to see the pattern."}
                </p>
              </div>
            )}

          {/* financial literacy vs biases */}
          {results.literacyInsight &&
            results.literacyInsight.highBiasAvg != null &&
            results.literacyInsight.lowBiasAvg != null && (
              <div className="analysis-block insight-box">
                <h3>📚 Does financial literacy relate to fewer biases?</h3>
                <p>
                  People with <strong>higher financial literacy</strong> ({results.literacyInsight.highCount}{" "}
                  people) reported an average bias score of{" "}
                  <strong>{results.literacyInsight.highBiasAvg}/5</strong>, while those with{" "}
                  <strong>lower literacy</strong> ({results.literacyInsight.lowCount} people) reported{" "}
                  <strong>{results.literacyInsight.lowBiasAvg}/5</strong>.
                </p>
                <p className="small muted">
                  {results.literacyInsight.highBiasAvg < results.literacyInsight.lowBiasAvg
                    ? "→ More financially literate people report FEWER biases — learning the basics is protective."
                    : "→ No clear pattern yet — collect more responses to see the relationship."}
                </p>
              </div>
            )}
        </>
      )}
    </section>
  );
}
