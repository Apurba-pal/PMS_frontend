"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyJoinRequests, cancelJoinRequest } from "@/services/squadService";
import { ArrowLeft, Send, Shield, X, Clock, CheckCircle, Users } from "lucide-react";

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
export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyJoinRequests();
        setRequests(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleCancel = async (requestId) => {
    setCancelling(requestId);
    try {
      await cancelJoinRequest(requestId);
      setRequests((prev) =>
        prev.map((r) => r._id === requestId ? { ...r, status: "CANCELLED" } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel request");
    } finally {
      setCancelling(null);
    }
  };

  const pending = requests.filter((r) => r.status === "PENDING");
  const resolved = requests.filter((r) => r.status !== "PENDING");

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My Join Requests</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {loading ? "Loading…" : `${pending.length} pending · ${requests.length} total`}
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
      {!loading && requests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
          <Send size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No join requests sent yet</p>
          <p className="text-zinc-600 text-sm mt-1">Find a squad and send a request to join</p>
          <button
            onClick={() => router.push("/dashboard/squad/search")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition"
          >
            Find a Squad
          </button>
        </div>
      )}

      {/* ── PENDING ──────────────────────────────────── */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Clock size={13} /> Pending
            <span className="text-zinc-700 font-normal">({pending.length})</span>
          </h2>

          <div className="space-y-3">
            {pending.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-4 rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-4 hover:border-yellow-400/20 transition"
              >
                <SquadAvatar squad={req.squad} />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{req.squad.squadName}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-yellow-400 font-medium">{req.squad.game}</span>
                    {req.squad.members && (
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Users size={11} />
                        {req.squad.members.length}/{req.squad.maxSize} members
                      </span>
                    )}
                  </div>
                </div>

                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusConfig.PENDING.color}`}>
                  Pending
                </span>

                <button
                  onClick={() => handleCancel(req._id)}
                  disabled={cancelling === req._id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-40"
                >
                  <X size={12} />
                  {cancelling === req._id ? "Cancelling…" : "Cancel"}
                </button>
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
            {resolved.map((req) => {
              const cfg = statusConfig[req.status] || statusConfig.CANCELLED;
              return (
                <div
                  key={req._id}
                  className="flex items-center gap-4 rounded-2xl bg-black/40 border border-zinc-800/60 p-4 opacity-60"
                >
                  <SquadAvatar squad={req.squad} />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 font-medium text-sm truncate">{req.squad.squadName}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{req.squad.game}</p>
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
