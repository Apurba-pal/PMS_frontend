"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { signupUser, checkUnique } from "@/services/authService";
import Link from "next/link";

// ── Password strength ─────────────────────────────────────────────────────────
function getPasswordStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: "", color: "" },
    { label: "Weak", color: "bg-red-500" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-400" },
    { label: "Strong", color: "bg-green-400" },
    { label: "Elite", color: "bg-emerald-400" },
  ];
  return { score, ...levels[score] };
}

// ── Inline field status icon ──────────────────────────────────────────────────
function StatusIcon({ state }) {
  if (state === "checking")
    return <svg className="w-3.5 h-3.5 text-yellow-400 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>;
  if (state === "taken")
    return <svg className="w-3.5 h-3.5 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
  if (state === "available")
    return <svg className="w-3.5 h-3.5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>;
  return null;
}

function borderClass(unique, error) {
  if (error || unique === "taken") return "border-red-500/50 focus:border-red-500/70 bg-red-500/[0.04]";
  if (unique === "available") return "border-green-500/50 focus:border-green-500/70 bg-green-500/[0.04]";
  return "border-white/10 focus:border-yellow-400/50 focus:bg-yellow-400/[0.03]";
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", username: "", password: "", dob: "" });
  const [errors, setErrors] = useState({});
  const [uniqueState, setUniqueState] = useState({ email: "", phone: "", username: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const timers = useRef({});

  const triggerUnique = useCallback((field, value) => {
    clearTimeout(timers.current[field]);
    if (!value) { setUniqueState(s => ({ ...s, [field]: "" })); return; }
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    if (field === "phone" && value.length !== 10) return;
    if (field === "username" && value.length < 3) return;
    setUniqueState(s => ({ ...s, [field]: "checking" }));
    timers.current[field] = setTimeout(async () => {
      try {
        const { data } = await checkUnique(field, value);
        setUniqueState(s => ({ ...s, [field]: data.taken ? "taken" : "available" }));
        if (data.taken)
          setErrors(e => ({ ...e, [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} already taken` }));
        else
          setErrors(e => { const n = { ...e }; delete n[field]; return n; });
      } catch { setUniqueState(s => ({ ...s, [field]: "" })); }
    }, 600);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "name") v = value.replace(/[^A-Za-z ]/g, "");
    if (name === "phone") v = value.replace(/\D/g, "").slice(0, 10);
    setForm(f => ({ ...f, [name]: v }));
    setErrors(er => { const n = { ...er }; delete n[name]; return n; });
    if (["email", "phone", "username"].includes(name)) triggerUnique(name, v);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (form.phone.length !== 10) e.phone = "Must be exactly 10 digits";
    if (form.username.length < 3) e.username = "Min 3 characters";
    if (getPasswordStrength(form.password).score < 2) e.password = "Password too weak";
    if (!form.dob) e.dob = "Required";
    else {
      const age = new Date().getFullYear() - new Date(form.dob).getFullYear();
      if (age < 16) e.dob = "Must be 16+";
    }
    if (uniqueState.email === "taken") e.email = "Email already taken";
    if (uniqueState.phone === "taken") e.phone = "Phone already taken";
    if (uniqueState.username === "taken") e.username = "Username already taken";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setSubmitError("");
    try { await signupUser(form); router.push("/login"); }
    catch (err) { setSubmitError(err.response?.data?.message || "Signup failed. Please try again."); }
    finally { setLoading(false); }
  };

  const pw = getPasswordStrength(form.password);

  return (
    <div className="relative min-h-screen bg-[#050508] text-white flex flex-col overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-yellow-400/[0.07] blur-[130px]" />
        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-yellow-400/[0.05] blur-[110px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: "linear-gradient(rgba(250,204,21,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(250,204,21,0.035) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />
      </div>

      {/* ── Top navbar ── */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-8 h-14 border-b border-white/[0.06] bg-black/30 backdrop-blur-md shrink-0">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 bg-yellow-400 rounded-md flex items-center justify-center text-black text-[0.6rem] font-black shadow-[0_0_14px_rgba(250,204,21,0.45)]">PMS</div>
          <span className="text-white font-extrabold text-sm tracking-[0.12em] uppercase">ProMatch</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-white/40 text-xs">Already a player?</span>
          <Link href="/login" className="text-yellow-400 text-xs font-semibold hover:text-yellow-300 transition-colors">Log In →</Link>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6">
        <div className="w-full max-w-3xl">

          {/* Page heading */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-yellow-400/[0.08] border border-yellow-400/20 rounded-full px-3 py-1 mb-2 md:mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" />
              <span className="text-yellow-400 text-[0.6rem] font-bold tracking-[0.15em] uppercase">Season 3 Active · Free to Join</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Enter the <span className="text-yellow-400 [text-shadow:0_0_40px_rgba(250,204,21,0.35)]">Battlefield</span>
            </h1>
            <p className="text-white/40 text-sm mt-1.5">Create your account and start competing</p>
          </div>

          {/* Card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-6 md:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_rgba(0,0,0,0.5)]">

            {/* Error banner */}
            {submitError && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-5 text-red-400 text-sm">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* ── Grid: 3 rows × 2 cols ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">

                {/* Full Name */}
                <FormField label="Full Name" error={errors.name}>
                  <Input name="name" value={form.value} placeholder="Your full name" autoComplete="name"
                    borderClass={borderClass("", errors.name)} onChange={handleChange}
                    icon={<UserSvg />} />
                </FormField>

                {/* Username */}
                <FormField label="Username / Gamer Tag" error={errors.username}
                  hint={uniqueState.username === "available" ? "✓ Available" : ""}
                  hintGreen={uniqueState.username === "available"}>
                  <div className="relative">
                    <Input name="username" value={form.username} placeholder="xX_YourTag_Xx" autoComplete="username"
                      borderClass={borderClass(uniqueState.username, errors.username)} onChange={handleChange}
                      icon={<TagSvg />} rightPad />
                    <Abs><StatusIcon state={uniqueState.username} /></Abs>
                  </div>
                </FormField>

                {/* Email */}
                <FormField label="Email Address" error={errors.email}
                  hint={uniqueState.email === "available" ? "✓ Available" : ""}
                  hintGreen={uniqueState.email === "available"}>
                  <div className="relative">
                    <Input type="email" name="email" value={form.email} placeholder="you@email.com" autoComplete="email"
                      borderClass={borderClass(uniqueState.email, errors.email)} onChange={handleChange}
                      icon={<MailSvg />} rightPad />
                    <Abs><StatusIcon state={uniqueState.email} /></Abs>
                  </div>
                </FormField>

                {/* Phone */}
                <FormField label="Phone Number" error={errors.phone}
                  hint={uniqueState.phone === "available" ? "✓ Available" : ""}
                  hintGreen={uniqueState.phone === "available"}>
                  <div className="relative">
                    <Input type="tel" name="phone" value={form.phone} placeholder="10-digit number" autoComplete="tel"
                      borderClass={borderClass(uniqueState.phone, errors.phone)} onChange={handleChange}
                      icon={<PhoneSvg />} rightPad />
                    <Abs><StatusIcon state={uniqueState.phone} /></Abs>
                  </div>
                </FormField>

                {/* Password */}
                <FormField label="Password" error={errors.password}>
                  <div className="relative">
                    <Input type={showPassword ? "text" : "password"} name="password" value={form.password}
                      placeholder="Create a strong password" autoComplete="new-password"
                      borderClass={borderClass("", errors.password)} onChange={handleChange}
                      icon={<LockSvg />} rightPad />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-yellow-400 transition-colors">
                      {showPassword
                        ? <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                  {/* Strength bar */}
                  {form.password && (
                    <div className="mt-1.5 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= pw.score ? pw.color : "bg-white/10"}`} />
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[0.58rem] text-white/30">8+ chars · uppercase · symbols</span>
                        {pw.label && <span className={`text-[0.58rem] font-bold ${pw.score <= 1 ? "text-red-400" : pw.score <= 2 ? "text-orange-400" : pw.score <= 3 ? "text-yellow-400" : "text-green-400"}`}>{pw.label}</span>}
                      </div>
                    </div>
                  )}
                </FormField>

                {/* Date of Birth */}
                <FormField label="Date of Birth" error={errors.dob} hint={!errors.dob ? "Must be 16 or older" : ""}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                      <CalSvg />
                    </span>
                    <input type="date" name="dob" value={form.dob} onChange={handleChange}
                      className={`w-full bg-black/25 border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white/80 focus:outline-none transition-all [color-scheme:dark] ${borderClass("", errors.dob)}`}
                    />
                  </div>
                </FormField>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-400 text-black font-extrabold text-sm tracking-widest uppercase shadow-[0_0_24px_rgba(250,204,21,0.3)] hover:bg-yellow-300 hover:shadow-[0_0_40px_rgba(250,204,21,0.5)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all">
                {loading ? (
                  <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>Creating Account…</>
                ) : (
                  <>Join the Arena <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                )}
              </button>
            </form>
          </div>

          {/* Bottom note */}
          <p className="text-center text-white/25 text-xs mt-4">
            By joining you agree to our terms · © 2026 ProMatch
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Tiny component helpers ────────────────────────────────────────────────────
function FormField({ label, error, hint, hintGreen, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.62rem] font-bold tracking-[0.14em] uppercase text-white/50">{label}</label>
      {children}
      {error && <p className="text-[0.65rem] text-red-400 flex items-center gap-1"><svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>{error}</p>}
      {!error && hint && <p className={`text-[0.65rem] ${hintGreen ? "text-green-400" : "text-white/30"}`}>{hint}</p>}
    </div>
  );
}

function Input({ icon, rightPad, borderClass: bc, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">{icon}</span>
      <input {...props}
        className={`w-full bg-black/25 border rounded-xl pl-9 ${rightPad ? "pr-9" : "pr-3"} py-2.5 text-sm text-white placeholder-white/20 focus:outline-none transition-all ${bc}`}
      />
    </div>
  );
}

function Abs({ children }) {
  return <div className="absolute right-3 top-1/2 -translate-y-1/2">{children}</div>;
}

// SVG icons
const UserSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const TagSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
const MailSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const PhoneSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" /></svg>;
const LockSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const CalSvg = () => <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
