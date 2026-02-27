"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  Crown,
  ChevronRight,
  Calendar,
  IndianRupee,
  Swords,
  Flame,
  Clock,
  Shield,
  Star,
  Zap,
  CheckCircle,
} from "lucide-react";
import { getMe } from "@/services/authService";
import { useSquadStore } from "@/store/squadStore";

/* ─── dummy tournament data ─────────────────────── */
const TOURNAMENTS = [
  {
    id: 1,
    name: "BGMI Pro League — Season 4",
    game: "BGMI",
    format: "Squad (4v4)",
    prizePool: "₹1,00,000",
    status: "OPEN",
    statusLabel: "Registrations Open",
    slots: { filled: 28, total: 32 },
    startDate: "Mar 15, 2026",
    daysLeft: 16,
    featured: true,
  },
  {
    id: 2,
    name: "Free Fire Grand Slam",
    game: "Free Fire",
    format: "Squad (4v4)",
    prizePool: "₹50,000",
    status: "OPEN",
    statusLabel: "Registrations Open",
    slots: { filled: 12, total: 20 },
    startDate: "Mar 22, 2026",
    daysLeft: 23,
    featured: false,
  },
  {
    id: 3,
    name: "Valorant City Cup — Spring",
    game: "Valorant",
    format: "Squad (5v5)",
    prizePool: "₹75,000",
    status: "UPCOMING",
    statusLabel: "Coming Soon",
    slots: { filled: 0, total: 16 },
    startDate: "Apr 5, 2026",
    daysLeft: 37,
    featured: false,
  },
];

const statusStyle = {
  OPEN: "bg-green-400/10  text-green-400  border-green-400/20",
  UPCOMING: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  ONGOING: "bg-blue-400/10   text-blue-400   border-blue-400/20",
  ENDED: "bg-zinc-800      text-zinc-500   border-zinc-700",
};

const gameColor = {
  BGMI: "text-orange-400",
  "Free Fire": "text-green-400",
  Valorant: "text-blue-400",
};

