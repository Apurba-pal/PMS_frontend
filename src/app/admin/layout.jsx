"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await fetch(
        "http://localhost:5000/api/auth/me",
        { credentials: "include" }
      );

      if (!res.ok) {
        router.replace("/login");
        return;
      }

      const data = await res.json();

      if (data.role !== "ADMIN") {
        router.replace("/dashboard");
        return;
      }

      setAllowed(true); // ✅ only now render
    };

    checkAdmin();
  }, []);

  if (!allowed) return null; // 👈 flash gone

  return <>{children}</>;
}
