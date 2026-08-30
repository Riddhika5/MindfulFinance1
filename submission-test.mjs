// ===========================================================================
// submission-test.mjs — does a completed response actually reach the dataset?
// ---------------------------------------------------------------------------
// Walks the whole assessment with the submit endpoint FORCED TO FAIL, then
// reloads with it working and checks the response arrives anyway.
//
// This is the failure that matters most in a live study: a participant
// finishes, presses the button, the request fails, and their ten minutes are
// gone. Run it after any change to the submit path.
//
//     npm install --no-save playwright
//     node server/index.js &
//     node submission-test.mjs
// ===========================================================================

import { chromium } from "playwright";
const P = process.argv[2] || "4099";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const calls = [];
p.on("response", async (r) => {
  if (r.url().includes("/api/response")) {
    let t = ""; try { t = (await r.text()).slice(0, 110); } catch {}
    calls.push(`${r.status()} :: ${t}`);
  }
});

// Fail every submit attempt for the first run.
await p.route("**/api/response", (route) => route.abort("connectionfailed"));

await p.goto(`http://localhost:${P}`, { waitUntil: "networkidle" });
await p.waitForTimeout(400);
const s = p.locator("button", { hasText: /start|begin|take the|assessment/i }).first();
if (await s.count()) { await s.click(); await p.waitForTimeout(300); }
for (let i = 0; i < 22; i++) {
  await p.evaluate(() => {
    document.querySelectorAll(".mx-row").forEach((r) => {
      const d = r.querySelectorAll(".mx-dot"); if (d.length) d[2].click();
    });
    document.querySelectorAll(".q-row").forEach((r) => {
      const c = [...r.querySelectorAll(".chip")]; if (!c.length) return;
      const bad = /under 18|^no$|someone else decides/i;
      (c.find((x) => !bad.test(x.textContent.trim())) || c[0]).click();
    });
    document.querySelectorAll(".sim-card").forEach((c) => c.querySelector(".mini-chip")?.click());
    document.querySelectorAll("input[type=checkbox]").forEach((c) => { if (!c.checked) c.click(); });
  });
  await p.waitForTimeout(180);
  const nx = p.locator("button.btn-primary:not([disabled])").last();
  if (!(await nx.count())) break;
  const t = ((await nx.textContent()) || "").trim();
  await nx.click(); await p.waitForTimeout(420);
  if (/results/i.test(t)) break;
}
await p.waitForTimeout(700);
const btn = p.locator("button", { hasText: /Contribute my answers/i }).first();
await btn.scrollIntoViewIfNeeded(); await btn.click(); await p.waitForTimeout(2000);
const failState = await p.evaluate(() => ({
  err: document.querySelector(".submit-error p")?.textContent?.trim().slice(0, 130) || null,
  retry: !!document.querySelector(".submit-error .btn"),
  queued: !!localStorage.getItem("mf_pending_submission"),
}));
console.log("1) SUBMIT WHILE OFFLINE →", JSON.stringify(failState, null, 1));

// Server reachable again; simply reload the app.
await p.unroute("**/api/response");
await p.goto(`http://localhost:${P}`, { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const rec = await p.evaluate(() => ({
  queued: !!localStorage.getItem("mf_pending_submission"),
  submitted: localStorage.getItem("mf_submitted"),
}));
console.log("2) AFTER RELOAD → queue cleared:", !rec.queued, "| recorded as:", rec.submitted);
console.log("\n--- /api/response ---");
calls.forEach((c) => console.log(c));
await b.close();
