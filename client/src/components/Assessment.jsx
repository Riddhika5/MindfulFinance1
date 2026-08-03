// ===========================================================================
// Assessment.jsx — the staged assessment journey
// ---------------------------------------------------------------------------
// One card on screen at a time, a percentage progress bar, and a session
// object that accumulates raw answers. Nothing is scored here; scoring lives
// in lib/scoring.js and runs only at the results step.
// ===========================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { SCALES, ITEM_COUNT } from "../lib/instruments.js";
import { seededShuffle } from "../lib/scoring.js";
import { buildJourney, progressFor, ELIGIBILITY, CONSENT } from "../lib/flow.js";
import { assignArm, ARMS } from "../lib/scenarios.js";
import FeedSim from "./FeedSim.jsx";
import Results from "./Results.jsx";
import { load, save } from "../lib/storage.js";

// --- participant identity ---------------------------------------------------
function newParticipantId() {
  const rnd = () => Math.random().toString(36).slice(2, 8);
  return `MF-${rnd()}${rnd()}`.toUpperCase();
}

function useSession() {
  const [session, setSession] = useState(() => {
    const saved = load("mf_session", null);
    if (saved?.participantId) return saved;
    const participantId = newParticipantId();
    return {
      participantId,
      arm: assignArm(participantId),
      startedAt: new Date().toISOString(),
      answers: {},
      feedTrials: [],
      lossTask: null,
      anchorTask: null,
      wave: 1,
    };
  });
  useEffect(() => save("mf_session", session), [session]);
  const setAnswer = (id, value) =>
    setSession((s) => ({ ...s, answers: { ...s.answers, [id]: value } }));
  return [session, setSession, setAnswer];
}

