"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { LogOut, ShieldCheck, Users, ClipboardList, Settings } from "lucide-react";

const NAV_CARDS = [
  {
    href: "/admin/verifications",
    icon: ShieldCheck,
    label: "Verification Requests",
    desc: "Review player ID verification submissions",
    accent: "from-yellow-400/10 to-yellow-400/5",
    border: "border-yellow-400/20 hover:border-yellow-400/50",
    iconColor: "text-yellow-400",
  },
  {
    href: "/admin/players",
    icon: Users,
    label: "Player Management",
    desc: "View all players, disable or enable accounts",
    accent: "from-blue-400/10 to-blue-400/5",
    border: "border-blue-400/20 hover:border-blue-400/50",
    iconColor: "text-blue-400",
  },
];

export default function AdminHome() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <header className="border-b border-zinc-800/80 bg-black/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
            <Settings size={15} className="text-black" />
          </div>
          <span className="font-bold text-white tracking-tight">Admin Panel</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-zinc-800"
        >
          <LogOut size={15} /> Logout
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-widest">
            <ShieldCheck size={12} /> Admin Control
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">
            Admin Dashboard
          </h1>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Manage players, review ID verification requests, and maintain platform integrity.
          </p>
        </div>

        {/* Nav Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NAV_CARDS.map(({ href, icon: Icon, label, desc, accent, border, iconColor }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className={`text-left rounded-2xl bg-gradient-to-br ${accent} border ${border} p-6 transition-all duration-200 group`}
            >
              <div className={`w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center mb-4 ${iconColor}`}>
                <Icon size={20} />
              </div>
              <p className="font-bold text-white text-base mb-1 group-hover:text-yellow-300 transition">
                {label}
              </p>
              <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
