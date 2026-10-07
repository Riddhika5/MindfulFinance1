// ===========================================================================
// FeedSim.jsx — the Simulated Social Media Feed (SSMF), single page
// ---------------------------------------------------------------------------
// All posts on one scrollable page, the way a real feed behaves. For each post
// we record: decision, dwell time, the assigned social-proof level and the arm.
//
// Dwell time here is time-to-first-decision measured from when the card scrolls
// into view, not from page load — one page means several cards are visible at
// once, so a page-load baseline would be meaningless.
//
// SIMPLIFIED (August 2026) at the researcher's instruction:
//   • the "Why?" reason chips are gone — decision, dwell time and the
//     verification click remain as the behavioural DVs
//   • the 10-second mindful-pause delay is gone, with the mindfulness layer
//   • the prebunking screen that preceded the feed is gone, so the feed is
//     genuinely one page
//   • the "How would I check this?" panel is gone (October 2026). It was the
//     only prompt in the feed, and a prompt to verify is an intervention:
//     showing it teaches the behaviour it then measures. Removing it leaves
//     the feed purely observational. The cost is that verification rate is no
//     longer a dependent variable — decision and dwell time remain.
//   • the paid-promotion disclosure banner is gone — nothing in this study is
//     sponsored, so a banner implying otherwise would have been inaccurate.
//     That removes the last treatment arm, so the feed is now a behavioural
//     task inside a survey rather than a randomised experiment.
//
// Every post is fictional. See lib/scenarios.js.
// ===========================================================================

import { useEffect, useMemo, useRef, useState } from "react";
import { buildFeedTrials, DECISIONS } from "../lib/scenarios.js";
import { OPEN_ENDED } from "../lib/instruments.js";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

function PostCard({ post, arm, trial, onChange, onSeen }) {
  const ref = useRef(null);
  const seen = useRef(false);

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

  return (
    <article className={"sim-card tone-" + post.tag + (trial?.decision ? " sim-done" : "")} ref={ref}>
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
      </div>

    </article>
  );
}

export default function FeedSim({ session, arm, answers, setAnswer, onComplete, onBack }) {
  const posts = useMemo(() => buildFeedTrials(session.participantId), [session.participantId]);
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

  const done = posts.filter((p) => trials[p.id]?.decision).length;
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
        dwellMs: t.dwellMs ?? null,
        order: i,
      };
    }));
  }

  return (
    <div className="screen screen-feed">
      <h2 className="screen-title">📰 Your feed</h2>
      <p className="screen-note">
        Imagine these appeared in your feed today. React the way you actually would.
        Scroll through all {posts.length} and pick one action for each.
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

      {/* Open-ended probe. Optional, and deliberately placed AFTER every
          closed item so it cannot prime the fixed battery. */}
      <div className="open-block">
        <h3 className="open-title">{OPEN_ENDED.icon} {OPEN_ENDED.title}</h3>
        <p className="open-privacy">{OPEN_ENDED.privacyNote}</p>
        {OPEN_ENDED.items.map((item) => (
          <div className="open-field" key={item.id}>
            <label htmlFor={item.id}>{item.q}</label>
            {item.hint && <span className="open-hint">{item.hint}</span>}
            <textarea
              id={item.id}
              rows={item.rows}
              maxLength={item.maxLength}
              value={answers?.[item.id] || ""}
              onChange={(e) => setAnswer(item.id, e.target.value)}
              placeholder="Type here, or leave blank"
            />
            <span className="open-count">
              {(answers?.[item.id] || "").length} / {item.maxLength}
            </span>
          </div>
        ))}
      </div>

      <p className="page-source">
        Feed paradigm adapted from the Ontario Securities Commission &amp; The Decision Lab (2024),
        <em> Social media and retail investing: The rise of finfluencers</em>. All posts, handles and
        funds shown are fictional.
      </p>

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
