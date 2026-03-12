"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVerificationRequests } from "@/services/adminService";
import { ShieldCheck, Clock, CheckCircle, XCircle, ChevronRight, ArrowLeft } from "lucide-react";

const TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const statusConfig = {
  PENDING:  { label: "Pending",  color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-400/10  text-green-400  border-green-400/20",  icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-400/10    text-red-400    border-red-400/20",    icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  );
}

export default function VerificationsPage() {
  const router = useRouter();
  const [tab, setTab] = useState("ALL");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const statusParam = tab === "ALL" ? undefined : tab;
        const { data } = await getVerificationRequests(statusParam);
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [tab]);

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
          <ShieldCheck size={17} className="text-yellow-400" />
          <span className="font-bold text-white">Verification Requests</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 mb-7 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition ${
                tab === t
                  ? "bg-yellow-400 text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-zinc-600 text-sm py-12 text-center">Loading...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16">
            <ShieldCheck size={36} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">No {tab.toLowerCase()} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <button
                key={req._id}
                onClick={() => router.push(`/admin/verifications/${req._id}`)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 transition text-left group"
              >
                {/* Avatar placeholder */}
                <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-zinc-400 font-bold text-sm">
                  {req.player?.name?.[0]?.toUpperCase() ?? "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {req.player?.name ?? "Unknown"}
                    <span className="text-zinc-500 font-normal ml-2">@{req.player?.username}</span>
                  </p>
                  <p className="text-zinc-500 text-xs mt-0.5">
                    Submitted {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                <StatusBadge status={req.status} />

                <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-300 transition shrink-0" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
