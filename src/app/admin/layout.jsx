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
        router.replace("/login");
      }
    };

    checkAdmin();
  }, []);

  if (!allowed) return null; // 👈 flash gone

  return <>{children}</>;
}
