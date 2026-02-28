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

// ── Field status badge ────────────────────────────────────────────────────────
function FieldStatus({ state }) {
  if (state === "checking")
    return (
      <svg className="w-4 h-4 text-yellow-400 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
      </svg>
    );
  if (state === "taken")
    return (
      <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  if (state === "available")
    return (
      <svg className="w-4 h-4 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
      </svg>
    );
  return null;
}

function inputBorder(uniqueState, error) {
  if (error) return "border-red-500/60 focus:border-red-500";
  if (uniqueState === "taken") return "border-red-500/60 focus:border-red-500";
  if (uniqueState === "available") return "border-green-500/50 focus:border-green-500";
  return "border-white/[0.08] focus:border-yellow-400/60 focus:bg-yellow-400/[0.03]";
}

// ── Eye icon ──────────────────────────────────────────────────────────────────
function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", phone: "", username: "", password: "", dob: "" });
  const [errors, setErrors] = useState({});
  const [uniqueState, setUniqueState] = useState({ email: "", phone: "", username: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const debounceTimers = useRef({});

  // ── Real-time uniqueness check (debounced 600ms) ───────────────────────────
  const triggerUnique = useCallback((field, value) => {
    clearTimeout(debounceTimers.current[field]);
    if (!value) {
      setUniqueState((s) => ({ ...s, [field]: "" }));
      return;
    }
    // extra format guards before hitting server
    if (field === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return;
    if (field === "phone" && value.length !== 10) return;
    if (field === "username" && value.length < 3) return;

    setUniqueState((s) => ({ ...s, [field]: "checking" }));
    debounceTimers.current[field] = setTimeout(async () => {
      try {
        const { data } = await checkUnique(field, value);
        setUniqueState((s) => ({ ...s, [field]: data.taken ? "taken" : "available" }));
        if (data.taken) {
          setErrors((e) => ({ ...e, [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken` }));
        } else {
          setErrors((e) => { const n = { ...e }; delete n[field]; return n; });
        }
      } catch {
        setUniqueState((s) => ({ ...s, [field]: "" }));
      }
    }, 600);
  }, []);

  // ── Input handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "name") v = value.replace(/[^A-Za-z ]/g, "");
    if (name === "phone") v = value.replace(/\D/g, "").slice(0, 10);

    setForm((f) => ({ ...f, [name]: v }));
    setErrors((er) => { const n = { ...er }; delete n[name]; return n; });

    if (["email", "phone", "username"].includes(name)) {
      triggerUnique(name, v);
    }
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email address";
    if (form.phone.length !== 10) e.phone = "Phone must be exactly 10 digits";
    if (form.username.length < 3) e.username = "Username must be at least 3 characters";
    if (getPasswordStrength(form.password).score < 2) e.password = "Password is too weak";
    if (!form.dob) e.dob = "Date of birth is required";
    else {
      const dob = new Date(form.dob);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0);
      if (age < 16) e.dob = "You must be at least 16 years old";
    }
    if (uniqueState.email === "taken") e.email = "Email is already taken";
    if (uniqueState.phone === "taken") e.phone = "Phone is already taken";
    if (uniqueState.username === "taken") e.username = "Username is already taken";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError("");
    try {
      await signupUser(form);
      router.push("/login");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const pwStrength = getPasswordStrength(form.password);

  return (
    <div className="relative flex min-h-screen bg-[#050508] text-white overflow-hidden">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-yellow-400/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-yellow-400/[0.07] blur-[100px] animate-pulse" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Left panel (desktop) ── */}
      <div className="hidden lg:flex w-5/12 flex-col justify-between px-14 py-12 relative z-10">
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
            Enter the{" "}
            <span className="text-yellow-400 [text-shadow:0_0_50px_rgba(250,204,21,0.4)]">Battlefield</span>
          </h1>
          <p className="text-white/45 text-lg leading-relaxed max-w-md">
            Create your profile, assemble a squad, and compete in tournaments. Your legacy starts here.
          </p>

          {/* Features list */}
          <ul className="mt-10 space-y-3">
            {[
              "Free account — no credit card",
              "Unique gamer tag & credential card",
              "Real-time squad management",
              "Tournament brackets & live standings",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/55">
                <svg className="w-4 h-4 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-white/20 text-xs tracking-wider">© 2026 ProMatch · Player Management System</p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="relative z-10 flex flex-1 items-start justify-center px-6 py-10 overflow-y-auto">
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden absolute top-6 left-6 flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center text-black text-[0.65rem] font-black shadow-[0_0_16px_rgba(250,204,21,0.5)]">
            PMS
          </div>
          <span className="text-white font-extrabold text-sm tracking-widest uppercase">ProMatch</span>
        </Link>

        <div className="w-full max-w-md mt-12 lg:mt-0 lg:my-auto">
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 md:p-10 backdrop-blur-xl shadow-[0_0_80px_rgba(0,0,0,0.5)]">

            {/* Header */}
            <div className="mb-7">
              <p className="text-yellow-400 text-[0.62rem] font-bold tracking-[0.18em] uppercase mb-1.5">New Recruit</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Create Your Account</h2>
              <p className="text-white/40 text-sm mt-1">Fill in the details below to join the arena</p>
            </div>

            {/* Submit error */}
            {submitError && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 mb-5">
                <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-red-400 text-sm">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── NAME ── */}
              <Field label="Full Name" error={errors.name}>
                <div className="relative">
                  <FieldIcon><UserIcon /></FieldIcon>
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Your full name" autoComplete="name"
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition-all ${inputBorder("", errors.name)}`}
                  />
                </div>
              </Field>

              {/* ── USERNAME ── */}
              <Field label="Username / Gamer Tag" error={errors.username}
                hint={uniqueState.username === "available" ? "Username is available!" : uniqueState.username === "taken" ? "Username already taken" : ""}>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </FieldIcon>
                  <input
                    name="username" value={form.username} onChange={handleChange}
                    placeholder="xX_YourTag_Xx" autoComplete="username"
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition-all ${inputBorder(uniqueState.username, errors.username)}`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <FieldStatus state={uniqueState.username} />
                  </div>
                </div>
              </Field>

              {/* ── EMAIL ── */}
              <Field label="Email Address" error={errors.email}
                hint={uniqueState.email === "available" ? "Email is available!" : uniqueState.email === "taken" ? "Email already registered" : ""}>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                    </svg>
                  </FieldIcon>
                  <input
                    type="email" name="email" value={form.email} onChange={handleChange}
                    placeholder="your@email.com" autoComplete="email"
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition-all ${inputBorder(uniqueState.email, errors.email)}`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <FieldStatus state={uniqueState.email} />
                  </div>
                </div>
              </Field>

              {/* ── PHONE ── */}
              <Field label="Phone Number" error={errors.phone}
                hint={uniqueState.phone === "available" ? "Phone is available!" : uniqueState.phone === "taken" ? "Phone already registered" : ""}>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.61 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                    </svg>
                  </FieldIcon>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="10-digit number" autoComplete="tel"
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition-all ${inputBorder(uniqueState.phone, errors.phone)}`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <FieldStatus state={uniqueState.phone} />
                  </div>
                </div>
              </Field>

              {/* ── PASSWORD ── */}
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </FieldIcon>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password" value={form.password} onChange={handleChange}
                    placeholder="••••••••" autoComplete="new-password"
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-white/25 focus:outline-none transition-all ${inputBorder("", errors.password)}`}
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-yellow-400 transition-colors"
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwStrength.score ? pwStrength.color : "bg-white/10"
                            }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-white/35">
                        Use uppercase, numbers & symbols to strengthen
                      </p>
                      {pwStrength.label && (
                        <span className={`text-xs font-bold ${pwStrength.score <= 1 ? "text-red-400"
                            : pwStrength.score <= 2 ? "text-orange-400"
                              : pwStrength.score <= 3 ? "text-yellow-400"
                                : "text-green-400"
                          }`}>
                          {pwStrength.label}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Field>

              {/* ── DOB ── */}
              <Field label="Date of Birth" error={errors.dob}>
                <div className="relative">
                  <FieldIcon>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </FieldIcon>
                  <input
                    type="date" name="dob" value={form.dob} onChange={handleChange}
                    className={`w-full bg-black/30 border rounded-xl pl-10 pr-4 py-3 text-sm text-white/80 focus:outline-none transition-all [color-scheme:dark] ${inputBorder("", errors.dob)}`}
                  />
                </div>
                {!errors.dob && <p className="text-white/30 text-xs mt-1">Must be 16 years or older</p>}
              </Field>

              {/* ── SUBMIT ── */}
              <button
                type="submit" disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-yellow-400 text-black font-extrabold text-sm tracking-widest uppercase shadow-[0_0_25px_rgba(250,204,21,0.35)] hover:bg-yellow-300 hover:shadow-[0_0_40px_rgba(250,204,21,0.55)] hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
                    </svg>
                    Creating Account…
                  </>
                ) : (
                  <>
                    Join the Arena
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-white/25 text-xs tracking-widest uppercase">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            <p className="text-center text-sm text-white/40">
              Already a player?{" "}
              <Link href="/login" className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors">
                Log in →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-white/60 text-[0.68rem] font-semibold tracking-widest uppercase">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {error}
      </p>}
      {!error && hint && <p className={`text-xs flex items-center gap-1 ${hint.includes("available") ? "text-green-400" : "text-red-400"}`}>
        {hint}
      </p>}
    </div>
  );
}

function FieldIcon({ children }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
      {children}
    </div>
  );
}

function UserIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
