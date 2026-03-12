"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Gamepad2, QrCode, Users, Shield, MapPin, Calendar,
  Pencil, Crown, Plus, ShieldCheck, ShieldAlert, ShieldOff,
  Upload, Loader2, CheckCircle2, Clock4, XCircle,
} from "lucide-react";
import { getMyProfile, submitVerificationRequest } from "@/services/profileService";
import { getMe } from "@/services/authService";

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const STATUS_DOT  = { ACTIVE: "#22c55e", INACTIVE: "#52525b", LOOKING: "#facc15" };
const STATUS_TEXT = { ACTIVE: "Active",  INACTIVE: "Inactive", LOOKING: "Looking" };

/* ─── Verification status config ──────────────────── */
const VS = {
  UNVERIFIED:    {
    label: "Not Verified",
    color: "text-zinc-400",
    border: "border-zinc-700",
    bg: "bg-zinc-900/50",
    icon: ShieldOff,
    iconColor: "text-zinc-500",
    iconBg: "bg-zinc-800 border-zinc-700",
    pill: "bg-zinc-800 text-zinc-400 border-zinc-700",
    canSubmit: true,
  },
  PENDING_REVIEW: {
    label: "Pending Review",
    color: "text-yellow-400",
    border: "border-yellow-400/25",
    bg: "bg-yellow-400/5",
    icon: Clock4,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-400/10 border-yellow-400/20",
    pill: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
    canSubmit: false,
  },
  VERIFIED: {
    label: "ID Verified",
    color: "text-green-400",
    border: "border-green-400/25",
    bg: "bg-green-400/5",
    icon: CheckCircle2,
    iconColor: "text-green-400",
    iconBg: "bg-green-400/10 border-green-400/20",
    pill: "bg-green-400/10 text-green-400 border-green-400/25",
    canSubmit: false,
  },
  DISABLED: {
    label: "Account Disabled",
    color: "text-red-400",
    border: "border-red-400/25",
    bg: "bg-red-400/5",
    icon: XCircle,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/10 border-red-400/20",
    pill: "bg-red-400/10 text-red-400 border-red-400/25",
    canSubmit: false,
  },
};

/* ─── Inline verification badge (for the card) ──── */
function VerificationBadge({ accountStatus }) {
  const cfg = VS[accountStatus] ?? VS.UNVERIFIED;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.pill}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

