#!/usr/bin/env node
// ===========================================================================
// check-mongo.mjs — tell me exactly what is wrong with my MONGODB_URI
// ---------------------------------------------------------------------------
//   node check-mongo.mjs                      (reads MONGODB_URI from the env)
//   node check-mongo.mjs "mongodb+srv://..."  (or pass it directly)
//
// "It doesn't work" is not a diagnosis, and the driver's own errors are not
// much better — an unescaped character in a password and an IP that is not
// allowlisted both surface as a generic timeout. This checks the string
// first, then the connection, then an actual write, and names the specific
// thing to fix.
//
// It writes ONE document to a scratch collection and deletes it again. It
// never reads, writes or touches the `responses` collection.
// ===========================================================================

const RESET = "[0m", RED = "[31m", GREEN = "[32m",
      YELLOW = "[33m", BOLD = "[1m", DIM = "[2m";

const ok   = (m) => console.log(`${GREEN}  ✓${RESET} ${m}`);
const bad  = (m) => console.log(`${RED}  ✗${RESET} ${m}`);
const warn = (m) => console.log(`${YELLOW}  !${RESET} ${m}`);
const step = (m) => console.log(`\n${BOLD}${m}${RESET}`);
const fix  = (m) => console.log(`${YELLOW}    → ${m}${RESET}`);

const uri = process.argv[2] || process.env.MONGODB_URI;

console.log(`${BOLD}MongoDB connection check${RESET}`);

if (!uri) {
  bad("MONGODB_URI is not set, and no connection string was passed as an argument.");
  fix("On Render: Dashboard → your service → Environment → Add Environment Variable.");
  fix('Locally:  node check-mongo.mjs "mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/"');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. The string itself. Most failures are here, and none of them need a
//    network round trip to detect.
// ---------------------------------------------------------------------------
step("1. Checking the connection string");

let problems = 0;

if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
  bad("Does not start with mongodb:// or mongodb+srv://");
  fix("Copy it again from Atlas → Connect → Drivers.");
  problems++;
} else {
  ok(`Scheme looks right (${uri.startsWith("mongodb+srv") ? "SRV" : "standard"})`);
}

// Placeholders people forget to replace.
const placeholder = uri.match(/<([^>]+)>/);
if (placeholder) {
  bad(`The literal placeholder <${placeholder[1]}> is still in the string.`);
  fix(`Replace <${placeholder[1]}> with the real value — angle brackets included.`);
  problems++;
}
if (/:(password|yourpassword|mypassword)@/i.test(uri)) {
  bad("The password is literally the word 'password'.");
  fix("Use the database user's real password from Atlas → Database Access.");
  problems++;
}

