"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Gamepad2, Crown } from "lucide-react";
import { createSquad } from "@/services/squadService";
import { useSquadStore } from "@/store/squadStore";

const ROLES = ["PRIMARY", "SECONDARY", "SNIPER", "NADER"];
const GAMES = ["Free Fire", "BGMI", "Valorant"];

export default function CreateSquadPage() {
  const router = useRouter();
  const { fetchMySquad } = useSquadStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    squadName: "",
    game: "",
    playstyleRole: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.squadName || !form.game || !form.playstyleRole) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      await createSquad(form);
      await fetchMySquad();
      router.push("/dashboard/squad");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create squad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">

      <div className="w-full max-w-4xl space-y-10">

        {/* HEADER */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/10 text-yellow-400 text-sm">
            <Crown size={14} />
            You will become the IGL
          </div>

          <h1 className="text-4xl font-bold text-white">
            Create Your Squad
          </h1>

          <p className="text-zinc-400 max-w-md mx-auto">
            Build your competitive team and dominate tournaments.
          </p>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-black border border-yellow-400/10 p-10 space-y-8 shadow-xl"
        >

          {/* SQUAD NAME */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">
              Squad Name
            </label>

            <input
              name="squadName"
              value={form.squadName}
              onChange={(e) =>
                setForm({ ...form, squadName: e.target.value })
              }
              placeholder="e.g. Team Nemesis"
              className="w-full bg-black/40 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:border-yellow-400 focus:outline-none transition"
            />
          </div>

          {/* GAME SELECTION */}
          <div className="space-y-3">
            <label className="text-sm text-zinc-400">
              Select Game
            </label>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GAMES.map((game) => (
                <SelectCard
                  key={game}
                  active={form.game === game}
                  onClick={() => setForm({ ...form, game })}
                >
                  <Gamepad2 size={18} />
                  {game}
                </SelectCard>
              ))}
            </div>
          </div>

          {/* ROLE SELECTION */}
          <div className="space-y-3">
            <label className="text-sm text-zinc-400">
              Your Playstyle Role (IGL)
            </label>

            <div className="flex flex-wrap gap-3">
              {ROLES.map((role) => (
                <SelectCard
                  key={role}
                  active={form.playstyleRole === role}
                  onClick={() =>
                    setForm({ ...form, playstyleRole: role })
                  }
                >
                  {role}
                </SelectCard>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* SUBMIT */}
          <div className="pt-4">
            <Button
              disabled={loading}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-300 py-3 text-lg font-semibold"
            >
              <Users size={18} className="mr-2" />
              {loading ? "Creating..." : "Create Squad"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ==========================
   Select Card Component
========================== */
function SelectCard({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-4 rounded-xl border text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-yellow-400 text-black border-yellow-400 shadow-lg"
          : "bg-black/30 border-zinc-700 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400"
      }`}
    >
      {children}
    </button>
  );
}
