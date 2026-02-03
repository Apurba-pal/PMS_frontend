"use client";
import useAuthGuard from "@/hooks/useAuthGuard";

export default function DashboardLayout({ children }) {
  useAuthGuard();

  return <div>{children}</div>;
}
