"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyJoinRequests } from "@/services/squadService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyJoinRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div className="flex items-center justify-between">
        <Button
          className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
          onClick={() => router.push("/dashboard/squad")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <h1 className="text-3xl font-bold text-yellow-400">
          My Join Requests
        </h1>
      </div>

      {requests.length === 0 && (
        <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-10 text-center">
          <Send size={40} className="mx-auto text-zinc-600 mb-4" />
          <p className="text-zinc-400">
            No join requests sent yet.
          </p>
        </div>
      )}

      {requests.map((req) => (
        <div
          key={req._id}
          className="rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-400/10 p-6 flex justify-between items-center"
        >
          <div>
            <p className="text-white font-semibold">
              {req.squad.squadName}
            </p>
            <p className="text-sm text-zinc-400">
              Status: {req.status}
            </p>
          </div>

          <span className="text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
            {req.status}
          </span>
        </div>
      ))}
    </div>
  );
}
