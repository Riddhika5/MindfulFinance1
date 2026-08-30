# Deploying MindfulFinance v2

Version 2 replaces the questionnaire with validated instruments and adds the
feed experiment, the results dashboard and the monthly check-up. This page is
the update path. First-time setup is in the appendix at the bottom.

**Read the "Before you collect real data" checklist at the end. Two items on it
will cost you your dataset if you skip them.**

> **On Windows?** [DEPLOY-POWERSHELL.md](DEPLOY-POWERSHELL.md) is the same
> process written as copy-paste PowerShell commands, including the script
> execution-policy error that trips up most Windows setups.

---

## Step 1 — Get the code onto your machine

Pick whichever matches your setup.

### If you have Git on the command line

```bash
cd path/to/MindfulFinance1
git checkout -b validated-instruments-v2
git am /path/to/mindfulfinance-v2.patch
```

`git am` replays all four commits with their messages. If it complains about a
conflict, run `git am --abort` and use the zip method instead.

### If you use GitHub Desktop (no command line)

1. Unzip `mindfulfinance-v2-files.zip`. Inside are `client/`, `server/`,
   `RESEARCH.md` and `package.json`.
2. Copy them into your project folder, **overwriting** what is there.
3. GitHub Desktop will show the changed files. Write a summary, click
   **Commit to main**, then **Push origin**.

Either way, nothing outside `client/src`, `server/` and the two docs changes.

---

## Step 2 — Test it locally before it goes public

```bash
npm run setup     # once
npm run dev
```

Open http://localhost:5173 and click through the whole assessment once. You are
checking three things:

- The progress bar reaches 100% and the results dashboard appears.
- The bias profile shows **ten** constructs with HIGH / MODERATE / LOW badges.
- **Download your report** produces an HTML file that opens in a browser.

If the assessment loads but the feed shows no posts, the backend is not running.
`npm run dev` starts both; `npm run client` alone starts only the front end.

---

## Step 3 — Push, and let Render rebuild

Render watches your GitHub branch and redeploys on push. If you pushed to a new
branch rather than `main`, point Render at it: **Settings → Build & Deploy →
Branch**.

Confirm the commands are:

| Field | Value |
|---|---|
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

Watch the deploy log. A successful build ends with `✓ built in …` followed by
`[server] serving built client from /client/dist`.

> **If the build fails with `vite: not found`** — you are on an older
> `package.json`. v2 fixes this: the build script now passes `--include=dev`, so
> the build tools install even when Render sets `NODE_ENV=production`. Make sure
> the new `package.json` is in your push.

---

## Step 4 — Environment variables

Render → your service → **Environment**.

**Infrastructure**

| Key | Value | Why |
|---|---|---|
| `MONGODB_URI` | your Atlas connection string | **Without this you will lose every response.** See below. |
| `MONGODB_DB` | `mindfulfinance` | Optional; defaults to `mindfulmoney` |
| `RESEARCHER_KEY` | a long random string you invent | Unlocks the data export. Without it, export is disabled entirely. |

**Research governance — these lift pilot mode**

Until all seven are set, the app shows a pilot-mode banner and refuses to accept
responses. Setting them here takes effect immediately: no code change, no
rebuild.

| Key | Example |
|---|---|
| `MF_INSTITUTION` | `Department of Commerce, University of X` |
| `MF_RESEARCHER` | your name |
| `MF_RESEARCHER_EMAIL` | an address you actually monitor |
| `MF_SUPERVISOR` | supervisor's name and title |
| `MF_SUPERVISOR_EMAIL` | optional |
| `MF_ETHICS_COMMITTEE` | `Institutional Ethics Committee, University of X` |
| `MF_ETHICS_REF` | your approval reference |
| `MF_ETHICS_CONTACT` | Member Secretary email — a route for questions about participant rights that does not go through you |

`MF_RETENTION_YEARS` is optional and defaults to 5.

**Do not invent an approval reference to clear the banner.** The guard exists to
stop data being collected under placeholder consent, and a fabricated reference
is research misconduct. Get approval first — `node tools/build-ethics-pack.mjs`
generates the submission documents.

### Check what is still missing

```
https://YOUR-APP.onrender.com/api/readiness
```

Lists exactly which variables are unset, and warns if storage is ephemeral or
the export is disabled. It reports variable *names*, never their values, so it
is safe to open in a browser.

### Why MONGODB_URI is not optional

