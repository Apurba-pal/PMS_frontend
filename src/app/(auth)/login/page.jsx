"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getMe } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await loginUser(form);
      login({});
      const { data } = await getMe();
      router.replace(data.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen bg-[#050508] text-white overflow-hidden">

      {/* ── Background glow orbs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-yellow-400/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-yellow-400/[0.07] blur-[100px] animate-pulse" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-100"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between px-16 py-12 relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline w-fit">
          <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center text-black text-xs font-black tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            PMS
          </div>
          <span className="text-white font-extrabold text-base tracking-widest uppercase">ProMatch</span>
        </Link>

        {/* Hero copy */}
        <div>
          <div className="inline-flex items-center gap-2 bg-yellow-400/8 border border-yellow-400/20 rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" />
            <span className="text-yellow-400 text-[0.62rem] font-bold tracking-[0.15em] uppercase">Season 3 Active</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight mb-6">
            Welcome Back,{" "}
            <span className="text-yellow-400 [text-shadow:0_0_50px_rgba(250,204,21,0.4)]">
              Champion
            </span>
          </h1>
          <p className="text-white/45 text-lg leading-relaxed max-w-md">
            Your squad is waiting. Log in, lead the charge, and climb the ranks to glory.
          </p>

          {/* Decorative stats */}
          <div className="flex gap-8 mt-12">
            {[
              { value: "12K+", label: "Players" },
              { value: "850+", label: "Squads" },
              { value: "320+", label: "Tournaments" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-black text-yellow-400 leading-none mb-1">{s.value}</div>
                <div className="text-white/35 text-xs font-semibold tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p className="text-white/20 text-xs tracking-wider">
          © 2026 ProMatch · Player Management System
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-black text-[0.65rem] font-black shadow-[0_0_16px_rgba(250,204,21,0.5)]">
            PMS
          </div>
          <span className="text-white font-extrabold text-sm tracking-widest uppercase">ProMatch</span>
        </Link>

        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 md:p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">

            {/* Header */}
            <div className="mb-8">
              <p className="text-yellow-400 text-[0.62rem] font-bold tracking-[0.18em] uppercase mb-2">
                Player Login
              </p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                Enter the Arena
              </h2>
              <p className="text-white/40 text-sm mt-1.5">
                Sign in to your ProMatch account
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 mb-6">
                <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Identifier */}
              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold tracking-widest uppercase">
                  Email / Username / Phone
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <input
                    name="identifier"
                    placeholder="your@email.com"
                    autoComplete="username"
                    required
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-yellow-400/60 focus:bg-yellow-400/[0.03] transition-all"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold tracking-widest uppercase">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl pl-10 pr-12 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-yellow-400/60 focus:bg-yellow-400/[0.03] transition-all"
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-yellow-400 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 relative flex items-center justify-center gap-2 py-3.5 rounded-xl bg-yellow-400 text-black font-extrabold text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(250,204,21,0.35)] hover:bg-yellow-300 hover:shadow-[0_0_40px_rgba(250,204,21,0.55)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    Entering Arena…
                  </>
                ) : (
                  <>
                    Enter the Arena
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/25 text-xs tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm text-white/40">
              New player?{" "}
              <Link
                href="/signup"
                className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
              >
                Create your account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
