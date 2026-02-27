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
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [allowed, setAllowed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close sidebar on route change (mobile navigation)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

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

  // Current page label for top bar — same matching logic as the active tab
  const currentPage =
    navItems.find((i) =>
      i.href === "/dashboard"
        ? pathname === i.href
        : pathname === i.href || pathname.startsWith(i.href + "/")
    )?.name ?? "Dashboard";

  /* ── shared sidebar content ───────────────────── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* BRAND */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="text-yellow-400 font-extrabold text-lg tracking-tight">
            ESPORTS
          </span>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            Player Portal
          </div>
        </div>
        {/* close button – mobile only */}
        <button
          className="md:hidden text-zinc-400 hover:text-white transition p-1"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAV */}
      <nav className="space-y-1 flex-1">
        {navItems.map(({ name, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={name}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150
                ${active
                  ? "bg-yellow-400 text-black shadow-md shadow-yellow-400/20"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
            >
              <Icon size={17} className="shrink-0" />
              <span className="flex-1">{name}</span>
              {active && (
                <ChevronRight size={14} className="opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <div className="pt-4 mt-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/10"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* ── DESKTOP SIDEBAR ────────────────────────── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-yellow-400/10 bg-zinc-900/70 p-6 sticky top-0 h-screen flex-col">
        <SidebarContent />
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ─────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-zinc-950 border-r border-yellow-400/10 p-6
          transform transition-transform duration-300 ease-in-out md:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* ── MAIN AREA ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP BAR */}
        <header className="sticky top-0 z-30 h-16 border-b border-yellow-400/10 bg-zinc-900/80 backdrop-blur-md flex items-center gap-4 px-4 md:px-6">

          {/* Hamburger – mobile only */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:text-yellow-400 hover:border-yellow-400/40 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-yellow-400 font-extrabold text-sm tracking-tight md:hidden">
              ESPORTS
            </span>
            <span className="text-zinc-600 md:hidden">/</span>
            <h2 className="text-sm font-semibold text-white truncate">
              {currentPage}
            </h2>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 md:p-6 bg-black">
          {children}
        </main>

      </div>
    </div>
  );
}