If it is unset, the app falls back to writing JSON files inside the container.
Render's filesystem is **ephemeral** — it is wiped on every redeploy, restart,
and free-tier sleep. Your participants' responses would disappear silently, and
you would not find out until you went looking for them.

Confirm it is working: the deploy log must contain

```
MONGODB_URI exists? true
[store] connected to MongoDB ✅
```

If it says `false`, the variable is not reaching the app. Check for a typo in
the key name and that you clicked **Save Changes**.

Setting up Atlas for the first time is in the appendix, Step 3.

---

## Step 5 — Verify the live site

Open your Render URL and check each of these:

1. **Landing page** — headline reads "Know your financial decision style".
2. **Start assessment → Learn more** — both buttons work.
3. **Consent** — Continue stays disabled until all three boxes are ticked.
4. **Eligibility** — answering "Under 18" blocks you from continuing.
5. **Bias screens** — four screens, 8 / 12 / 8 / 6 items.
6. **The feed** — ten posts, each with Would you invest? and Why?
7. **Results** — ten bias bars, five score tiles, report downloads.
8. **Contribute my answers** — shows "Thank you", not an error.

Then confirm the response actually landed:

```
https://YOUR-APP.onrender.com/api/export/wide.csv?key=YOUR_RESEARCHER_KEY
```

One row per participant. If you get `401`, the key does not match. If `503`,
`RESEARCHER_KEY` is not set on Render.

---

## Step 6 — Getting your data out

Two exports, both requiring your key:

| URL | Contents | Use for |
|---|---|---|
| `/api/export/data.xlsx?key=…` | **Multi-sheet Excel workbook** — data, codebook, value labels, scores, feed trials, meta | **Start here.** SPSS, R, JASP, SmartPLS |
| `/api/export/wide.csv?key=…` | One row per participant, one column per item | Plain CSV if you prefer it |
| `/api/export/feed.csv?key=…` | One row per feed trial | The experiment — multilevel models |

The Excel workbook is the one to use. It carries a full codebook and value
labels alongside the data, uses SPSS-safe variable names, and writes numeric
responses as numbers so SPSS treats them as scale variables rather than strings.

The wide file contains every raw item response, so if a scoring rule ever needs
correcting you can re-score without re-collecting.

**Keep the key private.** Anyone with the URL and key can download your whole
dataset. Do not put it in the participant link, an email, or a WhatsApp group.

---

## Before you collect real data — checklist

- [ ] `MONGODB_URI` set, and the log says `connected to MongoDB ✅`
- [ ] `RESEARCHER_KEY` set, and the export URL returns rows
- [ ] **Paste the official CFPB Appendix A lookup tables into `CFPB_LOOKUP` in
      `client/src/lib/scoring.js`.** Until you do, the app stores the raw total
      (which is what analysis should use anyway) and labels the 0–100 figure as
      provisional. The raw total is never lost, so this can be done later — but
      do it before you report any well-being score.
- [ ] Ethics approval reference added to the consent screen in
      `client/src/lib/flow.js` (the `CONSENT` block), with your supervisor's
      and institution's contact details
- [ ] Complete one full run yourself on the live URL and confirm the row appears
      in the export
- [ ] Decide about cold starts — see below

### Cold starts will cost you completions

Render's free tier sleeps after about 15 minutes of inactivity, and the next
visitor waits roughly 50 seconds on a blank screen. For a study recruited by
sharing a link, that is a meaningful number of people who close the tab before
seeing anything.

Two ways to handle it: upgrade to the paid Starter instance for the recruitment
period, or use a free uptime monitor (UptimeRobot, cron-job.org) to request
`/api/health` every 10 minutes so the service stays awake. The second is free
and works well enough for a study.

---

## If something breaks

| Symptom | Likely cause |
|---|---|
| Build fails, `vite: not found` | Old `package.json` — push the v2 one |
| Site loads but is the old version | Render deployed a different branch, or your browser cached it. Hard-refresh, then check Settings → Branch |
| Blank white page | Open the browser console. A JS error here usually means a partial file copy — re-copy `client/src` in full |
| Feed shows no posts | Backend not running, or `/api` requests failing. Check the Render log |
| Export returns 503 | `RESEARCHER_KEY` not set |
| Export returns 401 | Key in the URL does not match the one on Render |
| Responses vanish after a redeploy | `MONGODB_URI` was not set — the data was in ephemeral storage. It is not recoverable |

---

# Appendix — first-time setup (already done)

*Kept for reference. If Render and MongoDB are already connected, you do not need this section.*

