"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSquadStore } from "@/store/squadStore";
import { Users, Plus, Search } from "lucide-react";

export default function SquadPage() {
  const router = useRouter();
  const { squad, loading, fetchMySquad } = useSquadStore();

  useEffect(() => {
    fetchMySquad();
  }, []);

  if (loading) return null;

  /* ❌ NOT IN ANY SQUAD */
  if (!squad) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-yellow-400">
            You are not in a Squad
          </h1>
          <p className="text-zinc-400 max-w-md">
            Create a squad or join an existing one to play tournaments and
            competitive matches.
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-300"
            onClick={() => router.push("/dashboard/squad/create")}
          >
            <Plus size={16} className="mr-2" />
            Create Squad
          </Button>

          <Button
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400"
            onClick={() => router.push("/dashboard/squad/search")}
          >
            <Search size={16} className="mr-2" />
            Find Squad
          </Button>
        </div>
      </div>
    );
  }

  /* ✅ IN A SQUAD */
  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="rounded-2xl bg-zinc-900/70 border border-yellow-400/10 p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center">
          {squad.logo ? (
            <img src={squad.logo} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <Users className="text-zinc-500" />
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">
            {squad.squadName}
          </h1>
          <p className="text-sm text-zinc-400">
            {squad.game} • {squad.members.length}/{squad.maxSize} Members
          </p>
        </div>
      </div>

      {/* MEMBERS PREVIEW */}
      <div className="rounded-xl bg-zinc-900/60 border border-yellow-400/10 p-6">
        <h3 className="text-sm text-zinc-400 mb-4">
          Squad Members
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {squad.members.map((m) => (
            <div
              key={m.player._id}
              className="flex items-center justify-between bg-black/40 rounded-lg px-4 py-3"
            >
              <div>
                <p className="text-sm text-white">
                  {m.player.name}
                  {m.isIGL && (
                    <span className="ml-2 text-xs text-yellow-400">
                      IGL
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-400">
                  {m.playstyleRole}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="border-zinc-600 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400"
          onClick={() => router.push("/dashboard/squad/invites")}
        >
          Invites
        </Button>

        <Button
          variant="outline"
          className="border-zinc-600 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400"
          onClick={() => router.push("/dashboard/squad/requests")}
        >
          Join Requests
        </Button>
      </div>
    </div>
  );
}
