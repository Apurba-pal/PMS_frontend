"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSquadSentInvites, cancelInvite } from "@/services/squadService";
import { ArrowLeft, Mail, Clock, CheckCircle, XCircle, X } from "lucide-react";

/* ── status helpers ─────────────────────────────── */
const statusConfig = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  ACCEPTED: { label: "Accepted", color: "text-green-400  bg-green-400/10  border-green-400/20" },
  REJECTED: { label: "Rejected", color: "text-red-400    bg-red-400/10    border-red-400/20" },
  CANCELLED: { label: "Cancelled", color: "text-zinc-500   bg-zinc-800      border-zinc-700" },
};

function Initials({ name }) {
  const parts = (name || "?").split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shrink-0">
      <span className="text-black font-bold text-sm uppercase">{letters}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════ */
export default function SquadInvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null); // invite._id being cancelled

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getSquadSentInvites();
        setInvites(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async (invite) => {
    setCancelling(invite._id);
    try {
      await cancelInvite(invite._id);
      setInvites((prev) =>
        prev.map((i) => i._id === invite._id ? { ...i, status: "CANCELLED" } : i)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const pending = invites.filter((i) => i.status === "PENDING");
  const others = invites.filter((i) => i.status !== "PENDING");

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
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Sent Invites</h1>
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

      {/* ── EMPTY STATE ──────────────────────────────── */}
      {!loading && invites.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
          <Mail size={36} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-400 font-medium">No invites sent yet</p>
          <p className="text-zinc-600 text-sm mt-1">Search for players to invite them to your squad</p>
          <button
            onClick={() => router.push("/dashboard/squad/search")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-300 transition"
          >
            Search Players
          </button>
        </div>
      )}

      {/* ── PENDING INVITES ───────────────────────────── */}
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
                className="flex items-center gap-4 rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-4 hover:border-yellow-400/20 transition"
              >
                <Initials name={invite.player.name} />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{invite.player.name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">@{invite.player.username}</p>
                </div>

                <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusConfig.PENDING.color}`}>
                  Pending
                </span>

                <button
                  onClick={() => handleCancel(invite)}
                  disabled={cancelling === invite._id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 border border-red-400/20 hover:bg-red-400/10 transition disabled:opacity-40"
                >
                  <X size={12} />
                  {cancelling === invite._id ? "Cancelling…" : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── HISTORICAL INVITES ────────────────────────── */}
      {others.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
            <CheckCircle size={13} /> History
            <span className="text-zinc-700 font-normal">({others.length})</span>
          </h2>

          <div className="space-y-3">
            {others.map((invite) => {
              const cfg = statusConfig[invite.status] || statusConfig.CANCELLED;
              return (
                <div
                  key={invite._id}
                  className="flex items-center gap-4 rounded-2xl bg-black/40 border border-zinc-800/60 p-4 opacity-70"
                >
                  <Initials name={invite.player.name} />

                  <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 font-medium text-sm truncate">{invite.player.name}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">@{invite.player.username}</p>
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
