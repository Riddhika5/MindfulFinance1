// ===========================================================================
// pendingSubmission.js — never lose a completed response to a bad moment
// ---------------------------------------------------------------------------
// A participant gives ten minutes and then presses one button. If that request
// fails, the answers are gone unless something catches them, and the most
// likely cause of failure is entirely mundane: Render's free plan puts the
// service to sleep after fifteen minutes, and the first request after that
// takes 30–50 seconds to answer. A participant on a phone, on mobile data,
// at the end of a questionnaire, is exactly the person whose request times
// out — and exactly the person who will not come back.
//
// So the payload is written here BEFORE the request is sent, and cleared only
// once the server confirms. Any later load of the app flushes the queue.
//
// This is a per-device queue, so it only rescues a response if the participant
// opens the page again on the same device. That is a real limit, and the
// reason it is a backstop rather than the primary mechanism: the primary fix
// is a reachable database and a warm service.
// ===========================================================================

export const PENDING_KEY = "mf_pending_submission";

export function queueSubmission(payload) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    /* private browsing or storage full — the request still goes out */
  }
}

export function clearSubmission() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function readSubmission() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.raw && parsed?.scored ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * POST a response. Distinguishes "the server rejected this" (do not retry —
 * re-sending an identical payload will fail identically) from "the server
 * could not be reached" (retry later).
 */
export async function postResponse(payload) {
  let r;
  try {
    r = await fetch("/api/response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    const e = new Error("The server could not be reached.");
    e.retryable = true;
    e.cause = networkErr;
    throw e;
  }

  let body = null;
  try {
    body = await r.json();
  } catch {
    /* an HTML error page rather than JSON */
  }

  if (!r.ok) {
    const e = new Error(
      body?.error ||
        (r.status >= 500
          ? "The server is not responding just now."
          : `The server rejected the submission (${r.status}).`)
    );
    e.status = r.status;
    e.retryable = body?.retryable ?? r.status >= 500;
    throw e;
  }
  return body;
}

/**
 * Send anything left queued by an earlier failed attempt. Safe to call on
 * every app load: it is a no-op when the queue is empty, and the server
 * upserts on participant + wave, so a double-send cannot duplicate a row.
 * Returns the participant id if one was flushed.
 */
export async function flushPendingSubmission() {
  const queued = readSubmission();
  if (!queued) return null;
  try {
    await postResponse(queued);
    try {
      localStorage.setItem("mf_submitted", queued.raw.participantId);
    } catch {
      /* ignore */
    }
    clearSubmission();
    return queued.raw.participantId;
  } catch (e) {
    // Only give up on a rejection that retrying cannot fix.
    if (!e.retryable) clearSubmission();
    return null;
  }
}
