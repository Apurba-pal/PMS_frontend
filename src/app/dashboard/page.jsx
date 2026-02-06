"use client";

import { Users, Trophy, UserCog } from "lucide-react";

export default function DashboardHome() {

  const cards = [
    { title: "Create Squad", icon: Users },
    { title: "Join Tournament", icon: Trophy },
    { title: "Update Profile", icon: UserCog },
  ];

  return (
    <div className="space-y-8">

      <h1 className="text-3xl font-bold text-yellow-400">
        Arena Overview
      </h1>

      {/* FEATURE CARDS */}
      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-xl border border-yellow-400/10 bg-zinc-900/60 p-6 hover:bg-zinc-900 transition">
              <div className="flex items-center gap-3 mb-3 text-yellow-400">
                <Icon size={20} />
                <h3 className="font-semibold text-lg text-white">{item.title}</h3>
              </div>
              <p className="text-sm text-zinc-400">
                Take the next step in your competitive journey.
              </p>
            </div>
          );
        })}
      </div>

      {/* UPCOMING TOURNAMENTS */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          Upcoming Tournaments
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-yellow-400/10 bg-zinc-900/60 p-4">
              <h4 className="font-semibold">Tournament #{i}</h4>
              <p className="text-sm text-zinc-400">Starts soon • Squad based</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
