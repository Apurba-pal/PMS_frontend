"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSquadStore } from "@/store/squadStore";
import { getMe } from "@/services/authService";

export default function ManageLayout({ children }) {
  const router = useRouter();
  const { squad, fetchMySquad } = useSquadStore();
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

  useEffect(() => {
    if (!squad) {
      fetchMySquad();
      return;
    }

    if (!currentUserId) return;

    const isIGL =
      squad.members.find((m) => m.player._id === currentUserId)?.isIGL === true;

    if (!isIGL) {
      router.replace("/dashboard/squad");
    }
  }, [squad, currentUserId]);

  return (
    <div className="space-y-8">
      {children}
    </div>
  );
}
