"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutUser, getMe } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import {
  LayoutDashboard,
  User,
  Users,
  Trophy,
  LogOut
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkPlayer = async () => {
      try {
        const { data } = await getMe();

        if (data.role !== "PLAYER") {
          router.replace("/admin");
          return;
        }

        setAllowed(true);
      } catch {
        router.replace("/login");
      }
    };

    checkPlayer();
  }, []);

  if (!allowed) return null;

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Squad", href: "/dashboard/squad", icon: Users },
    { name: "Tournaments", href: "/dashboard/tournaments", icon: Trophy },
  ];

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-yellow-400/10 bg-zinc-900/60 p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold text-yellow-400 mb-10">ESPORTS</h1>

        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2 transition ${pathname === item.href
                    ? "bg-yellow-400 text-black"
                    : "hover:bg-zinc-800 text-zinc-300"
                  }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center justify-center gap-2 rounded-md bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="h-16 border-b border-yellow-400/10 bg-zinc-900/60 flex items-center px-6">
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-black">
          {children}
        </main>

      </div>
    </div>
  );
}
