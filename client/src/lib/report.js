// ===========================================================================
// report.js — the downloadable personal report
// ---------------------------------------------------------------------------
// Produces a self-contained HTML file the participant can keep, print, or save
// as PDF from their browser. Contains: social media influence, behavioural bias
// profile, mindfulness, financial well-being, practical tips, and the weekly
// challenge — plus the instrument list, so the report is self-documenting.
// ===========================================================================

import { SOURCES } from "./instruments.js";
import { band } from "./scoring.js";
import { MODULES, CHALLENGES } from "./learn.js";

const r2 = (v) => (typeof v === "number" ? Number(v.toFixed(2)) : v);

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

function barBlocks(pct, n = 14) {
  if (pct === null || pct === undefined) return "░".repeat(n);
  const filled = Math.round((pct / 100) * n);
  return "█".repeat(filled) + "░".repeat(n - filled);
}

export function buildReportHtml(results, session, insights) {
  const sorted = Object.values(results.biases.constructs).sort((a, b) => (b.pomp ?? 0) - (a.pomp ?? 0));
  const topKey = sorted[0]?.id;
  const date = new Date(results.completedAt).toLocaleDateString(undefined, {
    day: "numeric", month: "long", year: "numeric",
  });

  const tips = sorted.slice(0, 3).map((c) => MODULES[c.id]).filter(Boolean);

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>MindfulFinance — Personal Behaviour Report</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Roboto, system-ui, sans-serif;
         color: #0f172a; line-height: 1.6; max-width: 760px; margin: 0 auto; padding: 34px 24px 60px; }
  h1 { font-size: 27px; letter-spacing: -0.02em; margin: 0 0 4px; }
  h2 { font-size: 17px; margin: 34px 0 12px; padding-bottom: 7px; border-bottom: 2px solid #e5e7eb;
       letter-spacing: -0.01em; }
  h3 { font-size: 14px; margin: 18px 0 5px; }
  p  { margin: 0 0 11px; font-size: 14px; }
  .sub { color: #64748b; font-size: 13px; margin-bottom: 22px; }
  .tiles { display: flex; flex-wrap: wrap; gap: 10px; margin: 16px 0 6px; }
  .tile { flex: 1 1 128px; border: 1px solid #e5e7eb; border-radius: 12px; padding: 13px; text-align: center; }
  .tile .v { font-size: 23px; font-weight: 800; letter-spacing: -0.02em; }
  .tile .l { font-size: 10.5px; color: #64748b; line-height: 1.35; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 7px 6px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  td.bar { font-family: ui-monospace, "SF Mono", Menlo, monospace; letter-spacing: -1px; white-space: nowrap; }
  td.name { font-weight: 600; width: 34%; }
  td.band { text-align: right; font-size: 11.5px; white-space: nowrap; }
  .high { color: #b91c1c; } .mid { color: #b45309; } .low { color: #047857; } .muted { color: #94a3b8; }
  .callout { background: #1e1b4b; color: #e0e7ff; border-radius: 13px; padding: 17px 20px; margin: 18px 0; }
  .callout .tag { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em;
                  color: #a5b4fc; font-weight: 700; margin-bottom: 6px; }
  .callout p { margin: 0; font-size: 14.5px; }
  .tip { border-left: 3px solid #6366f1; padding: 2px 0 2px 14px; margin: 0 0 16px; }
  .tip .do { background: #f0fdf4; border-radius: 7px; padding: 8px 11px; font-size: 13.5px; margin-top: 6px; }
  .cite { font-size: 11px; color: #94a3b8; line-height: 1.5; }
  .foot { margin-top: 34px; padding-top: 14px; border-top: 1px solid #e5e7eb;
          font-size: 11.5px; color: #64748b; }
  .print { position: fixed; top: 14px; right: 14px; background: #6366f1; color: #fff; border: 0;
           border-radius: 9px; padding: 9px 15px; font: inherit; font-size: 13px; font-weight: 600; cursor: pointer; }
  @media print { .print { display: none; } body { padding: 0; } }
</style></head><body>
<button class="print" onclick="window.print()">Save as PDF</button>

<h1>Your Financial Behaviour Report</h1>
<p class="sub">MindfulFinance · ${esc(date)} · participant code ${esc(results.participantId)}${
    session.wave > 1 ? ` · check-up #${session.wave}` : ""
  }</p>

<h2>Your scores at a glance</h2>
<div class="tiles">
  <div class="tile"><div class="v">${r2(results.smfi.score) ?? "—"}</div><div class="l">Social media influence<br>of 5</div></div>
  <div class="tile"><div class="v">${r2(results.biases.index) ?? "—"}</div><div class="l">Behavioural bias index<br>of 100</div></div>
  ${results.maas?.score != null
    ? `<div class="tile"><div class="v">${r2(results.maas.score)}</div><div class="l">Mindfulness (MAAS)<br>of 6</div></div>`
    : ""}
  <div class="tile"><div class="v">${results.fwb?.score != null ? r2(results.fwb.score) : results.cfpb?.raw ?? "—"}</div><div class="l">Financial well-being<br>of ${results.fwb?.score != null ? 5 : results.cfpb?.max ?? "—"}</div></div>
  <div class="tile"><div class="v">${results.literacy?.skipped ? "—" : `${results.literacy.correct}/${results.literacy.total}`}</div><div class="l">Financial literacy${results.literacy?.skipped ? "<br>(skipped)" : ""}</div></div>
</div>

<h2>Behavioural bias profile</h2>
<table>${sorted
    .map((c) => {
      const b = band(c.pomp);
      const label = b.tone === "high" ? "High" : b.tone === "mid" ? "Moderate" : b.tone === "low" ? "Low" : "—";
      return `<tr><td class="name">${esc(c.name)}</td><td class="bar ${esc(b.tone)}">${barBlocks(c.pomp)}</td><td class="band ${esc(b.tone)}">${label}</td></tr>`;
    })
    .join("")}</table>
<p class="cite">Scores use POMP normalisation (percentage of maximum possible) so scales with different
lengths are comparable. Higher does not mean "bad" — it shows where attention buys you the most.</p>

<h2>What this suggests</h2>
${insights.map((l) => `<p>${esc(l)}</p>`).join("")}

<div class="callout">
  <div class="tag">This week's challenge</div>
  <p>${esc(CHALLENGES[topKey] || CHALLENGES.default)}</p>
</div>

<h2>Practical tips for your profile</h2>
${tips
    .map(
      (m) => `<div class="tip"><h3>${esc(m.title)}</h3>
    <p>${esc(m.what)}</p>
    <div class="do"><strong>Try this:</strong> ${esc(m.do)}</div>
    <p class="cite">Based on: ${esc(m.citation)}</p></div>`
    )
    .join("")}

${
  results.knowledgeCalibration
    ? `<h2>Confidence versus knowledge</h2>
<p>You rated your own financial understanding at <strong>${results.knowledgeCalibration.subjective}/100</strong>,
and the knowledge questions came out at <strong>${results.knowledgeCalibration.objective}/100</strong> —
a gap of <strong>${results.knowledgeCalibration.gap > 0 ? "+" : ""}${results.knowledgeCalibration.gap}</strong>.
${
  results.knowledgeCalibration.direction === "overestimates"
    ? "A positive gap of this size is the illusion of knowledge: the sense of understanding running ahead of the understanding itself. It is worth knowing about precisely because it cannot be felt from the inside."
    : results.knowledgeCalibration.direction === "underestimates"
      ? "You answered better than your own confidence suggested. Under-confidence has its own cost — mainly staying out of decisions you could handle."
      : "Your confidence and your demonstrated knowledge are reasonably well calibrated, which is less common than you might expect."
}</p>`
    : ""
}

${
  results.feed
    ? `<h2>In the simulated feed</h2>
<p>You said you would act on <strong>${Math.round(results.feed.actionRate * 100)}%</strong> of the posts you
saw, and opened the checking panel on <strong>${Math.round(results.feed.verificationRate * 100)}%</strong>.
Your median time per post was ${Math.round((results.feed.medianDwellMs || 0) / 1000)} seconds.</p>`
    : ""
}

<h2>How this was measured</h2>
<p class="cite">${Object.values(SOURCES)
    .filter((s) => s.instrument)
    .map((s) => `<strong>${esc(s.instrument)}</strong><br>${esc(s.citation)}`)
    .join("<br><br>")}</p>

<p class="foot">This report describes patterns in your own answers. It is for education and
self-reflection: it is not a clinical or diagnostic assessment, and it is not financial advice.
Your responses are anonymous — this report is linked only to the participant code above.</p>
</body></html>`;
}

export function downloadReport(results, session, insights) {
  const html = buildReportHtml(results, session, insights);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MindfulFinance-report-${results.participantId}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
