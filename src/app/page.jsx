"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let val = 0;
          const duration = 1800;
          const step = 16;
          const increment = target / (duration / step);
          const timer = setInterval(() => {
            val += increment;
            if (val >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(val));
            }
          }, step);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    tag: "TEAMS",
    title: "Squad Builder",
    desc: "Assemble your dream team with skill-based matchmaking. Manage rosters, assign roles, and build chemistry.",
    icon: (
      <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    tag: "COMPETE",
    title: "Tournament Hub",
    desc: "Enter brackets, track live standings, and compete for glory across multiple game titles and formats.",
    icon: (
      <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    tag: "ANALYTICS",
    title: "Performance Analytics",
    desc: "Deep-dive into your stats, track KDA trends, and get AI-powered insights to sharpen your competitive edge.",
    icon: (
      <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    tag: "IDENTITY",
    title: "Player Profiles",
    desc: "Showcase your achievements with a unique credential card. Your gamer identity, your legacy.",
    icon: (
      <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const STATS = [
  { value: 12400, suffix: "+", label: "Registered Players" },
  { value: 850, suffix: "+", label: "Active Squads" },
  { value: 320, suffix: "+", label: "Tournaments Run" },
  { value: 98, suffix: "%", label: "Uptime" },
];

const STEPS = [
  { num: "01", title: "Create Account", desc: "Sign up in seconds and claim your unique gamer tag." },
  { num: "02", title: "Build Your Squad", desc: "Invite players, assign roles, and set your strategy." },
  { num: "03", title: "Enter Competitions", desc: "Join open brackets or create private tournaments." },
  { num: "04", title: "Rise the Ranks", desc: "Earn points, track progress, and cement your legacy." },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden">

      {/* ── Animated grid background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-48 -left-24 w-[600px] h-[600px] rounded-full bg-yellow-400/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-yellow-400/[0.07] blur-[100px] animate-pulse" />
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 bg-[#050508]/80 backdrop-blur-xl border-b border-yellow-400/10">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-black text-xs font-black tracking-wide shadow-[0_0_16px_rgba(250,204,21,0.5)]">
            PMS
          </div>
          <span className="text-white font-extrabold text-base tracking-widest uppercase">ProMatch</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 rounded-md border border-yellow-400/25 text-yellow-400 text-sm font-semibold tracking-wide hover:bg-yellow-400/10 hover:border-yellow-400 transition-all"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 rounded-md bg-yellow-400 text-black text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:bg-yellow-300 hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:-translate-y-px transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center min-h-[calc(100vh-64px)] px-4 py-16">
        {/* Status pill */}
        <div className="inline-flex items-center gap-2 bg-yellow-400/8 border border-yellow-400/25 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
          <span className="text-yellow-400 text-[0.65rem] font-bold tracking-[0.15em] uppercase">
            Platform Online · Season 3 Active
          </span>
        </div>

        <p className="text-[0.65rem] font-bold tracking-[0.22em] text-yellow-400/60 uppercase mb-2">
          Esports Player Management System
        </p>

        <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6 text-white">
          Build Your<br />
          <span className="text-yellow-400 [text-shadow:0_0_60px_rgba(250,204,21,0.4)]">
            Esports Legacy
          </span>
        </h1>

        <p className="text-base md:text-lg text-white/50 max-w-xl leading-relaxed mb-10">
          Form elite squads, dominate tournaments, and track every stat that matters.
          Your competitive journey — fully managed, beautifully presented.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4 justify-center mb-14">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-yellow-400 text-black font-extrabold text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:bg-yellow-300 hover:shadow-[0_0_50px_rgba(250,204,21,0.6)] hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Start for Free
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-white/15 text-white font-semibold text-sm tracking-wide hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all"
          >
            Log In
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="flex flex-col items-center gap-1 text-white/25 text-[0.62rem] tracking-[0.14em] uppercase animate-bounce">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Scroll to explore
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent" />
        <div className="grid grid-cols-2 md:grid-cols-4 bg-black/60 border-y border-yellow-400/[0.08]">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={`py-10 text-center ${i > 0 ? "border-l border-yellow-400/10" : ""}`}
            >
              <div className="text-4xl font-black text-yellow-400 tracking-tight leading-none mb-1.5 [text-shadow:0_0_30px_rgba(250,204,21,0.3)]">
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-[0.68rem] font-semibold tracking-[0.12em] uppercase text-white/35">
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent" />
      </div>

      {/* ── Features ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <p className="text-yellow-400 text-[0.65rem] font-bold tracking-[0.18em] uppercase mb-2">What We Offer</p>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
          Everything You Need to <span className="text-yellow-400">Compete</span>
        </h2>
        <p className="text-white/40 text-base leading-relaxed max-w-lg mb-14">
          A complete toolkit for players, squad managers, and tournament organizers — all in one place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white/[0.025] border border-white/[0.07] rounded-2xl p-6 overflow-hidden hover:-translate-y-1 hover:border-yellow-400/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(250,204,21,0.06)] transition-all duration-300 cursor-default"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <span className="relative inline-block bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-[0.58rem] font-bold tracking-[0.14em] uppercase px-2 py-0.5 rounded mb-4">
                {f.tag}
              </span>
              <div className="relative mb-3">{f.icon}</div>
              <h3 className="relative text-white font-extrabold text-base mb-2">{f.title}</h3>
              <p className="relative text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <div className="relative z-10 bg-black/60 border-y border-yellow-400/[0.08] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-yellow-400 text-[0.65rem] font-bold tracking-[0.18em] uppercase mb-2">How It Works</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Four Steps to the <span className="text-yellow-400">Top</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {STEPS.map((step) => (
              <div key={step.num} className="relative">
                <div className="text-6xl font-black text-yellow-400/[0.12] tracking-tighter leading-none mb-3">
                  {step.num}
                </div>
                <h3 className="text-white font-extrabold text-base mb-2">{step.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-yellow-400/[0.08] to-yellow-400/[0.02] border border-yellow-400/20 rounded-2xl px-8 py-16 relative overflow-hidden">
          {/* Glow top */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-yellow-400/20 blur-3xl rounded-full pointer-events-none" />
          <p className="text-yellow-400 text-[0.65rem] font-bold tracking-[0.18em] uppercase mb-4 relative">Ready to Compete?</p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 relative">
            Your Legacy Starts Today
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto mb-10 relative">
            Join thousands of players already building their esports career on ProMatch.
            Free to start — no credit card needed.
          </p>
          <div className="flex flex-wrap gap-4 justify-center relative">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-yellow-400 text-black font-extrabold text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(250,204,21,0.4)] hover:bg-yellow-300 hover:shadow-[0_0_50px_rgba(250,204,21,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg border border-white/15 text-white font-semibold text-sm tracking-wide hover:border-yellow-400/40 hover:text-yellow-400 hover:bg-yellow-400/5 transition-all"
            >
              I Have an Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] px-6 md:px-10 py-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-white/25 text-xs tracking-wider">© 2026 ProMatch · Player Management System</span>
        <div className="flex gap-6">
          <Link href="/login" className="text-white/30 text-xs hover:text-yellow-400 transition-colors">Login</Link>
          <Link href="/signup" className="text-white/30 text-xs hover:text-yellow-400 transition-colors">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
}
