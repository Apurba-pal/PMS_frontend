"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSquadStore } from "@/store/squadStore";
import { getMe } from "@/services/authService";
import {
  Users,
  Plus,
  Search,
  Crown,
  ShieldCheck,
  LogOut,
  UserX,
} from "lucide-react";
import {
  getSquadJoinRequests,
  getSquadLeaveRequests,
  requestLeaveSquad,
  disbandSquad,
  kickPlayer,
} from "@/services/squadService";

export default function SquadPage() {
  const router = useRouter();
  const { squad, loading, fetchMySquad, clearSquad, refreshSquad } = useSquadStore();
  const [joinCount, setJoinCount] = useState(0);
  const [leaveCount, setLeaveCount] = useState(0);
  const [leavePending, setLeavePending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data } = await getMe();
        setCurrentUserId(data.userId);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCurrentUser();
  }, []);

  // useEffect(() => {
  //   fetchMySquad();
  //   const loadJoinCount = async () => {
  //     try {
  //       const { data } = await getSquadJoinRequests();
  //       setJoinCount(data.length);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   loadJoinCount();
  // }, []);


  // ✅ Determine IGL directly from squad

  useEffect(() => {
    fetchMySquad();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      if (!squad || !currentUserId) return;

      const isIGL =
        squad?.members?.find((m) => m.player._id === currentUserId)?.isIGL === true;

      if (!isIGL) return;

      try {
        const [{ data: joinData }, { data: leaveData }] = await Promise.all([
          getSquadJoinRequests(),
          getSquadLeaveRequests(),
        ]);
        setJoinCount(joinData.length);
        setLeaveCount(leaveData.length);
      } catch (err) {
        console.error(err);
      }
    };

    loadCounts();
  }, [squad, currentUserId]);

  const isIGL =
    squad?.members?.find((m) => m.player._id === currentUserId)?.isIGL === true;

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
              className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() =>
                router.push("/dashboard/squad/search")
              }
            >
              <Search size={16} className="mr-2" />
              Find Squad
            </Button>

            <Button
              className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() =>
                router.push("/dashboard/squad/requests/my-requests")
              }
            >
              My Requests
            </Button>

            <Button
              className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() =>
                router.push("/dashboard/squad/requests/my-invites")
              }
            >
              My Invites
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
                {/* SEARCH PLAYERS */}
                <Button
                  className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() =>
                    router.push("/dashboard/squad/search")
                  }
                >
                  <Search size={16} className="mr-2" />
                  Search
                </Button>

                {/* MANAGE INVITES */}
                <Button
                  className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() =>
                    router.push(
                      "/dashboard/squad/manage/invites"
                    )
                  }
                >
                  Manage Invites
                </Button>

                {/* JOIN REQUESTS */}
                <Button
                  className="relative bg-yellow-400 text-black hover:bg-yellow-300"
                  onClick={() =>
                    router.push(
                      "/dashboard/squad/manage/join-requests"
                    )
                  }
                >
                  Join Requests

                  {joinCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-yellow-400 border border-yellow-400 text-xs px-2 py-[2px] rounded-full">
                      {joinCount}
                    </span>
                  )}
                </Button>

                {/* LEAVE REQUESTS */}
                <Button
                  className="relative bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() =>
                    router.push(
                      "/dashboard/squad/manage/leave-requests"
                    )
                  }
                >
                  Leave Requests

                  {leaveCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs px-2 py-[2px] rounded-full">
                      {leaveCount}
                    </span>
                  )}
                </Button>

                {/* DISBAND */}
                <Button
                  className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
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
              <>
                {/* SEARCH SQUADS */}
                <Button
                  className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                  onClick={() =>
                    router.push("/dashboard/squad/search")
                  }
                >
                  <Search size={16} className="mr-2" />
                  Search Squads
                </Button>

                {/* LEAVE — shows pending state instead of instant removal */}
                {leavePending ? (
                  <span className="text-sm text-yellow-400 border border-yellow-400/30 rounded-md px-3 py-2">
                    Leave request sent — awaiting IGL approval
                  </span>
                ) : (
                  <Button
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                    onClick={async () => {
                      const ok = confirm("Request to leave the squad? The IGL must approve before you are removed.");
                      if (!ok) return;
                      try {
                        await requestLeaveSquad();
                        setLeavePending(true);
                      } catch (err) {
                        alert(err.response?.data?.message || "Failed to send leave request");
                      }
                    }}
                  >
                    <LogOut size={16} className="mr-2" />
                    Leave Squad
                  </Button>
                )}
              </>
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

              {/* KICK — only shown to IGL, and not on IGL's own card */}
              {isIGL && !m.isIGL && (
                <button
                  className="mt-3 flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition"
                  onClick={async () => {
                    const ok = confirm(`Kick ${m.player.name} from the squad?`);
                    if (!ok) return;
                    try {
                      await kickPlayer(m.player._id);
                      refreshSquad();
                    } catch (err) {
                      alert(err.response?.data?.message || "Failed to kick player");
                    }
                  }}
                >
                  <UserX size={13} />
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
