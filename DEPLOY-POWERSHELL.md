# Deploying MindfulFinance v2 from Windows PowerShell

Every command here is meant to be pasted into PowerShell one block at a time.
Read the short note under each block before running it.

If a command fails, stop and read the error rather than running the next one —
the troubleshooting table at the end covers the errors that actually happen.

---

## Step 0 — Open PowerShell and check what you have

Press **Windows key**, type `powershell`, press **Enter**.

```powershell
node -v
npm -v
git --version
```

You want Node **18 or higher**. Expected output looks like `v20.11.0`, `10.2.4`,
`git version 2.43.0`.

- **`node` or `npm` not recognised** → install Node LTS from
  https://nodejs.org , then **close and reopen PowerShell** (the PATH only
  refreshes in a new window).
- **`git` not recognised** → you have two choices: install Git from
  https://git-scm.com/download/win and reopen PowerShell, or skip Git entirely
  and use **Route B** in Step 2.

### If npm gives you a red "running scripts is disabled" error

This is the single most common Windows snag. PowerShell blocks the `npm.ps1`
wrapper by default. Fix it once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Answer **Y**. This only affects your own user account and is the setting
Microsoft recommends for development. Alternatively, avoid it entirely by
typing `npm.cmd` instead of `npm` everywhere below.

---

## Step 1 — Go to your project folder

```powershell
$repo = "C:\Users\Hp\behavioral-finance-app"
cd $repo
dir
```

Change the path if your folder lives somewhere else. **Keep the quotes** — they
matter if any folder name contains a space.

You should see `client`, `server`, `package.json`, `README.md`. If you do not,
you are in the wrong folder.

Setting `$repo` as a variable means the rest of this guide will work without
you retyping the path. It lasts until you close the window.

---

## Step 2 — Bring in the v2 code

Two routes. **Route A** if `git --version` worked, **Route B** if it did not.

### Route A — apply the patch with Git

Put `mindfulfinance-v2.patch` in your Downloads folder, then:

```powershell
cd $repo
git status
```

If anything is listed as modified, commit or stash it first — `git am` needs a
clean tree:

```powershell
git add -A
git commit -m "work in progress before v2"
```

Now create a branch and apply the patch:

```powershell
cd $repo
git checkout -b validated-instruments-v2
git am "$env:USERPROFILE\Downloads\mindfulfinance-v2.patch"
```

Success looks like five `Applying:` lines. Check:

```powershell
git log --oneline -5
```

If `git am` reports a conflict, undo it cleanly and switch to Route B:

```powershell
git am --abort
git checkout main
git branch -D validated-instruments-v2
```

### Route B — copy the files from the zip

Put `mindfulfinance-v2-files.zip` in Downloads. This unpacks it to a staging
folder first, so nothing lands in your project until you can see what it is:

```powershell
$stage = "$env:USERPROFILE\Downloads\mf-v2"
Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path "$env:USERPROFILE\Downloads\mindfulfinance-v2-files.zip" -DestinationPath $stage
dir $stage
```

You should see `client`, `server`, `package.json`, `RESEARCH.md`, `DEPLOY.md`.

**Back up your current code before overwriting.** One line, and worth it:

```powershell
Copy-Item $repo "$repo-backup-$(Get-Date -Format 'yyyyMMdd-HHmm')" -Recurse -Force -Exclude node_modules
```

Now copy the new files in:

```powershell
Copy-Item -Path "$stage\client\src\*" -Destination "$repo\client\src\" -Recurse -Force
Copy-Item -Path "$stage\server\*"     -Destination "$repo\server\"     -Recurse -Force
Copy-Item -Path "$stage\package.json" -Destination "$repo\"            -Force
Copy-Item -Path "$stage\*.md"         -Destination "$repo\"            -Force
```

Copying the **contents** (`\*`) rather than the folders avoids ending up with
`client\client`, which is the usual way this goes wrong.

Confirm the new files arrived:

```powershell
dir "$repo\client\src\lib"
```

You should see `instruments.js`, `scoring.js`, `scenarios.js`, `flow.js`,
`learn.js`, `history.js`, `report.js`.

