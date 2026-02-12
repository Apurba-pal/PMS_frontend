"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSquadStore } from "@/store/squadStore";
import {
  Users,
  Plus,
  Search,
  Crown,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import {
  requestLeaveSquad,
  disbandSquad,
} from "@/services/squadService";

export default function SquadPage() {
  const router = useRouter();
  const { squad, loading, fetchMySquad, clearSquad } = useSquadStore();

  useEffect(() => {
    fetchMySquad();
  }, []);

  // ✅ Determine IGL directly from squad
  const isIGL =
    squad?.members?.length === 1
      ? squad.members[0].isIGL === true
      : squad?.members?.some((m) => m.isIGL === true);

  if (loading) return null;

  /* =========================
     NO SQUAD UI
  ========================== */
  if (!squad) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <Users size={60} className="mx-auto text-yellow-400" />

          <h1 className="text-4xl font-bold text-white">
            No Squad Yet
          </h1>

          <p className="text-zinc-400">
            Create or join a squad to compete in tournaments
            and climb the leaderboard.
          </p>

          <div className="flex justify-center gap-4">
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              onClick={() =>
                router.push("/dashboard/squad/create")
              }
            >
              <Plus size={16} className="mr-2" />
              Create Squad
            </Button>

            <Button
              variant="outline"
              className="border-zinc-600 text-zinc-300 hover:border-yellow-400 hover:text-yellow-400"
              onClick={() =>
                router.push("/dashboard/squad/search")
              }
            >
              <Search size={16} className="mr-2" />
              Find Squad
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
     HAS SQUAD UI
  ========================== */
  return (
    <div className="space-y-10">

      {/* HERO SECTION */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-black border border-yellow-400/10 p-8">

        <div className="flex flex-col md:flex-row items-center gap-6">

          {/* LOGO */}
          <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden">
            {squad.logo ? (
              <img
                src={squad.logo}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShieldCheck className="text-zinc-500" size={40} />
            )}
          </div>

          {/* INFO */}
          <div>
            <h1 className="text-4xl font-bold text-white">
              {squad.squadName}
            </h1>

            <p className="text-zinc-400 mt-2">
              {squad.game} • {squad.members.length}/{squad.maxSize} Members
            </p>
          </div>

          {/* ACTIONS */}
          <div className="md:ml-auto flex flex-wrap gap-3">
            {isIGL ? (
              <>
                <Button
                  variant="outline"
                  className="border-yellow-500 text-yellow-400"
                  onClick={() =>
                    router.push(
                      "/dashboard/squad/manage/invites"
                    )
                  }
                >
                  Manage Invites
                </Button>

                <Button
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                  onClick={() =>
                    router.push(
                      "/dashboard/squad/manage/join-requests"
                    )
                  }
                >
                  Join Requests
                </Button>

                <Button
                  variant="destructive"
                  onClick={async () => {
                    const ok = confirm(
                      "Are you sure? This will permanently disband the squad."
                    );
                    if (!ok) return;

                    await disbandSquad();
                    clearSquad();
                  }}
                >
                  Disband
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10"
                onClick={async () => {
                  await requestLeaveSquad();
                  clearSquad();
                }}
              >
                <LogOut size={16} className="mr-2" />
                Leave Squad
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MEMBERS GRID */}
      <div className="rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-6">
        <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-6">
          Squad Members
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squad.members.map((m) => (
            <div
              key={m.player._id}
              className="relative rounded-xl bg-black/40 border border-zinc-800 p-4 transition hover:border-yellow-400/40"
            >
              {m.isIGL && (
                <div className="absolute top-3 right-3 text-yellow-400">
                  <Crown size={16} />
                </div>
              )}

              <p className="text-white font-semibold">
                {m.player.name}
              </p>

              <p className="text-xs text-zinc-400 mt-1">
                {m.playstyleRole}
              </p>

              {m.isIGL && (
                <span className="inline-block mt-3 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                  IGL
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
