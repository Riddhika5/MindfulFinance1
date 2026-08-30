// ===========================================================================
// config.js — runtime research-governance configuration
// ---------------------------------------------------------------------------
// Governance details are read from ENVIRONMENT VARIABLES so they can be set in
// the Render dashboard without editing code or rebuilding. The client fetches
// them at boot.
//
// This matters practically: an ethics reference often arrives after the app is
// already deployed, and requiring a code change plus a redeploy to enter it is
// the kind of friction that leads to someone hard-coding a placeholder and
// forgetting. Setting an environment variable takes ten seconds.
//
// Values here override the defaults in client/src/lib/ethics.js.
// ===========================================================================

import { ETHICS } from "../client/src/lib/ethics.js";
import { checkStorage } from "./responses.js";

const FIELDS = {
  institution: "MF_INSTITUTION",
  researcher: "MF_RESEARCHER",
  researcherEmail: "MF_RESEARCHER_EMAIL",
  supervisor: "MF_SUPERVISOR",
  supervisorEmail: "MF_SUPERVISOR_EMAIL",
  ethicsCommittee: "MF_ETHICS_COMMITTEE",
  ethicsRef: "MF_ETHICS_REF",
  ethicsContact: "MF_ETHICS_CONTACT",
};

// Every field that must be present before live data collection is permitted.
const REQUIRED = [
  "institution", "researcher", "researcherEmail",
  "supervisor", "ethicsCommittee", "ethicsRef", "ethicsContact",
];

export function readEthicsConfig() {
  const out = {};
  for (const [key, envName] of Object.entries(FIELDS)) {
    const v = (process.env[envName] || "").trim();
    if (v) out[key] = v;
  }
  const years = Number(process.env.MF_RETENTION_YEARS);
  if (Number.isFinite(years) && years > 0) out.retentionYears = years;
  return out;
}

/**
 * Async readiness. `storage` now reports whether the database ACTUALLY
 * ANSWERS, not merely whether MONGODB_URI is a non-empty string. The old
 * behaviour was actively dangerous: a wrong password or a missing Atlas IP
 * allowlist entry still reported "mongodb", so the one check the researcher
 * was told to run before recruiting would pass while every response was
 * quietly going to a disk that gets wiped.
 */
export async function readinessAsync() {
  const base = readiness();
  const storage = await checkStorage();
  return {
    ...base,
    storage: storage.ok ? storage.mode : `${storage.mode} (UNREACHABLE)`,
    storageOk: storage.ok,
    storageWarning: storage.warning,
    ready: base.ready && storage.ok,
    readyToCollect: base.ready && storage.ok,
  };
}

export function readiness() {
  // Environment variables OVERRIDE the values compiled into
  // client/src/lib/ethics.js, but the compiled values are real governance
  // details, not placeholders. Readiness has to consider both, or this
  // endpoint reports "not ready" for a study that is in fact fully approved.
  const cfg = { ...ETHICS, ...readEthicsConfig() };
  const missing = REQUIRED.filter((k) => !String(cfg[k] || "").trim());
  return {
    ready: missing.length === 0,
    missing,
    missingEnvVars: missing.map((k) => FIELDS[k]),
    configured: REQUIRED.filter((k) => String(cfg[k] || "").trim()),
    source: Object.fromEntries(
      REQUIRED.map((k) => [k, readEthicsConfig()[k] ? "env" : (ETHICS[k] ? "ethics.js" : "MISSING")])
    ),
    storage: process.env.MONGODB_URI ? "mongodb" : "ephemeral-file",
    storageWarning: process.env.MONGODB_URI
      ? null
      : "MONGODB_URI is not set. Responses are being written to the container filesystem, which Render wipes on every redeploy, restart and free-tier sleep. Data WILL be lost.",
    exportEnabled: !!process.env.RESEARCHER_KEY,
    exportWarning: process.env.RESEARCHER_KEY
      ? null
      : "RESEARCHER_KEY is not set — the data export endpoints are disabled.",
  };
}
