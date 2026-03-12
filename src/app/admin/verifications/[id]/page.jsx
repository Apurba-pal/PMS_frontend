"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getVerificationRequestById, reviewVerificationRequest } from "@/services/adminService";
import { ArrowLeft, ShieldCheck, CheckCircle, XCircle, ExternalLink, User, Hash, Gamepad2 } from "lucide-react";

const accountStatusStyle = {
  UNVERIFIED:    "bg-zinc-800 text-zinc-400 border-zinc-700",
  PENDING_REVIEW:"bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  VERIFIED:      "bg-green-400/10  text-green-400  border-green-400/20",
  DISABLED:      "bg-red-400/10    text-red-400    border-red-400/20",
};

export default function VerificationDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getVerificationRequestById(id);
        setData(res.data);
      } catch {
        router.replace("/admin/verifications");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleReview = async (status) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await reviewVerificationRequest(id, { status, adminNote: note });
      showToast(`Request ${status.toLowerCase()} successfully`);
      // Refresh data
      const res = await getVerificationRequestById(id);
      setData(res.data);
    } catch (err) {
      showToast(err?.response?.data?.message || "Action failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-zinc-600 text-sm">
        Loading...
      </div>
    );
  }

  const { request, profile } = data;
  const player = request.player;
  const isReviewed = request.status !== "PENDING";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={17} className="text-yellow-400" />
          <span className="font-bold text-white">Review Request</span>
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

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* Status banner */}
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold ${accountStatusStyle[player.accountStatus]}`}>
          <ShieldCheck size={15} />
          Account Status: {player.accountStatus.replace("_", " ")}
          {request.adminNote && (
            <span className="ml-auto text-xs font-normal opacity-70">Note: {request.adminNote}</span>
          )}
        </div>

        {/* Player info */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <User size={12} /> Player Information
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Name",        value: player.name },
              { label: "Username",    value: `@${player.username}` },
              { label: "Email",       value: player.email },
              { label: "Phone",       value: player.phone },
              { label: "In-Game Name",value: profile?.inGameName || "—" },
              { label: "Game UID",    value: profile?.gameUID || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">{label}</p>
                <p className="text-zinc-200 text-sm font-medium truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Roles */}
          {profile?.roles?.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Roles</p>
              <div className="flex gap-2 flex-wrap">
                {profile.roles.map((r) => (
                  <span key={r} className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ID Proof */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
              <Hash size={12} /> Submitted ID Proof
            </p>
            <a
              href={request.idProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
            >
              Open full <ExternalLink size={11} />
            </a>
          </div>

          <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black">
            <img
              src={request.idProofUrl}
              alt="ID Proof"
              className="w-full max-h-80 object-contain"
            />
          </div>

          <p className="text-xs text-zinc-600 mt-2 text-right">
            Submitted {new Date(request.createdAt).toLocaleString("en-IN", {
              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>

        {/* Action */}
        {isReviewed ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-center">
            <p className="text-zinc-400 text-sm">
              This request has already been <strong className="text-white">{request.status.toLowerCase()}</strong>.
            </p>
            {request.adminNote && (
              <p className="text-zinc-500 text-xs mt-1">Note left: {request.adminNote}</p>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Review Decision</p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (visible to player)…"
              rows={3}
              className="w-full bg-black border border-zinc-800 focus:border-zinc-600 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none placeholder:text-zinc-700 transition"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleReview("APPROVED")}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition disabled:opacity-50"
              >
                <CheckCircle size={15} /> Approve
              </button>
              <button
                onClick={() => handleReview("REJECTED")}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition disabled:opacity-50"
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
