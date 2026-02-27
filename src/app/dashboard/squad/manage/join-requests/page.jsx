"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getSquadJoinRequests,
  acceptJoinRequest,
  rejectJoinRequest,
} from "@/services/squadService";
import { ArrowLeft, UserPlus, Check, X, Clock, CheckCircle } from "lucide-react";

/* ── helpers ─────────────────────────────────────── */
function Initials({ name }) {
  const parts = (name || "?").split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
      <span className="text-black font-bold text-sm uppercase">{letters}</span>
    </div>
  );
}

const statusConfig = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  ACCEPTED: { label: "Accepted", color: "text-green-400  bg-green-400/10  border-green-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400    bg-red-400/10    border-red-400/20" },
};

/* ════════════════════════════════════════════════════ */
export default function JoinRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null); // req._id currently being actioned

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getSquadJoinRequests();
        setRequests(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handle = async (reqId, action) => {
    setActing(reqId);
    try {
      if (action === "accept") await acceptJoinRequest(reqId);
      else await rejectJoinRequest(reqId);
      // optimistic update
      setRequests((prev) =>
        prev.map((r) =>
          r._id === reqId ? { ...r, status: action === "accept" ? "ACCEPTED" : "REJECTED" } : r
        )
      );
    } catch (err) { console.error(err); }
    finally { setActing(null); }
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Join Requests</h1>
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
          <UserPlus size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No join requests yet</p>
          <p className="text-zinc-600 text-sm mt-1">Players who request to join your squad will appear here</p>
        </div>
      )}

      {/* ── PENDING ──────────────────────────────────── */}
      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <Clock size={13} /> Awaiting Decision
            <span className="text-zinc-700 font-normal">({pending.length})</span>
          </h2>

          <div className="space-y-3">
            {pending.map((req) => (
              <div
                key={req._id}
                className="flex items-center gap-4 rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-4 hover:border-yellow-400/20 transition"
              >
                <Initials name={req.player.name} />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{req.player.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">@{req.player.username}</p>
                </div>

                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusConfig.PENDING.color}`}>
                  Pending
                </span>

                {/* actions */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handle(req._id, "accept")}
                    disabled={acting === req._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-yellow-400 text-black hover:bg-yellow-300 transition disabled:opacity-40"
                  >
                    <Check size={12} />
                    {acting === req._id ? "…" : "Accept"}
                  </button>
                  <button
                    onClick={() => handle(req._id, "reject")}
                    disabled={acting === req._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-40"
                  >
                    <X size={12} />
                    Reject
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
            {resolved.map((req) => {
              const cfg = statusConfig[req.status] || statusConfig.REJECTED;
              return (
                <div
                  key={req._id}
                  className="flex items-center gap-4 rounded-2xl bg-black/40 border border-zinc-800/60 p-4 opacity-60"
                >
                  <Initials name={req.player.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 font-medium text-sm truncate">{req.player.name}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">@{req.player.username}</p>
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
