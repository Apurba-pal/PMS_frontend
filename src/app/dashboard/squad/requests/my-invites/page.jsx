"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyInvites, acceptInvite, rejectInvite } from "@/services/squadService";
import { useSquadStore } from "@/store/squadStore";
import { ArrowLeft, Mail, Shield, Check, X, Clock, CheckCircle, Users } from "lucide-react";

/* ── helpers ─────────────────────────────────────── */
function SquadAvatar({ squad }) {
  const letters = (squad.squadName || "?").slice(0, 2).toUpperCase();
  return (
    <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden shrink-0">
      {squad.logo
        ? <img src={squad.logo} className="w-full h-full object-cover" alt={squad.squadName} />
        : <span className="text-yellow-400 font-bold text-sm">{letters}</span>
      }
    </div>
  );
}

const statusConfig = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  ACCEPTED: { label: "Accepted", color: "text-green-400  bg-green-400/10  border-green-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400    bg-red-400/10    border-red-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-zinc-500   bg-zinc-800      border-zinc-700" },
};

/* ════════════════════════════════════════════════════ */
export default function MyInvitesPage() {
  const router = useRouter();
  const { fetchMySquad } = useSquadStore();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // invite._id being actioned

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyInvites();
        setInvites(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleAccept = async (id) => {
    setActing(id);
    try {
      await acceptInvite(id);
      await fetchMySquad();
      router.push("/dashboard/squad");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept invite");
      setActing(null);
    }
  };

  const handleReject = async (id) => {
    setActing(id);
    try {
      await rejectInvite(id);
      setInvites((prev) =>
        prev.map((i) => i._id === id ? { ...i, status: "REJECTED" } : i)
      );
    } catch {
      alert("Failed to reject invite");
    } finally {
      setActing(null);
    }
  };

  const pending = invites.filter((i) => i.status === "PENDING");
  const resolved = invites.filter((i) => i.status !== "PENDING");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/squad")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-700 text-zinc-400 hover:border-yellow-400/50 hover:text-yellow-400 transition shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Invites</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {loading ? "Loading…" : `${pending.length} pending · ${invites.length} total`}
          </p>
        </div>
      </div>

      {/* ── LOADING ──────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── EMPTY ────────────────────────────────────── */}
      {!loading && invites.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
          <Mail size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No invites yet</p>
          <p className="text-zinc-600 text-sm mt-1">Squads that invite you will appear here</p>
        </div>
      )}

      {/* ── PENDING INVITES ──────────────────────────── */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Clock size={13} /> Pending
            <span className="text-zinc-700 font-normal">({pending.length})</span>
          </h2>

          <div className="space-y-3">
            {pending.map((invite) => (
              <div
                key={invite._id}
                className="rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-4 hover:border-yellow-400/20 transition"
              >
                <div className="flex items-center gap-4">
                  <SquadAvatar squad={invite.squad} />

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{invite.squad.squadName}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-yellow-400 font-medium">{invite.squad.game}</span>
                      {invite.squad.members && (
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Users size={11} />
                          {invite.squad.members.length}/{invite.squad.maxSize} members
                        </span>
                      )}
                    </div>
                  </div>

                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusConfig.PENDING.color}`}>
                    Pending
                  </span>
                </div>

                {/* CTA row — full width for emphasis */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-800/60">
                  <button
                    onClick={() => handleAccept(invite._id)}
                    disabled={acting === invite._id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold bg-yellow-400 text-black hover:bg-yellow-300 transition disabled:opacity-40"
                  >
                    <Check size={14} />
                    {acting === invite._id ? "Joining…" : "Accept & Join"}
                  </button>
                  <button
                    onClick={() => handleReject(invite._id)}
                    disabled={acting === invite._id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-40"
                  >
                    <X size={13} />
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── HISTORY ──────────────────────────────────── */}
      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <CheckCircle size={13} /> History
            <span className="text-zinc-700 font-normal">({resolved.length})</span>
          </h2>

          <div className="space-y-3">
            {resolved.map((invite) => {
              const cfg = statusConfig[invite.status] || statusConfig.REJECTED;
              return (
                <div
                  key={invite._id}
                  className="flex items-center gap-4 rounded-2xl bg-black/40 border border-zinc-800/60 p-4 opacity-60"
                >
                  <SquadAvatar squad={invite.squad} />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 font-medium text-sm truncate">{invite.squad.squadName}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{invite.squad.game}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
