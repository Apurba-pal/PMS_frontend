"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getSquadLeaveRequests,
    approveLeaveRequest,
    rejectLeaveRequest,
} from "@/services/squadService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";

export default function LeaveRequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const { data } = await getSquadLeaveRequests();
                setRequests(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    const refresh = async () => {
        const { data } = await getSquadLeaveRequests();
        setRequests(data);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        onClick={() => router.push("/dashboard/squad")}
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back
                    </Button>

                    <h1 className="text-3xl font-bold text-yellow-400">
                        Leave Requests
                    </h1>
                </div>

                <span className="text-sm text-zinc-500">
                    {requests.length} Pending
                </span>
            </div>

            {/* LOADING */}
            {loading && (
                <div className="text-zinc-500 text-sm">Loading requests...</div>
            )}

            {/* EMPTY STATE */}
            {!loading && requests.length === 0 && (
                <div className="rounded-2xl bg-zinc-900/60 border border-yellow-400/10 p-12 text-center">
                    <LogOut className="mx-auto text-zinc-600 mb-4" size={42} />
                    <p className="text-zinc-400">
                        No players have requested to leave yet.
                    </p>
                </div>
            )}

            {/* REQUEST LIST */}
            <div className="space-y-5">
                {requests.map((req) => (
                    <div
                        key={req._id}
                        className="rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-black border border-yellow-400/10 p-6 flex items-center justify-between hover:border-yellow-400/40 transition"
                    >
                        {/* Player Info */}
                        <div>
                            <p className="text-lg font-semibold text-white">
                                {req.player.name}
                            </p>
                            <p className="text-sm text-zinc-400">
                                @{req.player.username}
                            </p>
                            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
                                Wants to leave
                            </span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-3">

                            {/* Approve — player is removed */}
                            <Button
                                className="bg-yellow-400 text-black hover:bg-yellow-300"
                                onClick={async () => {
                                    await approveLeaveRequest(req._id);
                                    refresh();
                                }}
                            >
                                Approve
                            </Button>

                            {/* Reject — player stays */}
                            <Button
                                className="bg-black border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                                onClick={async () => {
                                    await rejectLeaveRequest(req._id);
                                    refresh();
                                }}
                            >
                                Reject
                            </Button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
