# Going live, and collecting data

Two separate things. Deploying is one push. Collecting data safely needs
four settings on Render, and one of them will silently destroy your data
if you skip it.

---

## Step 1 — Push the code (this is the deploy)

Render is already connected to `github.com/Riddhika5/MindfulFinance1` and
redeploys automatically on every push to `main`. You do not log in to
Render to deploy; you push, and it builds.

```powershell
cd "C:\Users\Hp\Desktop\MindfulFinance-upload - Copy"
npm run setup
npm run build
git add -A
git commit -m "Instrument v3.4"
git push
```

Then watch the build at **dashboard.render.com → your service → Events**.
It takes 2–4 minutes. When it says *Live*, open
https://mindfulfinance1-1.onrender.com/ and check the consent page shows
your name and Prof. Manju Singh's contact — no pilot banner.

**I cannot do this push for you.** The token in my environment is
read-only for your repository; I have verified that twice. The code is
ready and committed locally — the push has to come from your machine.

---

## Step 2 — Set four environment variables on Render

**dashboard.render.com → your service → Environment → Add Environment
Variable.** Adding a variable triggers a redeploy, which is fine.

### MONGODB_URI — do this before anyone answers

Without it, responses are written to the container's own disk. Render
wipes that disk on **every redeploy, every restart, and every free-tier
sleep**. You will not get an error. The app will look like it is working
and the data will be gone.

1. Go to mongodb.com/cloud/atlas and create a free account
2. Create a free **M0** cluster (choose a region near India, e.g. Mumbai)
3. **Database Access** → Add New Database User → note the username and
   password
4. **Network Access** → Add IP Address → **Allow Access from Anywhere**
   (0.0.0.0/0). Render's outbound IPs are not fixed on the free plan.
5. **Database** → Connect → Drivers → copy the connection string. It
   looks like:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `PASSWORD` with your real password and paste the whole string
   as `MONGODB_URI` on Render.

**Before you paste it into Render, test it.** There is a checker in the
project that tells you exactly what is wrong instead of leaving you to guess:

```powershell
node check-mongo.mjs "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/"
```

It checks the string, then the connection, then whether the user can actually
**write** — a read-only user connects perfectly and then loses every response,
which no other check catches. It writes one document to a scratch collection
and deletes it again; it never touches your `responses` data.

The two mistakes it exists to catch:

- **A password with punctuation in it.** `@ / ? # % :` and others must be
  percent-encoded inside a connection string. An unescaped `@` silently
  splits the string in the wrong place. The checker names each character and
  gives you the replacement. Easiest fix: reset the Atlas password to letters
  and numbers only.
- **The IP allowlist.** If it times out, Network Access is almost always the
  reason. It must be `0.0.0.0/0` — Render's outbound addresses are not fixed
  on the free plan, so a narrower rule will fail intermittently, which is
  worse than failing outright.

Then verify on the server: open
`https://mindfulfinance1-1.onrender.com/api/readiness`

You want **both** of these:

```json
"storage": "mongodb",
"storageOk": true
```

This endpoint now actually pings the database rather than just checking that
the variable exists, so it catches the two mistakes that otherwise pass
silently — a wrong password, and an Atlas Network Access list that does not
include 0.0.0.0/0. If either is wrong you will see:

```json
"storage": "mongodb (UNREACHABLE)",
"storageOk": false
```

**Do not recruit until `storageOk` is true.** A response submitted while the
database is unreachable is still saved — it goes to the container filesystem
so the participant does not lose it — but that file is wiped on the next
restart. It is a stay of execution, not a fix.

### RESEARCHER_KEY — your download password

Invent a long random string. It protects the Excel export and the quota
report. **Never put it in a participant link, an email, or a WhatsApp
message** — anyone holding it can download the whole dataset.

### MONGODB_DB — optional

Defaults to `mindfulmoney`. Set it only if you want a different database
name.

---

## Step 3 — Check you are ready

Open these two URLs before recruiting:

| URL | What you need to see |
|---|---|
| `/api/readiness` | `"ready": true`, `"storage": "mongodb"`, `"storageOk": true` |
| `/api/quota-report?key=YOUR_KEY` | the quota table, all zeros |

The readiness call takes up to about eight seconds when the database is
unreachable — that is the connection timing out, and it is the answer.

---

## Step 4 — Recruit

Share the plain link. Nothing else is needed — no login, no codes to
hand out:

**https://mindfulfinance1-1.onrender.com/**

