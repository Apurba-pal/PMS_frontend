"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Gamepad2, QrCode, Users, Shield, MapPin, Calendar, Pencil, Crown, Plus } from "lucide-react";
import { getMyProfile } from "@/services/profileService";

const calculateAge = (dob) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const STATUS_DOT = { ACTIVE: "#22c55e", INACTIVE: "#52525b", LOOKING: "#facc15" };
const STATUS_TEXT = { ACTIVE: "Active", INACTIVE: "Inactive", LOOKING: "Looking" };

export default function PlayerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyProfile();
        setProfile(data);
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

  const age = calculateAge(profile.user?.dob);
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
              width: "200%",
              height: "100%",
              background: "linear-gradient(105deg, transparent 38%, #facc1510 38.5%, #facc1510 44%, transparent 44.5%)",
            }} />
          {/* thin crisp yellow line */}
          <div className="absolute"
            style={{
              width: "200%",
              height: "100%",
              background: "linear-gradient(105deg, transparent 38%, #facc1540 38.1%, #facc1540 38.4%, transparent 38.5%)",
            }} />
          <div className="absolute"
            style={{
              width: "200%",
              height: "100%",
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

            {/* username + squad */}
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              <span className="text-zinc-400 text-sm">@{profile.user?.username}</span>
              {profile.currentSquad && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-white bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-lg">
                  <Shield size={11} className="text-yellow-400" />
                  {profile.currentSquad.squadName}
                </span>
              )}
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
    </div>
  );
}
