"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  searchSquads,
  sendJoinRequest,
  sendInvite,
  getMyJoinRequests,
  getSquadSentInvites,
} from "@/services/squadService";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ squads: [], players: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [sentInvites, setSentInvites] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);

      // 1️⃣ Get search results
      const { data } = await searchSquads(query);
      setResults(data);

      // 2️⃣ Get pending join requests (Player → Squad)
      const joinRes = await getMyJoinRequests();
      const pendingRequests = joinRes.data
        .filter((r) => r.status === "PENDING")
        .map((r) => r.squad._id);

      setSentRequests(pendingRequests);

      // 3️⃣ Get sent invites (IGL → Player)
      const inviteRes = await getSquadSentInvites();
      const pendingInvites = inviteRes.data
        .filter((i) => i.status === "PENDING")
        .map((i) => i.player._id);

      setSentInvites(pendingInvites);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">

<div className="flex items-center justify-between">
  <Button
    className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
    onClick={() => router.push("/dashboard/squad")}
  >
    <ArrowLeft size={16} className="mr-2" />
    Back
  </Button>

  <h1 className="text-3xl font-bold text-yellow-400">
    Search Players & Squads
  </h1>
</div>

      {/* SEARCH */}
      <div className="flex gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-black border border-zinc-700 rounded-xl px-4 py-3 text-white focus:border-yellow-400 focus:outline-none"
        />

        <Button
          className="bg-yellow-400 text-black hover:bg-yellow-300"
          onClick={handleSearch}
        >
          <Search size={16} className="mr-2" />
          Search
        </Button>
      </div>

      {loading && (
        <p className="text-zinc-500 text-sm">Searching...</p>
      )}

      {/* ================= SQUADS ================= */}
      {results.squads?.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-xl text-yellow-400 font-semibold">
            Squads
          </h2>

          {results.squads.map((squad) => {
            const alreadyRequested = sentRequests.includes(squad._id);

            return (
              <div
                key={squad._id}
                className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-6 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">
                    {squad.squadName}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {squad.game}
                  </p>
                </div>

                {alreadyRequested ? (
                  <Button className="bg-black border border-yellow-400 text-yellow-400">
                    Request Sent
                  </Button>
                ) : (
                  <Button
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                    onClick={async () => {
                      try {
                        await sendJoinRequest(squad._id);
                        setSentRequests((prev) => [
                          ...prev,
                          squad._id,
                        ]);
                      } catch (err) {
                        const message =
                          err.response?.data?.message;

                        if (
                          message ===
                          "Request already sent"
                        ) {
                          setSentRequests((prev) => [
                            ...prev,
                            squad._id,
                          ]);
                        } else {
                          alert(message);
                        }
                      }
                    }}
                  >
                    Request to Join
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ================= PLAYERS ================= */}
      {results.players?.length > 0 && (
        <div className="space-y-5">
          <h2 className="text-xl text-yellow-400 font-semibold">
            Players
          </h2>

          {results.players.map((player) => {
            const playerId = player.user._id;
            const alreadyInvited = sentInvites.includes(playerId);

            return (
              <div
                key={player._id}
                className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-6 flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-semibold">
                    {player.user.name}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    @{player.username}
                  </p>
                </div>

                {alreadyInvited ? (
                  <Button className="bg-black border border-yellow-400 text-yellow-400">
                    Invite Sent
                  </Button>
                ) : (
                  <Button
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                    onClick={async () => {
                      try {
                        await sendInvite(playerId);
                        setSentInvites((prev) => [
                          ...prev,
                          playerId,
                        ]);
                      } catch (err) {
                        const message =
                          err.response?.data?.message;

                        if (
                          message ===
                          "Invite already sent"
                        ) {
                          setSentInvites((prev) => [
                            ...prev,
                            playerId,
                          ]);
                        } else {
                          alert(message);
                        }
                      }
                    }}
                  >
                    Invite Player
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