// Credentials and percent-encoding — the classic silent failure.
//
// Split on the LAST @, not the first. An unescaped @ inside the password is
// the single most common mistake here, and splitting on the first one parses
// the string into nonsense instead of reporting it. Counting them is what
// catches it.
const hasPlaceholder = !!placeholder;
const afterScheme = uri.replace(/^mongodb(\+srv)?:\/\//, "");
const atCount = (afterScheme.match(/@/g) || []).length;
const lastAt = afterScheme.lastIndexOf("@");

if (atCount === 0) {
  bad("No username:password found before the @.");
  fix("The string should look like mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/");
  problems++;
} else {
  if (atCount > 1) {
    bad(`Found ${atCount} @ symbols. One separates the credentials from the host, so the others are unescaped characters inside the username or password.`);
    fix("Every @ inside a password must be written as %40.");
    fix("Or simplest: reset the password in Atlas to letters and numbers only.");
    problems++;
  }
  const credPart = afterScheme.slice(0, lastAt);
  const [user, ...rest] = credPart.split(":");
  const pass = rest.join(":");

  if (!user) { bad("Username is empty."); problems++; }
  else ok(`Username: ${user}`);

  if (!pass) {
    bad("Password is empty.");
    problems++;
  } else {
    // Anything in this set MUST be percent-encoded inside a connection string.
    const mustEncode = [...new Set(pass.match(/[:/?#[\]@%!$&'()*+,;= ]/g) || [])]
      .filter((c) => {
        // A legitimately encoded %XX is fine; a bare % is not.
        if (c === "%") return !/%[0-9A-Fa-f]{2}/.test(pass);
        return true;
      });
    if (mustEncode.length) {
      bad(`Password contains characters that must be percent-encoded: ${mustEncode.map((c) => (c === " " ? "(space)" : c)).join("  ")}`);
      const enc = { ":": "%3A", "/": "%2F", "?": "%3F", "#": "%23", "[": "%5B", "]": "%5D",
                    "@": "%40", "!": "%21", "$": "%24", "&": "%26", "'": "%27", "(": "%28",
                    ")": "%29", "*": "%2A", "+": "%2B", ",": "%2C", ";": "%3B", "=": "%3D",
                    "%": "%25", " ": "%20" };
      mustEncode.forEach((c) => fix(`${c === " " ? "(space)" : c}  →  ${enc[c]}`));
      fix("Or simplest: reset the password in Atlas to letters and numbers only.");
      problems++;
    } else if (!hasPlaceholder) {
      ok(`Password: ${"•".repeat(Math.min(pass.length, 12))} (${pass.length} chars, no escaping needed)`);
    }
  }
}

const host = afterScheme.slice(lastAt + 1).split(/[/?]/)[0];
if (host) ok(`Host: ${host}`);

if (problems) {
  console.log(`\n${RED}${BOLD}${problems} problem(s) in the string itself — fix these before testing the connection.${RESET}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Connect.
// ---------------------------------------------------------------------------
step("2. Connecting");

let MongoClient;
try {
  ({ MongoClient } = await import("mongodb"));
} catch {
  bad("The `mongodb` package is not installed here.");
  fix("Run `npm install` in the project folder first.");
  process.exit(1);
}

const dbName = process.env.MONGODB_DB || "mindfulmoney";
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });

try {
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  ok(`Connected, and the server answered a ping. Database: ${dbName}`);
} catch (err) {
  const m = String(err?.message || err);
  bad(m.split("\n")[0]);

  // Translate the driver's error into the thing to actually change.
  if (/bad auth|Authentication failed|AuthenticationFailed/i.test(m)) {
    fix("The username or password is wrong.");
    fix("Atlas → Database Access → your user → Edit → Edit Password. Then update MONGODB_URI.");
    fix("Note this is the DATABASE user, not your Atlas login.");
  } else if (/ENOTFOUND|querySrv|getaddrinfo/i.test(m)) {
    fix("The cluster hostname does not resolve — it is mistyped, or the cluster was deleted.");
    fix("Copy the string again from Atlas → Connect → Drivers.");
  } else if (/timed out|ETIMEDOUT|ServerSelectionTimeout|connection.*closed/i.test(m)) {
    fix("Reached the network but got no answer. This is almost always the IP allowlist.");
    fix("Atlas → Network Access → Add IP Address → ALLOW ACCESS FROM ANYWHERE (0.0.0.0/0).");
    fix("Render's outbound IPs are not fixed on the free plan, so a narrower rule will not work.");
  } else if (/tls|ssl|certificate/i.test(m)) {
    fix("TLS negotiation failed — usually an out-of-date Node or a proxy in the way.");
  } else if (/not authorized|Unauthorized/i.test(m)) {
    fix("The user connected but lacks permission on this database.");
    fix("Atlas → Database Access → your user → set 'Read and write to any database'.");
  }
  await client.close().catch(() => {});
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Can it actually WRITE? Connecting proves less than people assume — a
//    read-only user connects perfectly and then loses every response.
// ---------------------------------------------------------------------------
step("3. Testing a write (scratch collection, cleaned up afterwards)");

const db = client.db(dbName);
try {
  const scratch = db.collection("_connection_check");
  const marker = { _id: `check-${Date.now()}`, at: new Date().toISOString() };
  await scratch.insertOne(marker);
  const readBack = await scratch.findOne({ _id: marker._id });
  await scratch.deleteOne({ _id: marker._id });
  if (!readBack) throw new Error("Wrote a document but could not read it back.");
  ok("Wrote, read back and deleted a test document. The user has read/write access.");
} catch (err) {
  bad(String(err?.message || err).split("\n")[0]);
  fix("The user can connect but cannot write. Atlas → Database Access → your user →");
  fix("Built-in Role → 'Read and write to any database'. Responses would be LOST without this.");
  await client.close().catch(() => {});
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 4. What is already stored.
// ---------------------------------------------------------------------------
step("4. Existing data");
try {
  const n = await db.collection("responses").countDocuments();
  if (n === 0) ok("The `responses` collection is empty — expected before recruitment.");
  else {
    ok(`${n} response(s) already stored.`);
    const latest = await db.collection("responses")
      .find({}, { projection: { participantId: 1, submittedAt: 1, _id: 0 } })
      .sort({ submittedAt: -1 }).limit(3).toArray();
    latest.forEach((r) => console.log(`${DIM}      ${r.participantId}  ${r.submittedAt}${RESET}`));
  }
} catch (err) {
  warn(`Could not count responses: ${err.message}`);
}

await client.close();
console.log(`\n${GREEN}${BOLD}All checks passed. This connection string is safe to use for live collection.${RESET}`);
console.log(`${DIM}Set it on Render as MONGODB_URI, redeploy, then confirm /api/readiness shows "storageOk": true.${RESET}\n`);
