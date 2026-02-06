"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Gamepad2, QrCode, Users } from "lucide-react";

/* 🧮 AGE CALCULATOR */
const calculateAge = (dob) => {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

export default function PlayerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/player/me",
          { credentials: "include" }
        );

        if (res.status === 404) {
          setProfile(null);
          return;
        }

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return null;

  /* ❌ NO PROFILE */
  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-3xl font-bold text-yellow-400">
          No Player Profile
        </h2>
        <p className="text-zinc-400 max-w-md">
          Create your player profile to participate in squads and tournaments.
        </p>
        <Button
          className="bg-yellow-400 text-black hover:bg-yellow-300"
          onClick={() => router.push("/dashboard/profile/edit")}
        >
          Create Player Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* HERO */}
      <div className="relative rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/70 to-black border border-yellow-400/10 p-8 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-yellow-400/10 blur-[120px]" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* PROFILE PHOTO */}
          <div className="w-32 h-32 rounded-full bg-zinc-800 overflow-hidden flex items-center justify-center">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-zinc-500" />
            )}
          </div>

          {/* BASIC INFO */}
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl font-bold text-white">
              {profile.inGameName || "—"}
            </h1>
            <p className="text-zinc-400">@{profile.user.username}</p>
            <p className="text-sm text-yellow-400">
              UID: {profile.gameUID || "—"}
            </p>
          </div>

          <div className="md:ml-auto">
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-300"
              onClick={() => router.push("/dashboard/profile/edit")}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Age" value={calculateAge(profile.user.dob)} />
        <Stat label="State" value={profile.state} />
        <Stat label="Status" value={profile.playerStatus} />
        <Stat
          label="Current Squad"
          value={profile.currentSquad?.name || "—"}
        />
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* ROLES */}
        <div className="rounded-xl bg-zinc-900/60 border border-yellow-400/10 p-6">
          <h3 className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
            <Gamepad2 size={16} /> Preferred Roles
          </h3>

          <div className="flex flex-wrap gap-2">
            {profile.roles?.length ? (
              profile.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-yellow-400/10 text-yellow-400 px-3 py-1 text-xs"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="text-zinc-500 text-sm">
                No roles selected
              </span>
            )}
          </div>
        </div>

        {/* PREVIOUS SQUADS */}
        <div className="rounded-xl bg-zinc-900/60 border border-yellow-400/10 p-6">
          <h3 className="text-sm text-zinc-400 mb-3 flex items-center gap-2">
            <Users size={16} /> Previous Squads
          </h3>

          {profile.previousSquads?.length ? (
            <ul className="space-y-2 text-sm text-white">
              {profile.previousSquads.map((squad, i) => (
                <li
                  key={i}
                  className="rounded-md bg-black/40 px-3 py-2"
                >
                  {squad}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-sm">
              No previous squads
            </p>
          )}
        </div>

        {/* QR */}
        <div className="rounded-xl bg-zinc-900/60 border border-yellow-400/10 p-6 flex flex-col items-center justify-center gap-3">
          <div className="w-28 h-28 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
            {profile.profileQR ? (
              <img
                src={profile.profileQR}
                className="w-full h-full object-cover"
              />
            ) : (
              <QrCode className="text-zinc-500" size={40} />
            )}
          </div>
          <p className="text-sm text-zinc-400">Profile QR</p>
        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-zinc-900/60 border border-yellow-400/10 p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-zinc-400">
        {label}
      </p>
      <p className="text-lg font-semibold text-white mt-1">
        {value ?? "—"}
      </p>
    </div>
  );
}
