"use client";

import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { LogOut } from "lucide-react";

export default function AdminHome() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-bold text-yellow-400">
        Admin Panel
      </h1>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 rounded-md bg-yellow-400 px-5 py-2 font-semibold text-black hover:bg-yellow-300"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
