// ExpenseTracker.jsx — add expenses, optionally link the feed post that
// triggered them, and see a list + totals + a simple per-category bar chart.

import { useState } from "react";

const CATEGORIES = [
  "Food & dining",
  "Shopping",
  "Gadgets",
  "Investing / trading",
  "Crypto",
  "Subscriptions",
  "Entertainment",
  "Other",
];

export default function ExpenseTracker({ expenses, posts, onAdd, onDelete }) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [note, setNote] = useState("");
  const [postId, setPostId] = useState(""); // "" = not linked to any post

  function submit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      alert("Please enter an amount greater than 0.");
      return;
    }

    // If the user linked a post, store a snapshot of it on the expense so the
    // bias engine can use the post's tag/text later.
    const linkedPost = posts.find((p) => p.id === postId);

    onAdd({
      id: "exp-" + Date.now(),
      amount: value,
      category,
      note: note.trim(),
      createdAt: new Date().toISOString(),
      linkedPost: linkedPost
        ? { id: linkedPost.id, author: linkedPost.author, text: linkedPost.text, tag: linkedPost.tag }
        : null,
    });

    setAmount("");
    setNote("");
    setPostId("");
  }

  // ---- totals + chart data ------------------------------------------------
  const total = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const byCategory = {};
  for (const e of expenses) {
    byCategory[e.category] = (byCategory[e.category] || 0) + Number(e.amount || 0);
  }
  const chartRows = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const maxCat = chartRows.length ? chartRows[0][1] : 0;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>🧾 Expense tracker</h2>
        <span className="total-pill">Total: ₹{total.toLocaleString("en-IN")}</span>
      </div>

      <form className="expense-form" onSubmit={submit}>
        <div className="row">
          <label>
            Amount (₹)
            <input
              type="number"
              min="1"
              placeholder="499"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Note (optional) — tip: mention "saw a reel" or "was ₹999 now ₹499" to help bias detection
          <input
            type="text"
            placeholder="e.g. saw a reel, was ₹999 now ₹499"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <label>
          Triggered by a feed post? (optional)
          <select value={postId} onChange={(e) => setPostId(e.target.value)}>
            <option value="">— not linked to a post —</option>
            {posts.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.label}] {p.author}: {p.text.slice(0, 50)}…
              </option>
            ))}
          </select>
        </label>

        <button className="btn btn-primary" type="submit">
          + Add expense
        </button>
      </form>

      {/* simple bar chart by category */}
      {chartRows.length > 0 && (
        <div className="chart">
          <h3>Spending by category</h3>
          {chartRows.map(([cat, amt]) => (
            <div className="chart-row" key={cat}>
              <span className="chart-label">{cat}</span>
              <div className="chart-bar-track">
                <div
                  className="chart-bar"
                  style={{ width: maxCat ? `${(amt / maxCat) * 100}%` : "0%" }}
                />
              </div>
              <span className="chart-amt">₹{amt.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}

      {/* list of expenses */}
      <ul className="expense-list">
        {expenses
          .slice()
          .reverse()
          .map((e) => (
            <li key={e.id} className="expense-item">
              <div>
                <strong>₹{Number(e.amount).toLocaleString("en-IN")}</strong> · {e.category}
                {e.note && <span className="muted"> — {e.note}</span>}
                {e.linkedPost && (
                  <div className="small muted">
                    🔗 linked to a <strong>{e.linkedPost.tag}</strong> post by {e.linkedPost.author}
                  </div>
                )}
              </div>
              <button className="btn btn-ghost small" onClick={() => onDelete(e.id)}>
                delete
              </button>
            </li>
          ))}
        {expenses.length === 0 && <p className="muted">No expenses yet. Add one above.</p>}
      </ul>
    </section>
  );
}