/* ─── Full verification section ─────────────────── */
function VerificationSection({ accountStatus, onStatusChange }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const cfg = VS[accountStatus] ?? VS.UNVERIFIED;
  const Icon = cfg.icon;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    try {
      const { data } = await submitVerificationRequest(file);
      showToast("Verification request submitted successfully!");
      onStatusChange(data.accountStatus);
      setFile(null);
      setPreview(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Submission failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden relative`}>

      {/* Toast */}
      {toast && (
        <div className={`absolute top-4 right-4 z-10 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>{toast.msg}</div>
      )}

      {/* Section header */}
      <div className="px-6 py-4 border-b border-zinc-800/60 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${cfg.iconBg}`}>
          <ShieldCheck size={15} className={cfg.iconColor} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">ID Verification</h3>
          <p className="text-[11px] text-zinc-500">Prove your identity to unlock verified status</p>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Status visual block ── */}
        <div className={`flex items-center gap-5 p-5 rounded-xl border ${cfg.border} bg-black/20`}>
          {/* Big icon */}
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shrink-0 ${cfg.iconBg} relative`}>
            <Icon size={28} className={cfg.iconColor} />
            {accountStatus === "VERIFIED" && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 size={12} className="text-white" />
              </span>
            )}
            {accountStatus === "PENDING_REVIEW" && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Clock4 size={11} className="text-black" />
              </span>
            )}
          </div>

          {/* Status text */}
          <div className="flex-1">
            <p className={`font-extrabold text-base tracking-tight ${cfg.color}`}>{cfg.label}</p>
            <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
              {accountStatus === "VERIFIED"
                ? "Your identity has been confirmed by an admin. Your profile displays a verified badge."
                : accountStatus === "PENDING_REVIEW"
                ? "Your ID proof has been submitted and is awaiting admin review. This usually takes 24–48 hours."
                : accountStatus === "DISABLED"
                ? "Your account has been disabled by an admin. Please contact support."
                : "Your identity hasn't been verified yet. Submit a government-issued ID to get verified."}
            </p>
          </div>

          {/* Step indicators */}
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            {[
              { done: ["PENDING_REVIEW","VERIFIED"].includes(accountStatus), label: "Submitted" },
              { done: accountStatus === "VERIFIED", label: "Approved" },
            ].map(({ done, label }, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                  done ? "border-green-500 bg-green-500" : "border-zinc-700 bg-transparent"
                }`}>
                  {done && <CheckCircle2 size={10} className="text-white" />}
                </div>
                <span className={`text-[10px] font-semibold ${done ? "text-zinc-300" : "text-zinc-600"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upload area (only if can submit) ── */}
        {cfg.canSubmit && (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mb-2">Upload ID Proof</p>
              <p className="text-zinc-600 text-xs mb-3">
                Accepted: Aadhaar, Passport, Voter ID, Driving License. Image must clearly show your name & photo.
              </p>

              <label className={`flex items-center gap-4 p-4 rounded-xl border border-dashed cursor-pointer transition group ${
                preview
                  ? "border-yellow-400/30 bg-yellow-400/5"
                  : "border-zinc-700 hover:border-zinc-500 bg-black/20"
              }`}>
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-zinc-700 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-yellow-400 text-sm font-semibold truncate">{file?.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">Click to change file</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 group-hover:border-zinc-600 transition">
                      <Upload size={18} className="text-zinc-500 group-hover:text-zinc-300 transition" />
                    </div>
                    <div>
                      <p className="text-zinc-300 text-sm font-medium">Click to select file</p>
                      <p className="text-zinc-600 text-xs mt-0.5">JPG, PNG — max 5MB</p>
                    </div>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!file || submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-yellow-400 text-black text-sm font-extrabold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                : <><ShieldCheck size={15} /> Submit for Verification</>
              }
            </button>
          </>
        )}

        {/* Re-submission note for rejected (back to UNVERIFIED) */}
        {accountStatus === "UNVERIFIED" && (
          <p className="text-zinc-600 text-xs text-center">
            Previously rejected? You can re-submit a clearer image above.
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function PlayerProfilePage() {
  const router = useRouter();
  const [profile, setProfile]     = useState(null);
  const [accountStatus, setAccountStatus] = useState("UNVERIFIED");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, meRes] = await Promise.all([getMyProfile(), getMe()]);
        setProfile(profileRes.data);
        setAccountStatus(meRes.data.accountStatus ?? "UNVERIFIED");
      } catch (err) {
        if (err.response?.status !== 404) console.error(err);
        setProfile(null);
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
        <User size={36} className="text-yellow-400" />
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">No Profile Yet</h2>
        <p className="text-zinc-400 mt-2 max-w-sm mx-auto text-sm">Create your player profile to join squads and compete.</p>
      </div>
      <button onClick={() => router.push("/dashboard/profile/edit")}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20">
        <Plus size={16} /> Create Profile
      </button>
    </div>
  );

  const age    = calculateAge(profile.user?.dob);
  const status = profile.playerStatus || "INACTIVE";
  const igName = profile.inGameName || profile.user?.name || "PLAYER";

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-4">

      {/* ══════════════════════════════════════════════
          OPERATOR CREDENTIAL CARD
      ══════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-black"
        style={{ minHeight: 260 }}>

        {/* ── decorative scanline texture ── */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)",
            backgroundSize: "100% 3px",
          }} />

        {/* ── diagonal yellow slash ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute"
            style={{
              width: "200%", height: "100%",
              background: "linear-gradient(105deg, transparent 38%, #facc1510 38.5%, #facc1510 44%, transparent 44.5%)",
            }} />
          <div className="absolute"
            style={{
              width: "200%", height: "100%",
              background: "linear-gradient(105deg, transparent 38%, #facc1540 38.1%, #facc1540 38.4%, transparent 38.5%)",
            }} />
          <div className="absolute"
            style={{
              width: "200%", height: "100%",
              background: "linear-gradient(105deg, transparent 43.6%, #facc1540 43.7%, #facc1540 44%, transparent 44.1%)",
            }} />
        </div>

        {/* ── top-left classification label ── */}
        <div className="absolute top-4 left-6 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/40" />
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/20" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-[4px] text-zinc-500">
            Player ID
          </span>
        </div>

        {/* ── edit button ── */}
        <button onClick={() => router.push("/dashboard/profile/edit")}
          className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-500 text-xs hover:text-yellow-400 hover:border-yellow-400/30 transition z-10">
          <Pencil size={11} /> Edit
        </button>

        {/* ── main card body ── */}
        <div className="relative flex flex-col md:flex-row items-center md:items-stretch gap-0 pt-10">

          {/* LEFT: avatar column */}
          <div className="flex flex-col items-center justify-center px-8 py-6 md:border-r border-zinc-800/60 shrink-0">
            {/* avatar with glow ring */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-full opacity-30 blur-md"
                style={{ background: STATUS_DOT[status] }} />
              <div className="relative w-28 h-28 rounded-full border-2 border-yellow-400/30 overflow-hidden flex items-center justify-center bg-zinc-900 shadow-2xl">
                {profile.profilePhoto
                  ? <img src={profile.profilePhoto} className="w-full h-full object-cover" alt={igName} />
                  : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                      <span className="text-black font-black text-4xl uppercase select-none">{igName[0]}</span>
                    </div>
                  )
                }
              </div>
              {/* status ring indicator */}
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-[3px] border-black"
                style={{ background: STATUS_DOT[status] }} />
            </div>
            {/* status text */}
            <span className="mt-3 text-[10px] font-bold uppercase tracking-[3px]"
              style={{ color: STATUS_DOT[status] }}>
              {STATUS_TEXT[status]}
            </span>
          </div>

          {/* RIGHT: identity block */}
          <div className="flex-1 flex flex-col justify-center px-6 md:px-8 pb-6 md:py-6 min-w-0">

            {/* gamer tag — massive */}
            <p className="text-[10px] font-bold uppercase tracking-[4px] text-zinc-500 mb-1">In-Game Name</p>
            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none truncate"
              style={{ textShadow: "0 0 40px rgba(250,204,21,0.08)" }}>
              {igName}
            </h1>

            {/* username + squad + VERIFICATION BADGE */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400 text-sm">@{profile.user?.username}</span>
              {profile.currentSquad && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg">
                  <Shield size={11} className="text-yellow-400" />
                  {profile.currentSquad.squadName}
                </span>
              )}
              {/* 🔑 Verification badge inline with name */}
              <VerificationBadge accountStatus={accountStatus} />
            </div>

            {/* meta strip */}
            <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-zinc-400">
              {profile.gameUID && (
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-500">UID</span>
                  <span className="font-mono font-bold text-yellow-400 tracking-widest">{profile.gameUID}</span>
                </div>
              )}
              {profile.state && <span className="flex items-center gap-1 text-zinc-300"><MapPin size={11} className="text-zinc-500" />{profile.state}</span>}
              {age && <span className="flex items-center gap-1 text-zinc-300"><Calendar size={11} className="text-zinc-500" />{age} yrs</span>}
            </div>

            {/* roles */}
            {profile.roles?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.roles.map((r) => (
                  <span key={r}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-yellow-400/5 border border-yellow-400/15 text-yellow-300">
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── bottom strip ── */}
        <div className="border-t border-zinc-800/60 px-8 py-3 flex items-center gap-6 text-[10px] uppercase tracking-[3px] text-zinc-500 font-semibold">
          <span>PMS Esports</span>
          <span className="ml-auto flex items-center gap-2">
            <span className="w-px h-3 bg-zinc-800" />
            <span className="font-mono">#{profile.user?.username?.toUpperCase()}</span>
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          BOTTOM GRID: squad history + QR
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* squad history — 2 cols */}
        <div className="md:col-span-2 rounded-2xl bg-zinc-950 border border-zinc-800/60 p-5">
          <h3 className="text-[10px] uppercase tracking-[3px] text-zinc-400 font-bold mb-4 flex items-center gap-2">
            <Users size={12} /> Squad History
          </h3>
          {profile.previousSquads?.length ? (
            <div className="space-y-2">
              {profile.previousSquads.map((sq) => (
                <div key={sq._id}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700 transition">
                  <Crown size={13} className="text-zinc-600 group-hover:text-yellow-400/60 transition shrink-0" />
                  <span className="text-zinc-200 text-sm truncate flex-1">{sq.squadName}</span>
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Former</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-6 gap-2">
              <Users size={24} className="text-zinc-700" />
              <p className="text-zinc-500 text-sm">No previous squads</p>
            </div>
          )}
        </div>

        {/* QR */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800/60 p-5 flex flex-col items-center justify-center gap-3">
          <h3 className="text-[10px] uppercase tracking-[3px] text-zinc-400 font-bold flex items-center gap-2">
            <QrCode size={12} /> QR Code
          </h3>
          <div className="w-32 h-32 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
            {profile.profileQR
              ? <img src={profile.profileQR} className="w-full h-full object-cover" alt="QR" />
              : <QrCode size={44} className="text-zinc-600" />
            }
          </div>
          {!profile.profileQR && (
            <p className="text-zinc-500 text-[10px] text-center tracking-wide uppercase">Not generated yet</p>
          )}
        </div>

      </div>

      {/* ══════════════════════════════════════════════
          ID VERIFICATION SECTION
      ══════════════════════════════════════════════ */}
      <VerificationSection
        accountStatus={accountStatus}
        onStatusChange={setAccountStatus}
      />

    </div>
  );
}
