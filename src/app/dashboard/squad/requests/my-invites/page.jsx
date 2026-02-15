"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getMyInvites,
  acceptInvite,
  rejectInvite,
} from "@/services/squadService";
import { useSquadStore } from "@/store/squadStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export default function MyInvitesPage() {
  const router = useRouter();
  const { fetchMySquad } = useSquadStore();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const loadInvites = async () => {
      try {
        const { data } = await getMyInvites();
        setInvites(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadInvites();
  }, []);

  const refresh = async () => {
    const { data } = await getMyInvites();
    setInvites(data);
  };

  const handleAccept = async (id) => {
    try {
      await acceptInvite(id);
      await fetchMySquad();
      router.push("/dashboard/squad");
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectInvite(id);
      refresh();
    } catch {
      alert("Failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          onClick={() => router.push("/dashboard/squad")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-yellow-400">
          My Invites
        </h1>
      </div>

      {invites.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-10 text-center">
          <Mail size={40} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">No invites yet.</p>
        </div>
      )}

      {invites.map((invite) => (
        <div
          key={invite._id}
          className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-6 flex justify-between items-center hover:border-yellow-400/40 transition"
        >
          <div>
            <p className="text-lg font-semibold text-white">
              {invite.squad.squadName}
            </p>
            <p className="text-sm text-zinc-400">
              {invite.squad.game}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              onClick={() => handleAccept(invite._id)}
            >
              Accept
            </Button>

            <Button
              className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              onClick={() => handleReject(invite._id)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
