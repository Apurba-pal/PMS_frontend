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
      alert(err.response?.data?.message || "Failed to accept invite");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectInvite(id);
      refresh();
    } catch (err) {
      alert("Failed to reject invite");
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-yellow-400">
        My Invites
      </h1>

      {invites.map((invite) => (
        <div key={invite._id} className="flex justify-between">
          <div>{invite.squad.squadName}</div>

          <div className="flex gap-2">
            <Button onClick={() => handleAccept(invite._id)}>
              Accept
            </Button>

            <Button
              variant="outline"
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
