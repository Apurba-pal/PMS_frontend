"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSquadStore } from "@/store/squadStore";
import { getMe } from "@/services/authService";
import {
  Users,
  Plus,
  Search,
  Crown,
  ShieldCheck,
  LogOut,
  UserX,
  Mail,
  Send,
  UserCheck,
  Swords,
  ChevronRight,
  Flame,
} from "lucide-react";
import {
  getSquadJoinRequests,
  getSquadLeaveRequests,
  getMyInvites,
  requestLeaveSquad,
  disbandSquad,
  kickPlayer,
  transferIGL,
} from "@/services/squadService";

/* ─── helpers ───────────────────────────────────── */
const roleColor = {
  PRIMARY: "text-yellow-400 bg-yellow-400/10",
  SECONDARY: "text-blue-400   bg-blue-400/10",
  SNIPER: "text-red-400    bg-red-400/10",
  NADER: "text-green-400  bg-green-400/10",
};

function Initials({ name }) {
  const parts = (name || "?").split(" ");
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
      <span className="text-black font-bold text-sm uppercase">{letters}</span>
    </div>
  );
}

function NavBtn({ label, onClick, count, primary }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
        ${primary
          ? "bg-yellow-400 text-black hover:bg-yellow-300 shadow-md shadow-yellow-400/20"
          : "bg-black/30 border border-zinc-700 text-zinc-300 hover:border-yellow-400/50 hover:text-yellow-400"
        }`}
    >
      <span className="flex-1 text-left">{label}</span>
      {count > 0 && (
        <span className="bg-black text-yellow-400 border border-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {count}
        </span>
      )}
      <ChevronRight size={13} className="opacity-40 shrink-0" />
    </button>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function SquadPage() {
  const router = useRouter();
  const { squad, loading, fetchMySquad, clearSquad, refreshSquad } = useSquadStore();

  const [joinCount, setJoinCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [myInviteCount, setMyInviteCount] = useState(0);
  const [leavePending, setLeavePending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [actionsOpen, setActionsOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await getMe();
        setCurrentUserId(data.userId);
      } catch (err) { console.error(err); }
    };
    init();
    fetchMySquad();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      if (!squad || !currentUserId) return;
      const isLeader = squad.members.find((m) => m.player._id === currentUserId)?.isIGL === true;
      if (!isLeader) return;
      try {
        const [{ data: jd }, { data: ld }, { data: id }] = await Promise.all([
          getSquadJoinRequests(),
          getSquadLeaveRequests(),
          getMyInvites(),
        ]);
        setJoinCount(jd.length);
        setLeaveCount(ld.length);
        setMyInviteCount(id.filter((i) => i.status === "PENDING").length);
      } catch (err) { console.error(err); }
    };
    loadCounts();
  }, [squad, currentUserId]);

  const isIGL = squad?.members?.find((m) => m.player._id === currentUserId)?.isIGL === true;
  const totalAlerts = joinCount + leaveCount + myInviteCount;

  /* ── LOADING ─────────────────────────────────────── */
  if (loading) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm">Loading squad…</p>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     NO SQUAD
  ═══════════════════════════════════════════════════ */
  if (!squad) return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 mb-2">
            <Swords size={36} className="text-yellow-400" />
          </div>
          <h1 className="text-5xl font-extrabold text-white tracking-tight">No Squad Yet</h1>
          <p className="text-zinc-400 text-lg max-w-sm mx-auto">
            Form your crew, dominate tournaments, and rise through the ranks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <Plus size={22} />, title: "Create a Squad", desc: "Start fresh as IGL and build your roster.", primary: true, href: "/dashboard/squad/create" },
            { icon: <Search size={22} />, title: "Find a Squad", desc: "Browse active squads and request to join.", href: "/dashboard/squad/search" },
            { icon: <Mail size={22} />, title: "My Invites", desc: "View squad invites sent to you.", href: "/dashboard/squad/requests/my-invites" },
            { icon: <Send size={22} />, title: "My Requests", desc: "Track join requests you have sent out.", href: "/dashboard/squad/requests/my-requests" },
          ].map(({ icon, title, desc, primary, href }) => (
            <button
              key={title}
              onClick={() => router.push(href)}
              className={`group text-left p-5 rounded-2xl border transition-all duration-200
                ${primary
                  ? "bg-yellow-400 border-yellow-400 hover:bg-yellow-300 shadow-xl shadow-yellow-400/20"
                  : "bg-zinc-900/80 border-zinc-800 hover:border-yellow-400/50 hover:bg-zinc-900"
                }`}
            >
              <div className={`mb-3 ${primary ? "text-black" : "text-yellow-400"}`}>{icon}</div>
              <p className={`font-bold text-base ${primary ? "text-black" : "text-white"}`}>{title}</p>
              <p className={`text-sm mt-1 ${primary ? "text-black/70" : "text-zinc-500"}`}>{desc}</p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════
     HAS SQUAD
  ═══════════════════════════════════════════════════ */
  const fillRatio = squad.members.length / squad.maxSize;

  return (
    <div className="space-y-6 pb-10">

      {/* ╔══ 1. HERO ══════════════════════════════════╗ */}
      <div className="relative overflow-hidden rounded-3xl border border-yellow-400/10 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
        {/* glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-yellow-400/3 rounded-full blur-2xl pointer-events-none" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-start gap-5">

            {/* LOGO */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                {squad.logo
                  ? <img src={squad.logo} className="w-full h-full object-cover" alt={squad.squadName} />
                  : <ShieldCheck className="text-yellow-400/60" size={34} />
                }
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black" />
            </div>

            {/* NAME + STATS */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {squad.squadName}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-1 bg-yellow-400/10 text-yellow-400 rounded-full border border-yellow-400/20 uppercase tracking-wide">
                  {squad.game}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Users size={13} className="text-zinc-500" />
                  <span className="text-sm text-zinc-300">
                    <span className="text-white font-semibold">{squad.members.length}</span>
                    <span className="text-zinc-500">/{squad.maxSize} members</span>
                  </span>
                </div>
                <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${fillRatio * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame size={13} className="text-orange-400" />
                  <span className="text-xs text-zinc-400">{squad.status}</span>
                </div>
              </div>
            </div>

            {/* ACTIONS TOGGLE — unobtrusive, lives in the corner */}
            <button
              onClick={() => setActionsOpen((o) => !o)}
              className="relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 text-xs font-medium transition-all"
            >
              {actionsOpen ? "Close" : "Actions"}
              <ChevronRight
                size={13}
                className={`transition-transform duration-200 ${actionsOpen ? "rotate-90" : ""}`}
              />
              {/* urgent badge */}
              {totalAlerts > 0 && !actionsOpen && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {totalAlerts}
                </span>
              )}
            </button>
          </div>

          {/* ── COLLAPSIBLE ACTION PANEL inside hero ─── */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${actionsOpen ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0"}`}>
            <div className="border-t border-zinc-800/60 pt-5">
              {isIGL ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* IGL squad management */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-yellow-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <Crown size={11} /> IGL Controls
                    </p>
                    <NavBtn label="Search Players" onClick={() => router.push("/dashboard/squad/search")} />
                    <NavBtn label="Manage Sent Invites" onClick={() => router.push("/dashboard/squad/manage/invites")} />
                    <NavBtn label="Join Requests" count={joinCount} primary={joinCount > 0} onClick={() => router.push("/dashboard/squad/manage/join-requests")} />
                    <NavBtn label="Leave Requests" count={leaveCount} onClick={() => router.push("/dashboard/squad/manage/leave-requests")} />
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure? This will permanently disband the squad.")) return;
                        await disbandSquad(); clearSquad();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition mt-1"
                    >
                      <LogOut size={13} /> Disband Squad
                    </button>
                  </div>

                  {/* IGL as player */}
                  <div className="space-y-2">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                      <UserCheck size={11} /> Your Activity
                    </p>
                    <NavBtn label="My Invites" count={myInviteCount} primary={myInviteCount > 0} onClick={() => router.push("/dashboard/squad/requests/my-invites")} />
                    <NavBtn label="My Join Requests" onClick={() => router.push("/dashboard/squad/requests/my-requests")} />
                  </div>
                </div>
              ) : (
                /* member actions */
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => router.push("/dashboard/squad/search")}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-zinc-700 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400 transition">
                    <Search size={14} /> Search Squads
                  </button>
                  {leavePending ? (
                    <span className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-4 py-2">
                      <LogOut size={14} /> Leave request sent — awaiting IGL approval
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        if (!confirm("Request to leave the squad? The IGL must approve before you are removed.")) return;
                        try { await requestLeaveSquad(); setLeavePending(true); }
                        catch (err) { alert(err.response?.data?.message || "Failed to send leave request"); }
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-red-500/10 border border-red-400/20 text-red-400 hover:bg-red-400/20 transition"
                    >
                      <LogOut size={14} /> Leave Squad
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ╔══ 2. ROSTER (PRIMARY CONTENT) ══════════════╗ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Users size={13} /> Roster
          </h3>
          <span className="text-xs text-zinc-700">{squad.members.length}/{squad.maxSize} slots</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {squad.members.map((m) => (
            <div
              key={m.player._id}
              className={`relative flex flex-col gap-3 rounded-2xl bg-black border p-5 transition-all duration-200
                ${m.isIGL ? "border-yellow-400/30 shadow-md shadow-yellow-400/5" : "border-zinc-800 hover:border-zinc-700"}`}
            >
              {/* IGL shimmer */}
              {m.isIGL && (
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-t-2xl" />
              )}

              {/* AVATAR ROW */}
              <div className="flex items-center gap-3">
                <Initials name={m.player.name} />
                <div className="min-w-0 flex-1">
                  <p className="text-white font-semibold text-sm truncate">{m.player.name}</p>
                  <p className="text-zinc-500 text-xs truncate">@{m.player.username}</p>
                </div>
                {m.isIGL && <Crown size={15} className="text-yellow-400 shrink-0" />}
              </div>

              {/* BADGES */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${roleColor[m.playstyleRole] || "text-zinc-400 bg-zinc-800"}`}>
                  {m.playstyleRole}
                </span>
                {m.isIGL && (
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-yellow-400 text-black">IGL</span>
                )}
              </div>

              {/* IGL → this member's controls */}
              {isIGL && !m.isIGL && (
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50 mt-auto">
                  <button
                    onClick={async () => {
                      if (!confirm(`Transfer IGL role to ${m.player.name}? You will become a regular member.`)) return;
                      try { await transferIGL(m.player._id); refreshSquad(); }
                      catch (err) { alert(err.response?.data?.message || "Failed to transfer IGL"); }
                    }}
                    className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 font-medium transition"
                  >
                    <Crown size={12} /> Make IGL
                  </button>
                  <span className="text-zinc-700 text-xs">•</span>
                  <button
                    onClick={async () => {
                      if (!confirm(`Kick ${m.player.name} from the squad?`)) return;
                      try { await kickPlayer(m.player._id); refreshSquad(); }
                      catch (err) { alert(err.response?.data?.message || "Failed to kick player"); }
                    }}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition"
                  >
                    <UserX size={12} /> Kick
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* OPEN SLOTS */}
          {Array.from({ length: squad.maxSize - squad.members.length }).map((_, i) => (
            <div key={`empty-${i}`}
              className="rounded-2xl border border-dashed border-zinc-800/60 p-5 flex flex-col items-center justify-center gap-2 min-h-[130px] opacity-25">
              <Users size={18} className="text-zinc-600" />
              <p className="text-zinc-600 text-xs">Open Slot</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
