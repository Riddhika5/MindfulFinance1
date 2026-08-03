// ===========================================================================
// FeedSim.jsx — the Simulated Social Media Feed (SSMF), single page
// ---------------------------------------------------------------------------
// All posts on one scrollable page, the way a real feed behaves. For each post
// we record: decision, stated reason, dwell time, whether the "check it"
// affordance was opened, the assigned social-proof level, and the arm.
//
// Dwell time here is time-to-first-decision measured from when the card scrolls
// into view, not from page load — one page means several cards are visible at
// once, so a page-load baseline would be meaningless.
//
// Every post is fictional. See lib/scenarios.js.
// ===========================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { buildFeedTrials, DECISIONS, REASON_CODES, PREBUNK_CONTENT } from "../lib/scenarios.js";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

function Prebunk({ onDone }) {
  return (
    <div className="screen">
      <h2 className="screen-title">🛡️ {PREBUNK_CONTENT.title}</h2>
      <p className="screen-note">Take thirty seconds with these. A short feed follows.</p>
      <div className="card-grid">
        {PREBUNK_CONTENT.points.map((p) => (
          <div className="info-card" key={p.name}>
            <div className="info-icon">{p.icon}</div>
            <h3>{p.name}</h3>
            <p>{p.text}</p>
          </div>
        ))}
      </div>
      <div className="screen-actions">
        <button className="btn btn-primary" onClick={onDone}>I'm ready →</button>
      </div>
    </div>
  );
}

function PostCard({ post, arm, trial, onChange, onSeen }) {
  const ref = useRef(null);
  const seen = useRef(false);
  const [showVerify, setShowVerify] = useState(false);
  const [pauseLeft, setPauseLeft] = useState(0);

  // Start this card's clock when it actually reaches the viewport.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") { onSeen(post.id); return undefined; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting && !seen.current) { seen.current = true; onSeen(post.id); io.disconnect(); }
      }),
      { threshold: 0.5 }
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]);

  // Mindful-pause arm: a short hold between choosing and the reason unlocking.
  useEffect(() => {
    if (!arm.showPause || !trial?.decision) return undefined;
    setPauseLeft(arm.pauseSeconds);
    const t = setInterval(() => setPauseLeft((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    return () => clearInterval(t);
  }, [trial?.decision, arm]);

  const locked = arm.showPause && trial?.decision && pauseLeft > 0;

  return (
    <article className={"sim-card tone-" + post.tag + (trial?.decision && trial?.reason ? " sim-done" : "")} ref={ref}>
      <header className="sim-head">
        <div className="sim-avatar">{post.avatar}</div>
        <div className="sim-id">
          <div className="sim-handle">
            {post.handle} {post.verified && <span className="tick" title="Verified">✔</span>}
          </div>
          <div className="sim-kind">
            {post.kind}
            {post.metrics.trending && <span className="trend-chip">🔥 Trending</span>}
          </div>
        </div>
        <div className="sim-metrics-inline">
          ❤️ {fmt(post.metrics.likes)} · 💬 {fmt(post.metrics.comments)}
        </div>
      </header>

      <p className="sim-body">{post.body}</p>

      {arm.showDisclosure && post.tag !== "calm" && (
        <div className="sim-disclosure">
          ⚠️ Content like this may be a paid promotion. Returns shown are not guaranteed and you can lose money.
        </div>
      )}

      <div className="sim-actions">
        <div className="sim-choices">
          {DECISIONS.map((d) => (
            <button
              key={d.id}
              className={"mini-chip" + (trial?.decision === d.id ? " mini-on" : "")}
              onClick={() => onChange(post.id, { decision: d.id })}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>
        <button
          className="link-btn"
          onClick={() => { setShowVerify((v) => !v); if (!showVerify) onChange(post.id, { openedVerify: true }); }}
        >
          {showVerify ? "Hide" : "🔍 How would I check this?"}
        </button>
      </div>

      {showVerify && (
        <div className="verify-panel">
          <ul>
            <li>Is the person registered with the regulator, or just confident?</li>
            <li>Are they paid to say this? Look for a disclosure.</li>
            <li>Does an independent source say the same thing?</li>
            <li>What is the downside — and could you afford it?</li>
          </ul>
        </div>
      )}

      {trial?.decision && (
        <div className="sim-why">
          {locked ? (
            <div className="pause-inline">
              <span className="pause-ring-sm">{pauseLeft}</span>
              Take a breath. Notice what you're feeling — curiosity, urgency, doubt.
            </div>
          ) : (
            <>
              <span className="sim-why-label">Why?</span>
              <div className="reason-wrap">
                {Object.entries(REASON_CODES).map(([k, v]) => (
                  <button
                    key={k}
                    className={"mini-chip" + (trial?.reason === k ? " mini-on" : "")}
                    onClick={() => onChange(post.id, { reason: k })}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export default function FeedSim({ session, arm, onComplete, onBack }) {
  const posts = useMemo(() => buildFeedTrials(session.participantId), [session.participantId]);
  const [showPrebunk, setShowPrebunk] = useState(!!arm.showPrebunk);
  const [trials, setTrials] = useState({});
  const seenAt = useRef({});

  const markSeen = (id) => { if (!seenAt.current[id]) seenAt.current[id] = Date.now(); };

  function update(postId, patch) {
    setTrials((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        ...patch,
        // Time from the card entering view to the first decision on it.
        ...(patch.decision && !prev[postId]?.decision
          ? { dwellMs: Date.now() - (seenAt.current[postId] || Date.now()) }
          : {}),
      },
    }));
  }

  if (showPrebunk) return <Prebunk onDone={() => setShowPrebunk(false)} />;

  const done = posts.filter((p) => trials[p.id]?.decision && trials[p.id]?.reason).length;
  const complete = done === posts.length;

  function finish() {
    onComplete(posts.map((p, i) => {
      const t = trials[p.id] || {};
      return {
        postId: p.id,
        targetBias: p.targetBias,
        tag: p.tag,
        socialProof: p.socialProof,
        likes: p.metrics.likes,
        arm: arm.id,
        decision: t.decision || null,
        reason: t.reason || null,
        reasonMaps: REASON_CODES[t.reason]?.maps || null,
        openedVerify: !!t.openedVerify,
        dwellMs: t.dwellMs ?? null,
        order: i,
      };
    }));
  }

  return (
    <div className="screen screen-feed">
      <h2 className="screen-title">📰 Your feed</h2>
      <p className="screen-note">
        Imagine these appeared in your feed today. React the way you actually would — pick what you'd
        do, then why. Scroll through all {posts.length}.
      </p>

      <div className="feed-progress">
        <div className="feed-progress-bar">
          <div className="feed-progress-fill" style={{ width: `${(done / posts.length) * 100}%` }} />
        </div>
        <span>{done} of {posts.length}</span>
      </div>

      <div className="feed-stream">
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            arm={arm}
            trial={trials[p.id]}
            onChange={update}
            onSeen={markSeen}
          />
        ))}
      </div>

      <div className="screen-actions">
        <button className="btn btn-ghost" onClick={onBack}>Back</button>
        <span className="answered-count">{done} / {posts.length} answered</span>
        <button className="btn btn-primary" disabled={!complete} onClick={finish}>
          {complete ? "Continue →" : `${posts.length - done} left`}
        </button>
      </div>
    </div>
  );
}
