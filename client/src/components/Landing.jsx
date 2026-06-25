// Landing.jsx — a Cuberto-inspired landing page: a big bold hero, an
// auto-scrolling marquee, and full-width feature sections that reveal as you
// scroll. The "Enter the app" buttons call onEnter() to switch into the tool.

import { useEffect, useRef } from "react";

const FEATURES = [
  {
    emoji: "📱",
    title: "A feed that reveals itself",
    text: "Real financial posts — auto-tagged hype, scam-risk, or calm advice. Tap how each one made you feel.",
  },
  {
    emoji: "🧠",
    title: "Spot the hidden biases",
    text: "Tiny mental shortcuts quietly steer your money the wrong way. The app surfaces the ones affecting you and shows, in plain English, exactly how to correct each.",
  },
  {
    emoji: "🧘",
    title: "Nudges, not lectures",
    text: "Gentle nudges, smarter defaults, and mindfulness prompts so you spend, save, and invest on purpose.",
  },
  {
    emoji: "📈",
    title: "A well-being score",
    text: "One number, 0–100, that climbs as your money decisions get calmer and more deliberate.",
  },
];

export default function Landing({ onEnter }) {
  const rootRef = useRef(null);

  // Reveal each section as it scrolls into view.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !rootRef.current) return;
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
          Spend, save &amp; invest
          <br />
          <span className="land-grad">with intention.</span>
        </h1>
        <p className="land-sub land-reveal">
          See how social media nudges your money — spot the behavioural biases behind it, and take
          back control with nudges, smarter defaults, and mindfulness.
        </p>
        <button className="land-cta land-reveal" onClick={onEnter}>
          Enter the app →
        </button>
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
        <h2>Ready to spend on purpose?</h2>
        <button className="land-cta" onClick={onEnter}>
          Enter the app →
        </button>
      </section>
    </div>
  );
}