---

## Step 3 — Install and run it locally

```powershell
cd $repo
npm run setup
```

This takes a few minutes the first time. Warnings in yellow are normal; only
red `ERR!` lines matter.

```powershell
npm run dev
```

Wait for `VITE ready` and `✅ Backend server running`, then open
**http://localhost:5173** in your browser.

Click through the entire assessment once. You are checking:

- The progress bar reaches 100% and the results screen appears.
- The bias profile lists **ten** constructs with HIGH / MODERATE / LOW badges.
- **Download your report** produces an HTML file that opens in a browser.

**Leave this window running** while you test. To stop the app, click the
PowerShell window and press **Ctrl + C**.

If the page loads but the feed has no posts, you started only the front end.
`npm run dev` starts both halves; `npm run client` starts only one.

---

## Step 4 — Push to GitHub

### If you used Route A (Git)

```powershell
cd $repo
git push -u origin validated-instruments-v2
```

You will be prompted to sign in to GitHub the first time. A browser window
opens — approve it there.

To put it live on your existing site, either merge the branch on GitHub (open
the repo → **Compare & pull request** → **Merge**), or push straight to main:

```powershell
git checkout main
git merge validated-instruments-v2
git push origin main
```

### If you used Route B (zip)

```powershell
cd $repo
git add -A
git commit -m "MindfulFinance v2 - validated instruments, feed experiment, check-up"
git push origin main
```

No Git at all? Open **GitHub Desktop**, and it will already be showing the
changed files. Write a summary, click **Commit to main**, then **Push origin**.

---

## Step 5 — Render environment variables

Open your Render dashboard → your service → **Environment**. These are set in
the browser, not in PowerShell.

| Key | Value |
|---|---|
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `MONGODB_DB` | `mindfulfinance` |
| `RESEARCHER_KEY` | a long random string you invent |
| `MF_INSTITUTION` | your department and university |
| `MF_RESEARCHER` | your name |
| `MF_RESEARCHER_EMAIL` | an address you actually monitor |
| `MF_SUPERVISOR` | supervisor's name and title |
| `MF_SUPERVISOR_EMAIL` | optional |
| `MF_ETHICS_COMMITTEE` | your institutional ethics committee |
| `MF_ETHICS_REF` | your approval reference |
| `MF_ETHICS_CONTACT` | committee Member Secretary email |

The `MF_` variables lift **pilot mode**. Until all seven required ones are set,
the app shows a banner and refuses to accept responses. They take effect
immediately — no rebuild.

Check what is still missing at any time:

```powershell
Invoke-RestMethod "$app/api/readiness" | ConvertTo-Json -Depth 4
```

**Do not invent an approval reference to clear the banner.** Get approval first —
`node tools/build-ethics-pack.mjs` generates the submission documents.

Need a strong key? Generate one here and copy the output:

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
```

Click **Save Changes**. Render redeploys automatically.

**`MONGODB_URI` is not optional.** Without it, responses are written to files
inside the container, and Render wipes that filesystem on every redeploy,
restart and free-tier sleep. Your data would disappear with no warning. The
deploy log must show `[store] connected to MongoDB ✅`.

---

## Step 6 — Check the live site from PowerShell

**Important PowerShell quirk:** `curl` is an alias for `Invoke-WebRequest` and
behaves differently from real curl. Use `curl.exe` or the native commands
below.

```powershell
$app = "https://mindfulfinance1-1.onrender.com"
Invoke-RestMethod "$app/api/health"
```

Expected: `ok message` with `Server is running 🎉`.

Now open `$app` in your browser and complete one full assessment, clicking
**Contribute my answers to the research** at the end.

Then confirm the response actually saved:

```powershell
$key = "PASTE_YOUR_RESEARCHER_KEY_HERE"
Invoke-WebRequest "$app/api/export/data.xlsx?key=$key" -OutFile "$env:USERPROFILE\Desktop\MindfulFinance-data.xlsx"
Invoke-Item "$env:USERPROFILE\Desktop\MindfulFinance-data.xlsx"
```

That downloads the Excel workbook and opens it. Check the **Data** sheet has a
row for your test run, and glance at the **Codebook** and **Meta** sheets — Meta
tells you how many responses passed the quality screening.

A count of 1 or more means the whole pipeline works. The CSV is on your Desktop
and opens in Excel.

- **401 Unauthorized** → the key does not match the one on Render.
- **503** → `RESEARCHER_KEY` is not set on Render.

---

## Step 7 — Downloading your data later

Save this as `get-data.ps1` on your Desktop and run it whenever you want a
fresh copy:

```powershell
$app = "https://mindfulfinance1-1.onrender.com"
$key = "PASTE_YOUR_RESEARCHER_KEY_HERE"
$date = Get-Date -Format "yyyy-MM-dd"
$out  = "$env:USERPROFILE\Desktop\MindfulFinance-data"