## Sharing MindfulFinance with other people

There are two ways. Start with Option 1 to test with real people today; use
Option 2 when you want a public link anyone can open from anywhere.

---

## Option 1 — Share on your WiFi (works right now, free, no signup)

Best for a classroom/demo where people are in the same building.

1. Double-click **SHARE-ON-WIFI** (on your Desktop). It builds the app and
   starts it on **one** address (port 4000).
2. On a second PowerShell window, type `ipconfig` and press Enter. Find the
   **IPv4 Address** (looks like `192.168.1.7`).
3. Tell others (on the same WiFi) to open in their phone/laptop browser:
   `http://192.168.1.7:4000`  (use YOUR number).
4. Everyone's "Share my results" submissions land in the **🌍 Community** tab,
   so you can see which bias is most common and whether the tips helped.

> Note: this only works while your PC is on and the window is open, and only
> for people on the same WiFi. For a permanent public link, use Option 2.

---

## Option 2 — Put it on the internet with Render (free tier)

This gives a public link (e.g. `https://mindfulmoney.onrender.com`) anyone can
open from anywhere. You'll need two free accounts: **GitHub** and **Render**.

### Step 1 — Put the code on GitHub (easiest: GitHub Desktop app)
You don't have git installed, so use the **GitHub Desktop** app — it's a
point-and-click way to do this with no command line.

1. Create a free account at https://github.com (click **Sign up**).
2. Download and install **GitHub Desktop** from https://desktop.github.com .
   Open it and **sign in** with the account from step 1.
3. In GitHub Desktop: **File → Add local repository** → **Choose…** →
   select the folder `C:\Users\Hp\behavioral-finance-app` → it will say
   "this directory does not appear to be a git repository" → click
   **create a repository** → **Create repository**.
4. Click the big **Publish repository** button at the top.
   - Name: `mindfulfinance`
   - **Untick** "Keep this code private" (public is simplest for free hosting),
     then **Publish repository**.

Your code is now on GitHub. 🎉 (GitHub Desktop already ignores `node_modules`
and your local data because the project has a `.gitignore`.)

> Prefer the command line instead? Install Git from https://git-scm.com/download/win,
> reopen PowerShell, then run: `cd C:\Users\Hp\behavioral-finance-app`,
> `git init`, `git add .`, `git commit -m "MindfulFinance app"`, `git branch -M main`,
> `git remote add origin https://github.com/YOUR-USERNAME/mindfulfinance.git`,
> `git push -u origin main`.

### Step 2 — Deploy on Render
1. Sign up at https://render.com (you can log in with GitHub).
2. Click **New +** → **Web Service** → connect your `mindfulfinance` repo.
3. Fill in:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Click **Create Web Service**. Wait a few minutes — Render gives you a public
   URL. Share that link with anyone. 🎉

### Step 3 — Add a free permanent database (MongoDB Atlas) — IMPORTANT
On Render's **free** tier the server's files reset when it restarts, so without
a database your survey/community responses get **wiped**. The app already
supports MongoDB Atlas (free forever) — you just create one and give Render the
connection string. Responses then persist permanently.

1. Sign up at https://www.mongodb.com/cloud/atlas (free).
2. **Build a Database** → choose the **M0 FREE** tier → **Create**.
3. **Database Access** (left menu) → **Add New Database User**. Pick a username
   and password (write them down). Give it "Read and write to any database".
4. **Network Access** (left menu) → **Add IP Address** → **Allow access from
   anywhere** (`0.0.0.0/0`) so Render can connect → Confirm.
5. **Database** → **Connect** → **Drivers** → copy the connection string. It
   looks like:
   `mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Replace `USERNAME` and `PASSWORD` with the ones you made in step 3.
6. In **Render** → your web service → **Environment** → **Add Environment
   Variable**:
   - Key: `MONGODB_URI`  Value: the connection string from step 5
   - (optional) Key: `MONGODB_DB`  Value: `mindfulmoney`
7. Render redeploys automatically. Done — data is now permanent. ✅

> The app prints `[store] connected to MongoDB ✅` in the Render logs when it's
> working. If `MONGODB_URI` is not set, it silently uses local files instead
> (which is exactly what you want when running on your own PC).

---

## Which should you pick?
- Just demoing to a class/friends in the room → **Option 1** (do it now, no accounts).
- Collecting real responses from people over days/weeks → **Option 2 with Step 3**
  (Render + MongoDB Atlas) so nothing is ever lost.
