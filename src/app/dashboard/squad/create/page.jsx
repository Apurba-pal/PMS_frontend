"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Users, Gamepad2 } from "lucide-react";

const ROLES = ["PRIMARY", "SECONDARY", "SNIPER", "NADER"];
const GAMES = ["Free Fire", "BGMI", "Valorant"]; // extend later

export default function CreateSquadPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    squadName: "",
    game: "",
    playstyleRole: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.squadName || !form.game || !form.playstyleRole) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/squads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create squad");
      }

      router.push("/dashboard/squad");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-yellow-400">
          Create Squad
        </h1>
        <p className="text-zinc-400">
          You will become the IGL of this squad
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-zinc-900/70 border border-yellow-400/10 p-8 space-y-6"
      >

        {/* SQUAD NAME */}
        <Field label="Squad Name">
          <input
            name="squadName"
            value={form.squadName}
            onChange={handleChange}
            placeholder="e.g. Team Nemesis"
            className="input"
          />
        </Field>

        {/* GAME */}
        <Field label="Game">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {GAMES.map((game) => (
              <SelectCard
                key={game}
                active={form.game === game}
                onClick={() => setForm({ ...form, game })}
              >
                <Gamepad2 size={16} />
                {game}
              </SelectCard>
            ))}
          </div>
        </Field>

        {/* ROLE */}
        <Field label="Your Role (IGL)">
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
        </Field>

        {error && (
          <p className="text-red-400 text-sm">
            {error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex gap-4 pt-4">
          <Button
            disabled={loading}
            className="bg-yellow-400 text-black hover:bg-yellow-300"
          >
            <Users size={16} className="mr-2" />
            Create Squad
          </Button>

          <Button
            type="button"
            variant="outline"
            className="border-zinc-600 text-zinc-300"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

/* 🔹 SMALL UI HELPERS */

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-zinc-400">{label}</p>
      {children}
    </div>
  );
}

function SelectCard({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm transition ${
        active
          ? "bg-yellow-400 text-black border-yellow-400"
          : "border-zinc-700 text-zinc-300 hover:border-yellow-400"
      }`}
    >
      {children}
    </button>
  );
}
