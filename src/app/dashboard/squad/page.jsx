"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSquadStore } from "@/store/squadStore";
import useAuthStore from "@/store/authStore";
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
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMySquad();
  }, []);

  const me = useMemo(() => {
    if (!squad || !user) return null;
    return squad.members.find(
      (m) => m.player._id === user._id
    );
  }, [squad, user]);

  const isIGL = me?.isIGL;

  if (loading) return null;

  if (!squad) {
    return (
      <div className="text-center">
        <Users size={48} className="mx-auto text-yellow-400" />
        <h1 className="text-3xl text-yellow-400">No Squad Yet</h1>

        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={() =>
              router.push("/dashboard/squad/create")
            }
          >
            <Plus size={16} className="mr-2" />
            Create
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              router.push("/dashboard/squad/search")
            }
          >
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-white">
        {squad.squadName}
      </h1>

      {isIGL ? (
        <div className="flex gap-3">
          <Button
            onClick={() =>
              router.push(
                "/dashboard/squad/manage/invites"
              )
            }
          >
            Manage Invites
          </Button>

          <Button
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
              await disbandSquad();
              clearSquad();
            }}
          >
            Disband
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
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
  );
}