New-Item -ItemType Directory -Force -Path $out | Out-Null

# The Excel workbook is the main export — data, codebook, value labels,
# scores, feed trials and meta, all in one file.
Invoke-WebRequest "$app/api/export/data.xlsx?key=$key" -OutFile "$out\MindfulFinance-$date.xlsx"

# CSVs as well, in case you want them
Invoke-WebRequest "$app/api/export/wide.csv?key=$key" -OutFile "$out\responses-$date.csv"
Invoke-WebRequest "$app/api/export/feed.csv?key=$key" -OutFile "$out\feed-trials-$date.csv"

Write-Host "Participants: " -NoNewline
(Import-Csv "$out\responses-$date.csv" | Measure-Object).Count
Write-Host "Feed trials:  " -NoNewline
(Import-Csv "$out\feed-trials-$date.csv" | Measure-Object).Count
Write-Host "Saved to $out"
Invoke-Item $out
```

Run it with:

```powershell
& "$env:USERPROFILE\Desktop\get-data.ps1"
```

Dating each file means you always have a snapshot to go back to, which matters
when you are part-way through analysis and the dataset grows underneath you.

**Keep the key private.** Anyone with that URL can download your entire
dataset. Never put it in the participant link or a WhatsApp group.

---

## Troubleshooting

| Error in PowerShell | What to do |
|---|---|
| `npm : File ... npm.ps1 cannot be loaded because running scripts is disabled` | Run the `Set-ExecutionPolicy` command in Step 0, or use `npm.cmd` |
| `'node' is not recognized` | Install Node, then **reopen** PowerShell |
| `'git' is not recognized` | Install Git and reopen, or use Route B |
| `git am` → `Patch does not apply` | `git am --abort`, then use Route B |
| `Expand-Archive : The path ... does not exist` | The zip is not in Downloads, or the name differs. Check with `dir $env:USERPROFILE\Downloads` |
| `Copy-Item : Cannot find path` | `$repo` or `$stage` is wrong. Re-run the `$repo = "..."` line — variables are lost when you close the window |
| Port 5173 or 4000 already in use | An old copy is still running. Close other PowerShell windows, or `Get-Process node \| Stop-Process` |
| `Invoke-WebRequest : 401` | Researcher key mismatch |
| `Invoke-WebRequest : 503` | `RESEARCHER_KEY` not set on Render |
| Build fails on Render with `vite: not found` | The new `package.json` did not get pushed — check it is in your commit |
| Site live but showing the old version | Render is on a different branch (Settings → Branch), or your browser cached it. **Ctrl + F5** |

### Starting over

Route B made a timestamped backup. To go back to it:

```powershell
dir "$env:USERPROFILE\..\" -Filter "*-backup-*"
```

With Git, undoing is simpler:

```powershell
cd $repo
git checkout main
git branch -D validated-instruments-v2
```

---

## The whole thing, condensed

Once you understand what each step does, this is the short version:

```powershell
$repo = "C:\Users\Hp\behavioral-finance-app"
cd $repo
git checkout -b validated-instruments-v2
git am "$env:USERPROFILE\Downloads\mindfulfinance-v2.patch"
npm run setup
npm run dev          # test at localhost:5173, then Ctrl+C
git checkout main
git merge validated-instruments-v2
git push origin main
```

Then set the three environment variables on Render and run the Step 6 checks.
