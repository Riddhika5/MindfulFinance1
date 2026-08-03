// Landing.jsx — the front door. One primary action: start the assessment.
// Returning participants who already finished get a "continue" route instead.

import { useEffect, useRef } from "react";
import { ITEM_COUNT } from "../lib/instruments.js";

const FEATURES = [
  {
    emoji: "🧪",
    title: "Every question from a validated scale",
    text: "MAAS, the CFPB Financial Well-Being Scale, the Lusardi–Mitchell literacy questions, and published behavioural-bias instruments. Nothing here was made up for the occasion.",
  },
  {
    emoji: "📱",
    title: "A feed, not a form",
    text: "Part of the assessment is a simulated social media feed. You react to posts the way you normally would, and what you do is measured — not just what you say you'd do.",
  },
  {
    emoji: "🧠",
    title: "Your behavioural bias profile",
    text: "Ten tendencies — herding, FOMO, anchoring, overconfidence and more — scored on a common scale and shown as a profile you can actually read.",
  },
  {
    emoji: "🌱",
    title: "Then the part that helps",
    text: "Short learning modules chosen for your profile, a weekly challenge, spending tracking, and a check-up you can retake to see what changed.",
  },
];

export default function Landing({ onEnter, onAssess, completed }) {
  const rootRef = useRef(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !rootRef.current) return undefined;
    const els = rootRef.current.querySelectorAll(".land-reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("land-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="landing" ref={rootRef}>
      <section className="land-hero">
        <p className="land-eyebrow land-reveal">🪙 MindfulFinance</p>
        <h1 className="land-title land-reveal">
          Know your
          <br />
          <span className="land-grad">financial decision style.</span>
        </h1>
        <p className="land-sub land-reveal">
          See how social media shapes the money decisions you make — measured with published research
          instruments, and returned to you as a profile you can act on.
        </p>
        <div className="land-cta-row land-reveal">
          {completed ? (
            <>
              <button className="land-cta" onClick={onEnter}>Continue to my dashboard →</button>
              <button className="land-cta land-cta-ghost" onClick={onAssess}>Retake the assessment</button>
            </>
          ) : (
            <button className="land-cta" onClick={onAssess}>Start assessment →</button>
          )}
        </div>
        <p className="land-fineprint land-reveal">
          {ITEM_COUNT} questions · 12–15 minutes · anonymous · no sign-up
        </p>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          <span>Spend mindfully ✦ Save with intention ✦ Beat FOMO ✦ Notice the nudge ✦ Invest calmly ✦ Pause before you buy ✦&nbsp;</span>
          <span>Spend mindfully ✦ Save with intention ✦ Beat FOMO ✦ Notice the nudge ✦ Invest calmly ✦ Pause before you buy ✦&nbsp;</span>
        </div>
      </div>

      {FEATURES.map((f, i) => (
        <section className={"land-feature land-reveal" + (i % 2 ? " alt" : "")} key={f.title}>
          <div className="land-feature-emoji">{f.emoji}</div>
          <div>
            <h2>{f.title}</h2>
            <p>{f.text}</p>
          </div>
        </section>
      ))}

      <section className="land-final land-reveal">
        <h2>Ready to find out?</h2>
        <button className="land-cta" onClick={onAssess}>
          {completed ? "Retake the assessment →" : "Start assessment →"}
        </button>
      </section>
    </div>
  );
}