// ===========================================================================
// Small shared inputs
// ===========================================================================
function LikertRow({ item, scale, value, onChange, index }) {
  const s = SCALES[scale];
  return (
    <div className={"q-row" + (value != null ? " q-answered" : "")}>
      <div className="q-text">
        <span className="q-num">{index}</span>
        {item.q}
      </div>
      <div className={"q-options opt-" + s.points}>
        {s.labels.map((label, i) => (
          <button
            key={label}
            type="button"
            className={"opt" + (value === i + 1 ? " opt-on" : "")}
            onClick={() => onChange(i + 1)}
            aria-pressed={value === i + 1}
          >
            <span className="opt-dot" />
            <span className="opt-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Compact matrix row: one line per item, radio dots under sticky column heads. */
function MatrixRow({ item, scale, value, onChange, index }) {
  const s = SCALES[scale];
  return (
    <div className={"mx-row" + (value != null ? " mx-answered" : "")}>
      <div className="mx-q"><span className="mx-num">{index}</span>{item.q}</div>
      <div className={"mx-opts mx-" + s.points} role="radiogroup" aria-label={item.q}>
        {s.labels.map((label, i) => (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={value === i + 1}
            aria-label={label}
            title={label}
            className={"mx-dot" + (value === i + 1 ? " mx-on" : "")}
            onClick={() => onChange(i + 1)}
          />
        ))}
      </div>
    </div>
  );
}

/** Sticky anchor header so people always know what the columns mean. */
function MatrixHead({ scale }) {
  const s = SCALES[scale];
  return (
    <div className="mx-head">
      <div className="mx-q mx-head-spacer" />
      <div className={"mx-opts mx-" + s.points}>
        {s.labels.map((label) => (
          <span className="mx-head-label" key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function ChoiceRow({ item, value, onChange, index }) {
  const isMulti = item.type === "multi";
  const selected = isMulti ? (Array.isArray(value) ? value : []) : value;
  const toggle = (opt) => {
    if (!isMulti) return onChange(opt);
    const next = selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt];
    onChange(next);
  };
  return (
    <div className={"q-row" + (value != null && (!isMulti || selected.length) ? " q-answered" : "")}>
      <div className="q-text">
        <span className="q-num">{index}</span>
        {item.q}
        {isMulti && <span className="q-hint">Choose all that apply</span>}
      </div>
      <div className="chip-row">
        {item.options.map((opt) => {
          const on = isMulti ? selected.includes(opt) : value === opt;
          return (
            <button key={opt} type="button" className={"chip" + (on ? " chip-on" : "")} onClick={() => toggle(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CfpbRow({ item, value, onChange, index }) {
  const s = SCALES[item.scale];
  return (
    <div className={"q-row" + (value != null ? " q-answered" : "")}>
      <div className="q-text">
        <span className="q-num">{index}</span>
        {item.q}
      </div>
      <div className="chip-row">
        {s.labels.map((label, i) => (
          <button key={label} type="button" className={"chip" + (value === i ? " chip-on" : "")} onClick={() => onChange(i)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuizRow({ item, value, onChange, index }) {
  const answered = value != null;
  const correct = value === item.correct;
  const isDK = typeof value === "string" && value.toLowerCase().startsWith("do not know");
  return (
    <div className={"q-row" + (answered ? " q-answered" : "")}>
      <div className="q-text">
        <span className="q-num">{index}</span>
        {item.q}
      </div>
      <div className="chip-row chip-col">
        {item.options.map((opt) => {
          const chosen = value === opt;
          const reveal = answered && opt === item.correct;
          return (
            <button
              key={opt}
              type="button"
              className={
                "chip" +
                (chosen ? " chip-on" : "") +
                (reveal ? " chip-correct" : "") +
                (chosen && !correct && !isDK ? " chip-wrong" : "")
              }
              onClick={() => onChange(opt)}
            >
              {opt}
              {reveal && <span className="chip-mark">✓</span>}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={"quiz-feedback " + (correct ? "qf-right" : "qf-wrong")}>
          <strong>{correct ? "Correct." : isDK ? "That's a fair answer." : "Not quite."}</strong>{" "}
          {item.explain}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Screens
// ===========================================================================
function Welcome({ onNext, onLearnMore }) {
  return (
    <div className="screen screen-hero">
      <div className="hero-badge">Doctoral research · MindfulFinance</div>
      <h1 className="hero-title">
        Know your <em>financial decision style</em>
      </h1>
      <p className="hero-sub">
        Discover how social media influences your financial decisions, and receive personalised
        insights to improve your financial well-being.
      </p>
      <div className="hero-stats">
        <div><strong>{ITEM_COUNT}</strong><span>questions</span></div>
        <div><strong>12–15</strong><span>minutes</span></div>
        <div><strong>100%</strong><span>anonymous</span></div>
      </div>
      <div className="hero-actions">
        <button className="btn btn-primary btn-lg" onClick={onNext}>Start assessment →</button>
        <button className="btn btn-ghost btn-lg" onClick={onLearnMore}>Learn more</button>
      </div>
      <p className="small muted center">No sign-up. No email. Nothing is submitted until you finish.</p>
    </div>
  );
}

function About({ onNext, onBack }) {
  const cards = [
    { icon: "🧪", h: "Built on validated scales", p: "Every question is taken or adapted from a published, peer-reviewed instrument — MAAS, the CFPB Financial Well-Being Scale, the Lusardi–Mitchell literacy questions and validated behavioural-bias scales." },
    { icon: "📱", h: "A feed, not a form", p: "Part of the assessment is a short simulated social media feed. You react to posts the way you normally would. Every post in it is fictional." },
    { icon: "📊", h: "You get a real report", p: "At the end you see your behavioural bias profile, your social media influence score, mindfulness and financial well-being — and can download it." },
    { icon: "🔒", h: "Anonymous by design", p: "No name, no email, no IP address. A random code links your answers together and nothing else." },
  ];
  return (
    <div className="screen">
      <h2 className="screen-title">What you're about to do</h2>
      <div className="card-grid">
        {cards.map((c) => (
          <div className="info-card" key={c.h}>
            <div className="info-icon">{c.icon}</div>
            <h3>{c.h}</h3>
            <p>{c.p}</p>
          </div>
        ))}
      </div>
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function Consent({ answers, setAnswer, onNext, onBack }) {
  const ok = CONSENT.checkboxes.filter((c) => c.required).every((c) => answers[c.id]);
  return (
    <div className="screen">
      <h2 className="screen-title">{CONSENT.icon} {CONSENT.title}</h2>
      <div className="consent-body">
        {CONSENT.sections.map((s) => (
          <div key={s.h} className="consent-sec">
            <h4>{s.h}</h4>
            <p>{s.p}</p>
          </div>
        ))}
      </div>
      <div className="consent-checks">
        {CONSENT.checkboxes.map((c) => (
          <label key={c.id} className={"check" + (answers[c.id] ? " check-on" : "")}>
            <input type="checkbox" checked={!!answers[c.id]} onChange={(e) => setAnswer(c.id, e.target.checked)} />
            <span>{c.label}{c.required && <em className="req"> *</em>}</span>
          </label>
        ))}
      </div>
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!ok} onClick={onNext}>
          {ok ? "I agree — continue →" : "Please tick the three boxes"}
        </button>
      </div>
    </div>
  );
}

function Gate({ block, answers, setAnswer, onNext, onBack }) {
  const answered = block.items.every((i) => answers[i.id]);
  const ineligible = block.items.some((i) => (i.disqualify || []).includes(answers[i.id]));
  return (
    <div className="screen">
      <h2 className="screen-title">{block.icon} {block.title}</h2>
      {block.items.map((item, i) => (
        <ChoiceRow key={item.id} item={item} index={i + 1} value={answers[item.id]} onChange={(v) => setAnswer(item.id, v)} />
      ))}
      {ineligible && (
        <div className="notice notice-soft">
          <h4>Thank you for your interest</h4>
          <p>{block.ineligibleMessage}</p>
        </div>
      )}
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" disabled={!answered || ineligible} onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function ChoiceBlock({ block, answers, setAnswer, onNext, onBack }) {
  return (
    <div className="screen">
      <h2 className="screen-title">{block.icon} {block.title}</h2>
      {block.note && <p className="screen-note">{block.note}</p>}
      {block.items.map((item, i) => (
        <ChoiceRow key={item.id} item={item} index={i + 1} value={answers[item.id]} onChange={(v) => setAnswer(item.id, v)} />
      ))}
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <button className="btn btn-primary" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function LikertBlock({ step, answers, setAnswer, onNext, onBack, seed, onOrder }) {
  const groups = useMemo(() => {
    const base = step.groups || [{ id: step.id, heading: null, scale: step.scale, items: step.items }];
    if (!step.randomise) return base;
    // Deterministic per participant: refreshing the page keeps the same order.
    return base.map((g) => ({ ...g, items: seededShuffle(g.items, `${seed}|${g.id}`) }));
  }, [step, seed]);
  const all = groups.flatMap((g) => g.items);

  // Report the order items were actually shown in, once per block.
  useEffect(() => {
    if (onOrder) onOrder(step.id, all.map((i) => i.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const done = all.filter((i) => answers[i.id] != null).length;
  const complete = done === all.length;
  // A matrix only works when every row shares one set of anchors.
  const isMatrix = step.layout === "matrix" && new Set(groups.map((g) => g.scale)).size === 1;
  let counter = 0;

  return (
    <div className={"screen" + (isMatrix ? " screen-matrix" : "")}>
      <h2 className="screen-title">{step.icon} {step.title}</h2>
      {step.intro && <p className="screen-note">{step.intro}</p>}
      {isMatrix && <MatrixHead scale={groups[0].scale} />}

      {groups.map((g) => {
        const s = SCALES[g.scale];
        return (
          <div className={isMatrix ? "mx-group" : "q-group"} key={g.id}>
            {g.heading && <h3 className="q-group-title">{g.heading}</h3>}
            {!isMatrix && (g.prompt || s.stem) && <p className="q-stem">{g.prompt || s.stem}</p>}
            {isMatrix && g.prompt && <p className="q-stem">{g.prompt}</p>}
            {g.items.map((item) => {
              counter += 1;
              const common = {
                key: item.id, item, index: counter, scale: g.scale,
                value: answers[item.id], onChange: (v) => setAnswer(item.id, v),
              };
              return isMatrix ? <MatrixRow {...common} /> : <LikertRow {...common} />;
            })}
          </div>
        );
      })}
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <span className="answered-count">{done} / {all.length} answered</span>
        <button className="btn btn-primary" disabled={!complete} onClick={onNext}>
          {complete ? "Continue →" : `${all.length - done} left`}
        </button>
      </div>
    </div>
  );
}

function CfpbBlock({ step, answers, setAnswer, onNext, onBack }) {
  const done = step.items.filter((i) => answers[i.id] != null).length;
  const complete = done === step.items.length;
  return (
    <div className="screen">
      <h2 className="screen-title">💰 {step.title}</h2>
      <p className="screen-note">
        The first six ask how well a statement describes you. The last four ask how often it applies.
      </p>
      {step.items.map((item, i) => (
        <div key={item.id}>
          {i === 0 && <p className="q-stem">{SCALES.cfpbDescribes.stem}</p>}
          {i === 6 && <p className="q-stem">{SCALES.cfpbOften.stem}</p>}
          <CfpbRow item={item} index={i + 1} value={answers[item.id]} onChange={(v) => setAnswer(item.id, v)} />
        </div>
      ))}
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <span className="answered-count">{done} / {step.items.length} answered</span>
        <button className="btn btn-primary" disabled={!complete} onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}

function QuizBlock({ step, answers, setAnswer, onNext, onBack }) {
  const done = step.items.filter((i) => answers[i.id] != null).length;
  return (
    <div className="screen">
      <h2 className="screen-title">{step.icon} {step.title}</h2>
      <p className="screen-note">{step.intro}</p>
      {step.items.map((item, i) => (
        <QuizRow key={item.id} item={item} index={i + 1} value={answers[item.id]} onChange={(v) => setAnswer(item.id, v)} />
      ))}
      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <span className="answered-count">{done} / {step.items.length} answered</span>
        <button className="btn btn-primary" disabled={done !== step.items.length} onClick={onNext}>
          See my results →
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// Controller
// ===========================================================================
export default function Assessment({ onExit, onComplete, onSessionChange }) {
  const steps = useMemo(() => buildJourney(), []);
  const [i, setI] = useState(0);
  const [session, setSession, setAnswer] = useSession();
  const topRef = useRef(null);

  // Keep the shell's copy of the session in step, so the hub can read it.
  useEffect(() => {
    if (onSessionChange) onSessionChange(session);
  }, [session, onSessionChange]);

  const step = steps[i];
  const pct = progressFor(steps, i);

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [i]);

  // Record the order items were presented in, for order-effect analysis.
  function recordOrder(stepId, ids) {
    setSession((sn) =>
      sn.presentedOrder?.[stepId]
        ? sn
        : { ...sn, presentedOrder: { ...(sn.presentedOrder || {}), [stepId]: ids } }
    );
  }

  const next = () => setI((n) => Math.min(n + 1, steps.length - 1));
  const back = () => setI((n) => Math.max(n - 1, 0));

  const restart = () => {
    const participantId = newParticipantId();
    setSession({
      participantId,
      arm: assignArm(participantId),
      startedAt: new Date().toISOString(),
      answers: {},
      feedTrials: [],
      lossTask: null,
      anchorTask: null,
      wave: (session.wave || 1) + 1,
    });
    setI(0);
  };

  const showChrome = step.chrome !== false;

  return (
    <div className="assess" ref={topRef}>
      {showChrome && (
        <div className="progress-wrap">
          <div className="progress-head">
            <span className="progress-section">{step.icon} {step.section}</span>
            <span className="progress-pct">{pct}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="step-anim" key={step.id}>
        {step.kind === "welcome" && <Welcome onNext={next} onLearnMore={next} />}
        {step.kind === "about" && <About onNext={next} onBack={onExit} />}
        {step.kind === "consent" && (
          <Consent answers={session.answers} setAnswer={setAnswer} onNext={next} onBack={back} />
        )}
        {step.kind === "gate" && (
          <Gate block={step.block} answers={session.answers} setAnswer={setAnswer} onNext={next} onBack={back} />
        )}
        {step.kind === "choices" && (
          <ChoiceBlock block={step.block} answers={session.answers} setAnswer={setAnswer} onNext={next} onBack={back} />
        )}
        {step.kind === "likert" && (
          <LikertBlock step={step} answers={session.answers} setAnswer={setAnswer}
            onNext={next} onBack={back} seed={session.participantId} onOrder={recordOrder} />
        )}
        {step.kind === "cfpb" && (
          <CfpbBlock step={step} answers={session.answers} setAnswer={setAnswer} onNext={next} onBack={back} />
        )}
        {step.kind === "quiz" && (
          <QuizBlock step={step} answers={session.answers} setAnswer={setAnswer} onNext={next} onBack={back} />
        )}
        {step.kind === "feed" && (
          <FeedSim
            session={session}
            arm={ARMS[session.arm]}
            onComplete={(trials) => {
              setSession((s) => ({ ...s, feedTrials: trials }));
              next();
            }}
            onBack={back}
          />
        )}
        {step.kind === "results" && (
          <Results
            session={session}
            onRestart={restart}
            onExit={onExit}
            onContinue={onComplete ? () => onComplete(session) : null}
          />
        )}
      </div>
    </div>
  );
}
