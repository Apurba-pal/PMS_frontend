"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSquadStore } from "@/store/squadStore";

export default function ManageLayout({ children }) {
  const router = useRouter();
  const { squad, fetchMySquad } = useSquadStore();

  useEffect(() => {
    if (!squad) {
      fetchMySquad();
      return;
    }

    const isIGL = squad.members.some((m) => m.isIGL === true);

    if (!isIGL) {
      router.replace("/dashboard/squad");
    }
  }, [squad]);

  return (
    <div className="space-y-8">
      {children}
    </div>
  );
}
