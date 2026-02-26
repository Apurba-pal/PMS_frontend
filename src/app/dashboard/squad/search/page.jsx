"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, Users, User, Shield, Swords, X } from "lucide-react";
import {
  searchSquads,
  sendJoinRequest,
  sendInvite,
  getMyJoinRequests,
  getSquadSentInvites,
} from "@/services/squadService";
import { getMe } from "@/services/authService";

/* ─── Tab definitions ───────────────────────────── */
const TABS = [
  { id: "all", label: "All", icon: Search },
  { id: "squad", label: "Squads", icon: Shield },
  { id: "player", label: "Players", icon: User },
];

/* ─── helpers ───────────────────────────────────── */
function Badge({ children, color = "zinc" }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full
      ${color === "yellow" ? "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
        : color === "blue" ? "bg-blue-400/10   text-blue-400"
          : "bg-zinc-800 text-zinc-400"}`}>
      {children}
    </span>
  );
}

function Initials({ name, size = "md" }) {
  const parts = (name || "?").split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  const dim = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  return (
    <div className={`${dim} rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0`}>
      <span className="text-black font-bold uppercase">{letters}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════ */
export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState({ squads: [], players: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [sentInvites, setSentInvites] = useState([]);  // player._id[]
  const [sentRequests, setSentRequests] = useState([]);  // squad._id[]
  const [currentUserId, setCurrentUserId] = useState(null);
  const inputRef = useRef(null);

  /* focus input on mount */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* load current user + existing invites/requests */
  useEffect(() => {
    const loadState = async () => {
      try {
        const [meRes, joinRes, inviteRes] = await Promise.all([
          getMe().catch(() => ({ data: {} })),
          getMyJoinRequests().catch(() => ({ data: [] })),
          getSquadSentInvites().catch(() => ({ data: [] })),
        ]);
        setCurrentUserId(meRes.data.userId ?? null);
        setSentRequests(joinRes.data.filter((r) => r.status === "PENDING").map((r) => r.squad._id));
        setSentInvites(inviteRes.data.filter((i) => i.status === "PENDING").map((i) => i.player._id));
      } catch { /* ignore */ }
    };
    loadState();
  }, []);

  /* ── debounced search ──────────────────────────── */
  const doSearch = useCallback(async (q, type) => {
    if (!q.trim()) { setResults({ squads: [], players: [] }); setSearched(false); return; }
    setLoading(true);
    try {
      const { data } = await searchSquads(q, type);
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query, activeTab), 350);
    return () => clearTimeout(timer);
  }, [query, activeTab, doSearch]);

  /* ── derived display lists — filter out self ────── */
  const showSquads = activeTab !== "player";
  const showPlayers = activeTab !== "squad";
  const squads = (results.squads || []).filter(
    (s) => !currentUserId || !s.members?.some((m) => m.player._id === currentUserId)
  );
  const players = (results.players || []).filter(
    (p) => !currentUserId || p.user._id !== currentUserId
  );
  const hasResults = (showSquads && squads.length > 0) || (showPlayers && players.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/squad")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-700 text-zinc-400 hover:border-yellow-400/50 hover:text-yellow-400 transition shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Search</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Find squads to join or players to invite</p>
        </div>
      </div>

      {/* ── SEARCH BAR ───────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or username…"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-11 pr-11 py-3.5 text-white text-sm focus:outline-none focus:border-yellow-400/60 transition placeholder-zinc-600"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
          >
            <X size={15} />
          </button>
        )}
        {/* live indicator */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* ── TABS ─────────────────────────────────────── */}
      <div className="flex gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
              ${activeTab === id
                ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
          >
            <Icon size={14} />
            {label}
            {/* result count badge */}
            {query && !loading && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${activeTab === id ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-400"}`}>
                {id === "all" ? (squads.length + players.length)
                  : id === "squad" ? squads.length
                    : players.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── RESULTS ──────────────────────────────────── */}
      {!query && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <Swords size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500 text-sm">Type to search squads and players</p>
        </div>
      )}

      {query && !loading && !hasResults && searched && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <Search size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No results for "{query}"</p>
          <p className="text-zinc-600 text-sm mt-1">Try a different name or username</p>
        </div>
      )}

      {/* ── SQUADS ───────────────────────────────────── */}
      {showSquads && squads.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Shield size={13} />
            Squads
            <span className="text-zinc-700 font-normal">({squads.length})</span>
          </h2>

          <div className="space-y-3">
            {squads.map((squad) => {
              const alreadyRequested = sentRequests.includes(squad._id);
              return (
                <div
                  key={squad._id}
                  className="flex items-center gap-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 hover:border-zinc-700 transition"
                >
                  {/* squad icon */}
                  <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                    {squad.logo
                      ? <img src={squad.logo} className="w-full h-full object-cover" alt={squad.squadName} />
                      : <Shield size={18} className="text-zinc-500" />
                    }
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{squad.squadName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge color="yellow">{squad.game}</Badge>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Users size={11} />
                        {squad.members.length} members
                      </span>
                    </div>
                  </div>

                  {/* action */}
                  {alreadyRequested ? (
                    <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Requested
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await sendJoinRequest(squad._id);
                          setSentRequests((p) => [...p, squad._id]);
                        } catch (err) {
                          const msg = err.response?.data?.message;
                          if (msg === "Request already sent") setSentRequests((p) => [...p, squad._id]);
                          else alert(msg || "Failed");
                        }
                      }}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 transition shadow-sm shadow-yellow-400/20"
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PLAYERS ──────────────────────────────────── */}
      {showPlayers && players.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <User size={13} />
            Players
            <span className="text-zinc-700 font-normal">({players.length})</span>
          </h2>

          <div className="space-y-3">
            {players.map((player) => {
              const playerId = player.user._id;
              const alreadyInvited = sentInvites.includes(playerId);
              return (
                <div
                  key={player._id}
                  className="flex items-center gap-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 hover:border-zinc-700 transition"
                >
                  <Initials name={player.user.name} />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{player.user.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-zinc-500">@{player.username}</span>
                      {player.roles?.slice(0, 2).map((r) => (
                        <Badge key={r}>{r}</Badge>
                      ))}
                    </div>
                  </div>

                  {alreadyInvited ? (
                    <span className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Invited
                    </span>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await sendInvite(playerId);
                          setSentInvites((p) => [...p, playerId]);
                        } catch (err) {
                          const msg = err.response?.data?.message;
                          if (msg === "Invite already sent") setSentInvites((p) => [...p, playerId]);
                          else if (msg) alert(msg);
                          /* silently ignore 403 (not-an-IGL) */
                        }
                      }}
                      className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-yellow-400/50 hover:text-yellow-400 transition"
                    >
                      Invite
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
