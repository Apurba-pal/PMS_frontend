"use client";

import { useEffect, useState } from "react";
import { getSquadSentInvites, cancelInvite } from "@/services/squadService";
import { Button } from "@/components/ui/button";

export default function SquadInvitesPage() {
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const loadInvites = async () => {
      try {
        const { data } = await getSquadSentInvites();
        setInvites(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadInvites();
  }, []);

  const refresh = async () => {
    const { data } = await getSquadSentInvites();
    setInvites(data);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-yellow-400">
        Sent Invites
      </h1>

      {invites.map((invite) => (
        <div key={invite._id} className="flex justify-between">
          <div>{invite.player.name}</div>

          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await cancelInvite(invite._id);
              refresh();
            }}
          >
            Cancel
          </Button>
        </div>
      ))}
    </div>
  );
}
