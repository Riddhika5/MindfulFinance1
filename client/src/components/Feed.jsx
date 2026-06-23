// Feed.jsx — the vertical scrolling feed of financial posts.
// Each post is auto-tagged (hype / scam-risk / calm-advice) and has two
// buttons so you can record how it affected you.

const TAG_CLASS = {
  hype: "badge badge-hype",
  "scam-risk": "badge badge-scam",
  "calm-advice": "badge badge-calm",
  neutral: "badge badge-neutral",
};

export default function Feed({ posts, loading, sourceInfo, engagements, onToggle, onReload }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>📱 Your feed</h2>
        <button className="btn btn-ghost" onClick={onReload} disabled={loading}>
          {loading ? "Loading…" : "↻ Reload"}
        </button>
      </div>

      {sourceInfo && (
        <p className="muted small">
          Showing <strong>{sourceInfo.sourceUsed}</strong> posts
          {sourceInfo.fellBack && (
            <span className="warn">
              {" "}
              — live source failed, fell back to simulated ({sourceInfo.reason})
            </span>
          )}
          . Tags are auto-detected from keywords.
        </p>
      )}

      <div className="feed-scroll">
        {posts.map((p) => {
          const eng = engagements[p.id] || {};
          return (
            <article key={p.id} className="post">
              <div className="post-top">
                <span className="post-author">{p.author}</span>
                <span className={TAG_CLASS[p.tag] || TAG_CLASS.neutral}>
                  {p.emoji} {p.label}
                </span>
              </div>

              <p className="post-text">{p.text}</p>

              {p.url && (
                <a className="post-link" href={p.url} target="_blank" rel="noreferrer">
                  open original ↗
                </a>
              )}

              <div className="post-actions">
                <button
                  className={"chip " + (eng.influenced ? "chip-on" : "")}
                  onClick={() => onToggle(p, "influenced")}
                >
                  {eng.influenced ? "✓ " : ""}This influenced me
                </button>
                <button
                  className={"chip " + (eng.trade ? "chip-on" : "")}
                  onClick={() => onToggle(p, "trade")}
                >
                  {eng.trade ? "✓ " : ""}Made me want to buy/sell
                </button>
                <button
                  className={"chip " + (eng.anxious ? "chip-on" : "")}
                  onClick={() => onToggle(p, "anxious")}
                >
                  {eng.anxious ? "✓ " : ""}Made me anxious 😰
                </button>
                <button
                  className={"chip " + (eng.confused ? "chip-on" : "")}
                  onClick={() => onToggle(p, "confused")}
                >
                  {eng.confused ? "✓ " : ""}Didn't fully understand 🤔
                </button>
                <button
                  className={"chip " + (eng.notInfluenced ? "chip-on" : "")}
                  onClick={() => onToggle(p, "notInfluenced")}
                >
                  {eng.notInfluenced ? "✓ " : ""}Not influenced 🛡️
                </button>
              </div>
            </article>
          );
        })}

        {posts.length === 0 && !loading && <p className="muted">No posts to show.</p>}
      </div>
    </section>
  );
}