/* ─── featured tournament card ──────────────────── */
function FeaturedCard({ t, onRegister }) {
  const fill = Math.round((t.slots.filled / t.slots.total) * 100);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 p-6 md:p-8">
      {/* glow */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-400/6 rounded-full blur-3xl pointer-events-none" />
      {/* featured badge */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-yellow-400 text-black text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
        <Star size={9} fill="currentColor" /> Featured
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <Trophy size={20} className="text-yellow-400" />
          </div>
          <div>
            <span className={`text-[11px] font-bold uppercase tracking-widest ${gameColor[t.game] || "text-zinc-400"}`}>
              {t.game}
            </span>
            <p className="text-xs text-zinc-500">{t.format}</p>
          </div>
          <span className={`ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusStyle[t.status]}`}>
            {t.statusLabel}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
          {t.name}
        </h2>

        <div className="flex items-center gap-5 flex-wrap mt-3">
          <div className="flex items-center gap-1.5 text-yellow-400">
            <IndianRupee size={14} />
            <span className="text-sm font-bold">{t.prizePool} Prize Pool</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Calendar size={13} />
            <span className="text-sm">{t.startDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Clock size={13} />
            <span className="text-sm">{t.daysLeft} days left</span>
          </div>
        </div>

        {/* slot bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-zinc-500">Squad slots</span>
            <span className="text-xs text-zinc-400 font-medium">{t.slots.filled}/{t.slots.total} filled</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-700"
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20"
          >
            <Zap size={14} /> Register Squad
          </button>
          <button
            onClick={onRegister}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 transition"
          >
            View Details <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── small tournament row ──────────────────────── */
function TournamentRow({ t, onRegister }) {
  const fill = Math.round((t.slots.filled / t.slots.total) * 100);
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
        <Trophy size={17} className="text-yellow-400/60" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-semibold truncate">{t.name}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
          <span className={gameColor[t.game] || "text-zinc-400"}>{t.game}</span>
          <span>{t.format}</span>
          <span className="flex items-center gap-1"><Calendar size={10} />{t.startDate}</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden mt-2 w-24">
          <div className="h-full bg-yellow-400/60 rounded-full" style={{ width: `${fill}%` }} />
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[t.status]}`}>
          {t.statusLabel}
        </span>
        <span className="text-yellow-400 text-xs font-bold">{t.prizePool}</span>
      </div>
      {t.status === "OPEN" && (
        <button
          onClick={onRegister}
          className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition"
        >
          Register
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function DashboardHome() {
  const router = useRouter();
  const { squad, fetchMySquad } = useSquadStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [meRes] = await Promise.all([getMe(), fetchMySquad()]);
        setUser(meRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    init();
  }, []);

  const isIGL = squad?.members?.find((m) => m.player._id === user?.userId)?.isIGL;
  const memberCount = squad?.members?.length ?? 0;
  const maxSize = squad?.maxSize ?? 5;

  const featured = TOURNAMENTS[0];
  const others = TOURNAMENTS.slice(1);

  const goToTournaments = () => router.push("/dashboard/tournaments");

  return (
    <div className="space-y-8 pb-10">

      {/* ══ SECTION HEADER ════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Flame size={22} className="text-yellow-400" />
            Upcoming Tournaments
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Register your squad and compete for prize money</p>
        </div>
        <button
          onClick={goToTournaments}
          className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-yellow-400 transition"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>

      {/* ══ FEATURED TOURNAMENT ═══════════════════════ */}
      <FeaturedCard t={featured} onRegister={goToTournaments} />

      {/* ══ OTHER TOURNAMENTS ══════════════════════════ */}
      <div className="space-y-3">
        {others.map((t) => (
          <TournamentRow key={t.id} t={t} onRegister={goToTournaments} />
        ))}
      </div>

      {/* ══ BOTTOM ROW: Squad context + My Registrations ═ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Squad snapshot */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Shield size={13} /> Your Squad
            </span>
            <button
              onClick={() => router.push("/dashboard/squad")}
              className="text-xs text-zinc-500 hover:text-yellow-400 transition flex items-center gap-1"
            >
              Manage <ChevronRight size={12} />
            </button>
          </div>

          {squad ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                  {squad.logo
                    ? <img src={squad.logo} className="w-full h-full object-cover" alt={squad.squadName} />
                    : <Swords size={17} className="text-yellow-400/60" />
                  }
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{squad.squadName}</p>
                  <p className="text-zinc-500 text-xs">{squad.game} · {memberCount}/{maxSize} members</p>
                </div>
                {isIGL && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                    <Crown size={9} /> IGL
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {squad.members.map((m) => (
                  <span key={m.player._id}
                    className={`text-xs px-2.5 py-1 rounded-xl border font-medium
                      ${m.isIGL ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400" : "bg-zinc-800 border-zinc-700 text-zinc-300"}`}>
                    {m.player.name.split(" ")[0]}
                  </span>
                ))}
                {Array.from({ length: maxSize - memberCount }).map((_, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-xl border border-dashed border-zinc-800 text-zinc-700">Open</span>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <Swords size={28} className="mx-auto text-zinc-700 mb-2" />
              <p className="text-zinc-500 text-sm">No squad yet</p>
              <button
                onClick={() => router.push("/dashboard/squad")}
                className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition"
              >
                Create or Join
              </button>
            </div>
          )}
        </div>

        {/* My registrations */}
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Trophy size={13} /> My Registrations
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 py-6 text-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-800 flex items-center justify-center">
              <CheckCircle size={18} className="text-zinc-700" />
            </div>
            <p className="text-zinc-500 text-sm">No active registrations</p>
            <p className="text-zinc-700 text-xs max-w-[180px]">Register your squad for a tournament to track it here</p>
          </div>
        </div>

      </div>
    </div>
  );
}
