// ===========================================================================
// App.jsx — one app, three stages.
// ---------------------------------------------------------------------------
//   landing  → the front door
//   assess   → the validated assessment (Assess phase)
//   hub      → everything else: results, learning, challenge, tracking, feed,
//              community (Analyse + Improve phases)
//
// There is no separate "tools" area. The assessment is the way in, and the hub
// is the single home afterwards.
// ===========================================================================

import { useState } from "react";
import Landing from "./components/Landing.jsx";
import Assessment from "./components/Assessment.jsx";
import Hub from "./components/Hub.jsx";
import { load, save } from "./lib/storage.js";

export default function App() {
  // A completed assessment is remembered, so returning visitors land in the hub.
  const [completed, setCompleted] = useState(() => !!load("mf_completed", false));
  const [session, setSession] = useState(() => load("mf_session", null));
  const [stage, setStage] = useState("landing");

  function handleComplete(finishedSession) {
    setSession(finishedSession);
    setCompleted(true);
    save("mf_completed", true);
    setStage("hub");
  }

  function restart() {
    save("mf_completed", false);
    save("mf_session", null);
    setCompleted(false);
    setSession(null);
    setStage("assess");
  }

  if (stage === "landing") {
    return (
      <Landing
        completed={completed}
        onAssess={() => setStage("assess")}
        onEnter={() => setStage(completed ? "hub" : "assess")}
      />
    );
  }

  if (stage === "assess") {
    return (
      <Assessment
        onExit={() => setStage("landing")}
        onComplete={handleComplete}
        onSessionChange={setSession}
      />
    );
  }

  return (
    <Hub
      session={session}
      completed={completed}
      onRestart={restart}
      onExit={() => setStage("landing")}
      onResumeAssessment={() => setStage("assess")}
    />
  );
}
