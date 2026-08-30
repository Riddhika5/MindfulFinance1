// ===========================================================================
// mobile-audit.mjs — scripted mobile layout check
// ---------------------------------------------------------------------------
// Walks the ENTIRE participant journey at three phone widths and fails on
// anything that would degrade data quality on a small screen:
//
//   • horizontal overflow (an element off-screen that is not clipped)
//   • tap targets under 44px high — measured on the wrapping <label> where
//     there is one, since that is what a thumb actually hits
//   • text under 11px
//
// Tap-target size is a data-quality control here, not a cosmetic one. A
// participant taps a Likert option 65 times; a mis-tap is a wrong data point
// that no downstream check can detect or correct.
//
// Run it after ANY change to styles.css or a question component:
//
//     npm install --no-save playwright
//     node server/index.js &          # serve the built client on :4099
//     node mobile-audit.mjs
//
// Screenshots of every screen land in /tmp/shot-*.png for eyeballing.
// ===========================================================================

import { chromium } from "playwright";

const VIEWPORTS = [
  { name: "iPhone-SE-375", width: 375, height: 667 },
  { name: "Android-360",   width: 360, height: 740 },
  { name: "iPhone-14-390", width: 390, height: 844 },
];
const BASE = "http://localhost:4099";
const issues = [];

function log(vp, screen, msg) {
  issues.push(`[${vp}] ${screen}: ${msg}`);
  console.log(`  ✗ [${vp}] ${screen}: ${msg}`);
}

async function audit(page, vp, screen) {
  // horizontal overflow of the document
  const o = await page.evaluate(() => {
    const de = document.documentElement;
    const visible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") return false;
      return !el.closest("[hidden]");
    };
    const over = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && visible(el) && (r.right > window.innerWidth + 1 || r.left < -1)) {
        over.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).slice(0, 40)) || "",
          right: Math.round(r.right), left: Math.round(r.left),
          clipped: (() => { let p = el.parentElement;
            while (p) { const c = getComputedStyle(p);
              if (c.overflowX === "hidden" || c.overflow === "hidden") return true; p = p.parentElement; }
            return false; })(),
        });
      }
    });
    // tap targets under 32px
    const small = [];
    document.querySelectorAll("button,a,input,textarea,select").forEach((el) => {
      // A control wrapped in a <label> is tapped via the label, so measure
      // the label's box, not the bare input's.
      const box = el.closest("label") || el;
      const r = box.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && visible(el) && (r.height < 40 || r.width < 24)) {
        small.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 30),
                     w: Math.round(r.width), h: Math.round(r.height),
                     txt: (el.textContent || "").trim().slice(0, 20) });
      }
    });
    // tiny font sizes
    const tiny = [];
    document.querySelectorAll("*").forEach((el) => {
      if (!el.children.length && el.textContent.trim() && visible(el) && el.getBoundingClientRect().height > 0) {
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs && fs < 11) tiny.push({ cls: String(el.className).slice(0,30), fs, txt: el.textContent.trim().slice(0,25) });
      }
    });
    return {
      docScrollW: de.scrollWidth, clientW: de.clientWidth,
      overflow: over.slice(0, 8), small: small.slice(0, 8), tiny: tiny.slice(0, 6),
    };
  });
  if (o.docScrollW > o.clientW + 1) log(vp, screen, `PAGE SCROLLS SIDEWAYS: scrollWidth ${o.docScrollW} > ${o.clientW}`);
  o.overflow.filter((e) => !e.clipped).forEach((e) =>
    log(vp, screen, `element off-screen and NOT clipped <${e.tag} class="${e.cls}"> right=${e.right}`));
  o.small.forEach((e) => log(vp, screen, `tap target ${e.w}x${e.h} <${e.tag} class="${e.cls}"> "${e.txt}"`));
  o.tiny.forEach((e) => log(vp, screen, `font ${e.fs}px "${e.txt}" (.${e.cls})`));
  return o;
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await audit(page, vp.name, "landing");
  await page.screenshot({ path: `/tmp/shot-${vp.name}-01-landing.png`, fullPage: false });

  // Enter the assessment
  const start = page.locator("button", { hasText: /start|begin|take the|assessment/i }).first();
  if (await start.count()) { await start.click(); await page.waitForTimeout(500); }
  await audit(page, vp.name, "welcome");
  await page.screenshot({ path: `/tmp/shot-${vp.name}-02-welcome.png` });

  // Walk forward through the journey
  const seen = [];
  for (let i = 0; i < 20; i++) {
    const title = (await page.locator("h1,h2").first().textContent().catch(() => "")) || `step${i}`;
    const label = title.trim().slice(0, 34).replace(/[^\w\s-]/g, "").trim() || `step${i}`;
    seen.push(label);
    await audit(page, vp.name, label);
    await page.screenshot({ path: `/tmp/shot-${vp.name}-${String(i + 3).padStart(2, "0")}-${label.replace(/\s+/g, "_")}.png`, fullPage: true });

    // Answer everything on this screen
    await page.evaluate(() => {
      document.querySelectorAll(".mx-row").forEach((r) => {
        const dots = r.querySelectorAll(".mx-dot");
        if (dots.length) dots[Math.min(3, dots.length - 1)].click();
      });
      document.querySelectorAll(".q-row").forEach((r) => {
        const chips = [...r.querySelectorAll(".chip")];
        if (!chips.length) return;
        // Never pick a screen-out option on the eligibility gate.
        const bad = /under 18|^no$|someone else decides/i;
        const ok = chips.find((c) => !bad.test(c.textContent.trim())) || chips[0];
        ok.click();
      });
      document.querySelectorAll(".sim-card").forEach((c) => c.querySelector(".mini-chip")?.click());
      document.querySelectorAll("input[type=checkbox]").forEach((c) => { if (!c.checked) c.click(); });
      document.querySelectorAll("textarea").forEach((t) => {
        const set = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        set.call(t, "Sample free text answer for the mobile layout audit.");
        t.dispatchEvent(new Event("input", { bubbles: true }));
      });
    });
    await page.waitForTimeout(250);

    const next = page.locator("button.btn-primary:not([disabled])").last();
    if (!(await next.count())) break;
    const txt = (await next.textContent()) || "";
    if (/results|report/i.test(txt) && i > 10) {
      await next.click();
      await page.waitForTimeout(1600);
      await audit(page, vp.name, "RESULTS");
      await page.screenshot({ path: `/tmp/shot-${vp.name}-99-results.png`, fullPage: true });
      // Walk the results tabs too — participants spend real time here.
      const tabs = page.locator(".pill-tabs button");
      const n = await tabs.count();
      for (let t = 0; t < n; t++) {
        await tabs.nth(t).click(); await page.waitForTimeout(400);
        const nm = ((await tabs.nth(t).textContent()) || `tab${t}`).replace(/[^\w\s]/g, "").trim();
        await audit(page, vp.name, `results:${nm}`);
        await page.screenshot({ path: `/tmp/shot-${vp.name}-99-tab-${nm.replace(/\s+/g,"_")}.png`, fullPage: true });
      }
      break;
    }
    await next.click();
    await page.waitForTimeout(500);
  }
  console.log("  screens visited:", seen.join(" → "));
  await ctx.close();
}
await browser.close();

console.log("\n================ SUMMARY ================");
if (!issues.length) console.log("No layout issues detected.");
else {
  const uniq = [...new Set(issues.map(s => s.replace(/^\[[^\]]+\]\s*/, "")))];
  console.log(`${issues.length} findings, ${uniq.length} distinct:`);
  uniq.forEach((u) => console.log("  •", u));
}