The app screens people itself: under 18, non-users of social media, and
people who make no financial decisions are turned away before any
substantive question. Once a quota cell fills, people in that cell are
thanked and stopped automatically.

**One warning about the free Render plan.** The service sleeps after 15
minutes of no traffic, and the first visit after that takes 30–50 seconds
to load. If you post the link to a WhatsApp group, the first person to
tap it sees a blank screen and gives up. Either open the link yourself a
minute before you post it, or upgrade to the paid plan for the
recruitment period.

---

## Step 5 — Download your data

Sign in to nothing. Just open, in your browser:

```
https://mindfulfinance1-1.onrender.com/api/export/data.xlsx?key=YOUR_KEY
```

A `.xlsx` downloads with six sheets:

| Sheet | What is in it |
|---|---|
| **Data** | One row per participant, 146 columns. This is your SPSS file. |
| **Codebook** | Every variable: label, construct, range, value labels, scoring notes, source citation |
| **ValueLabels** | The response anchors for each scale |
| **Scores** | Derived scores only, if you want a smaller file |
| **FeedTrials** | One row per feed decision — for the multilevel model |
| **Meta** | Instrument version, export date, warnings |

Check progress any time with:
```
https://mindfulfinance1-1.onrender.com/api/quota-report?key=YOUR_KEY
```

**Download a copy every week.** A free Atlas cluster is not a backup.

---

## Step 6 — Into SPSS

1. Open the `.xlsx`, delete every sheet except **Data**, save as
   `MindfulFinance-data.xlsx`
2. SPSS → File → Import Data → Excel → tick *Read variable names from
   first row*
3. Run `mindfulfinance-analysis.sps` from the top. The first block sets
   missing values for skipped knowledge sections — do not skip it, or a
   skipped quiz is scored as zero knowledge and every literacy result is
   wrong.

---

## Withdrawal requests

A participant who emails you their code has an absolute right to have
their data deleted. From your browser's address bar you cannot send a
DELETE, so use PowerShell:

```powershell
Invoke-RestMethod -Method Delete `
  -Uri "https://mindfulfinance1-1.onrender.com/api/response/MF-THEIRCODE"
```

It returns how many records were removed. Your consent form promises this
within 90 days.

---

## Before the first participant — checklist

- [ ] `MONGODB_URI` set, `/api/readiness` says `"storage": "mongodb"`
- [ ] `RESEARCHER_KEY` set and kept private
- [ ] `/api/readiness` says `"ready": true`
- [ ] Prof. Manju Singh told her address is on the consent screen
- [ ] Every helpline number in `ethics.js` dial-tested
- [ ] You have taken the survey yourself, start to finish, on a phone
- [ ] Test responses deleted before real recruitment begins


---

## If a participant reports an error on the submit button

The submit path is designed so that a failure does not cost you the response.
What happens, in order:

1. The answers are written to the participant's own browser storage **before**
   the request is sent.
2. If the request fails, they see a plain-language message and a **Try again**
   button — not a status code.
3. If they simply reload or reopen the page later, the queued response is sent
   automatically. They do not have to do anything.
4. On the server, if the database is unreachable, the response is written to
   the container filesystem rather than rejected, and the reply says
   `"storedIn": "file-fallback"`.

**Reading the status code.** These now mean different things, which they did
not before:

| Code | Meaning | What to do |
|---|---|---|
| 200 | Stored. Check `storedIn` — `mongodb` is good, `file-fallback` means the database was down and the data is at risk | If `file-fallback`, fix `MONGODB_URI` and export immediately |
| 400 | The payload was malformed — a genuine client bug | Send me the browser console output |
| 503 | The server could not store it | Check the Render logs; the client will retry on its own |

A 400 used to be returned for database failures too, which made a server
outage look like a broken app and threw the response away. That is fixed:
400 now means only that the request itself was wrong.

**Where to look.** Render dashboard → your service → **Logs**. A failed write
logs `[responses] MongoDB write FAILED, falling back to file:` followed by the
actual reason.

---

## Two tests you can run yourself

Both need `npm install --no-save playwright` once.

```powershell
node check-mongo.mjs "<your connection string>"   # database, end to end
node server/index.js          # in one terminal
node submission-test.mjs      # in another — completes the survey with the
                              # submit endpoint forced to fail, then checks
                              # the response still arrives after a reload
node mobile-audit.mjs         # layout check at 360 / 375 / 390 px
```
