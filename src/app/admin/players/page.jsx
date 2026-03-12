"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllPlayers, togglePlayerDisable } from "@/services/adminService";
import { Users, ArrowLeft, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";

const statusStyle = {
  UNVERIFIED:    "bg-zinc-800 text-zinc-400 border-zinc-700",
  PENDING_REVIEW:"bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  VERIFIED:      "bg-green-400/10  text-green-400  border-green-400/20",
  DISABLED:      "bg-red-400/10    text-red-400    border-red-400/20",
};

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${statusStyle[status] ?? statusStyle.UNVERIFIED}`}>
      {status?.replace("_", " ")}
    </span>
  );
}

export default function AdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await getAllPlayers();
        setPlayers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleToggle = async (userId, currentStatus) => {
    setToggling(userId);
    try {
      const { data } = await togglePlayerDisable(userId);
      setPlayers((prev) =>
        prev.map((p) =>
          p._id === userId ? { ...p, accountStatus: data.accountStatus } : p
        )
      );
      showToast(`Account ${data.accountStatus === "DISABLED" ? "disabled" : "enabled"}`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <Users size={17} className="text-blue-400" />
          <span className="font-bold text-white">Player Management</span>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-semibold shadow-lg ${
          toast.type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-zinc-600 text-sm py-12 text-center">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No players found</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-zinc-600 mb-4">{players.length} player{players.length !== 1 ? "s" : ""} total</p>
            {players.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                  {p.profile?.profilePhoto
                    ? <img src={p.profile.profilePhoto} alt={p.name} className="w-full h-full object-cover" />
                    : <span className="text-zinc-400 font-bold text-sm">{p.name?.[0]?.toUpperCase()}</span>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {p.name}
                    <span className="text-zinc-500 font-normal ml-2 text-xs">@{p.username}</span>
                  </p>
                  {p.profile?.inGameName && (
                    <p className="text-zinc-500 text-xs mt-0.5">
                      IGN: <span className="text-zinc-300">{p.profile.inGameName}</span>
                      {p.profile.gameUID && <span className="ml-2 text-zinc-600">UID: {p.profile.gameUID}</span>}
                    </p>
                  )}
                </div>

                <StatusBadge status={p.accountStatus} />

                {/* Disable/Enable toggle */}
                <button
                  onClick={() => handleToggle(p._id, p.accountStatus)}
                  disabled={toggling === p._id}
                  title={p.accountStatus === "DISABLED" ? "Enable account" : "Disable account"}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition disabled:opacity-50 ${
                    p.accountStatus === "DISABLED"
                      ? "border-green-500/30 text-green-400 hover:bg-green-400/10"
                      : "border-red-500/30 text-red-400 hover:bg-red-400/10"
                  }`}
                >
                  {toggling === p._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : p.accountStatus === "DISABLED" ? (
                    <><ShieldCheck size={12} /> Enable</>
                  ) : (
                    <><ShieldOff size={12} /> Disable</>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
