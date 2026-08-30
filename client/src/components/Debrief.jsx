// ===========================================================================
// Debrief.jsx — post-participation debriefing
// ---------------------------------------------------------------------------
// Required practice for any study with an embedded randomised manipulation.
// Participants are told which condition they were in, that the feed was
// fictional, how to withdraw their data, and who to contact about their rights
// as a participant — a route that does not go through the researcher.
// ===========================================================================

import { useState } from "react";
import { ETHICS, isConfigured, SUPPORT, needsSupport } from "../lib/ethics.js";

function Withdraw({ participantId }) {
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  async function withdraw() {
    if (!window.confirm(
      "This permanently deletes your responses from the research dataset. " +
      "It cannot be undone. Your report stays on this device. Continue?"
    )) return;
    setState("working");
    try {
      const r = await fetch(`/api/response/${encodeURIComponent(participantId)}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`Server returned ${r.status}`);
      const d = await r.json();
      setState(d.deleted ? "done" : "notfound");
    } catch (e) {
      setError(e.message);
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="withdraw-done">✓ Your responses have been deleted from the research dataset.</p>;
  }
  if (state === "notfound") {
    return <p className="small muted">No submitted responses found for this code — nothing was contributed, so there is nothing to delete.</p>;
  }

  return (
    <>
      <button className="btn btn-ghost" onClick={withdraw} disabled={state === "working"}>
        {state === "working" ? "Deleting…" : "Withdraw my data from the research"}
      </button>
      {error && <p className="small err">Could not withdraw: {error}. Please email us with your participant code.</p>}
    </>
  );
}

export default function Debrief({ results, session, onBack }) {
  const configured = isConfigured();
  const showSupport = needsSupport(results);

  return (
    <div className="screen">
      <h2 className="screen-title">📋 About the study you just took part in</h2>
      <p className="screen-note">
        Now that you have finished, here is the full picture of what this study is measuring and why.
      </p>

      <div className="debrief-sec">
        <h3>Nothing was hidden from you</h3>
        <p>
          Everyone taking part sees the same questions and the same feed. There is no hidden
          condition, no secret grouping, and nothing about the study was misrepresented on the
          consent page. Earlier versions of this study randomly showed some people an extra warning
          banner on the feed; that was removed, so what you saw is simply the feed as designed.
        </p>
      </div>

      <div className="debrief-sec">
        <h3>Every post in the feed was fictional</h3>
        <p>
          The handles, funds, companies and return figures were all invented for this study. Nothing
          you saw was a real investment, and nothing in this assessment is a recommendation to buy or
          sell anything. Your results describe patterns in your own answers — they are not a
          diagnosis, and they are not financial advice.
        </p>
      </div>

      {showSupport && (
        <div className="notice notice-support">
          <h4>If money worries are weighing on you</h4>
          <p className="small">
            Some of your answers touched on financial strain. That is more common than most people
            realise, and support exists — these are all free.
          </p>
          <div className="support-grid">
            {SUPPORT.emotional.map((s) => (
              <div className="support-card" key={s.name}>
                <strong>{s.name}</strong>
                <span className="support-num">{s.contact}</span>
                <span className="small muted">{s.hours} · {s.note}</span>
              </div>
            ))}
          </div>
          <p className="small" style={{ marginTop: 12 }}>
            <strong>If a lender or intermediary has treated you unfairly:</strong>{" "}
            {SUPPORT.financial.map((f) => `${f.name} — ${f.contact}`).join(" · ")}. Filing is free.
          </p>
          <p className="small muted">{SUPPORT.caveat}</p>
        </div>
      )}

      <div className="debrief-sec">
        <h3>Your data, and how to remove it</h3>
        <p>
          Your responses are anonymous — no name, email, phone number or IP address was collected.
          They are linked only to your participant code, <strong>{results?.participantId}</strong>.
          Keep that code if you may want to withdraw later; without it we cannot identify which
          responses are yours.
        </p>
        <p>
          You may withdraw your data at any time, and you do not have to give a reason. Responses are
          retained for {ETHICS.retentionYears} years after the study concludes, then deleted.
          Requests to erase are actioned within {ETHICS.erasureResponseDays} days.
        </p>
        <div className="screen-actions" style={{ borderTop: "none", paddingTop: 0, marginTop: 12 }}>
          <Withdraw participantId={results?.participantId} />
        </div>
      </div>

      <div className="debrief-sec">
        <h3>Who to contact</h3>
        {configured ? (
          <table className="contact-table">
            <tbody>
              <tr><td>Researcher</td><td>{ETHICS.researcher}, {ETHICS.institution}<br />{ETHICS.researcherEmail}</td></tr>
              <tr><td>Supervisor</td><td>{ETHICS.supervisor}{ETHICS.supervisorEmail && <><br />{ETHICS.supervisorEmail}</>}</td></tr>
              <tr>
                <td>Questions about your rights as a participant</td>
                <td>{ETHICS.ethicsCommittee}<br />{ETHICS.ethicsContact}<br />
                  <span className="small muted">Approval reference: {ETHICS.ethicsRef}</span></td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="notice notice-soft">
            <h4>Pilot mode — contact details not yet configured</h4>
            <p className="small">
              This build is not approved for live data collection. Researcher, supervisor and ethics
              committee details must be completed in <code>client/src/lib/ethics.js</code> first.
            </p>
          </div>
        )}
        <p className="small muted">
          Thank you for taking part. Research like this only works because people give up fifteen
          minutes for it.
        </p>
      </div>

      <div className="screen-actions">
        <button className="btn btn-primary" onClick={onBack}>Back to my results</button>
      </div>
    </div>
  );
}
