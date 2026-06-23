# Sharing MindfulFinance with other people

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
