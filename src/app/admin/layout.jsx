"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/services/authService";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data } = await getMe();

        if (data.role !== "ADMIN") {
          router.replace("/dashboard");
          return;
        }

        setAllowed(true);
      } catch {
        // If auth fails, clear the frontend session cookie to prevent infinite loops
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.replace("/login");
      }
    };

    checkAdmin();
  }, []);

  if (!allowed) return null; // 👈 flash gone

  return <>{children}</>;
}
