"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(form);
      login({});
      const res = await fetch("http://localhost:5000/api/auth/me", {
  credentials: "include",
});
const data = await res.json();

if (data.role === "ADMIN") {
  router.replace("/admin");
} else {
  router.replace("/dashboard");
}

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative">
        <div className="absolute top-20 left-20 h-72 w-72 bg-yellow-400/20 blur-[120px]" />
        <h1 className="text-5xl font-bold leading-tight">
          Welcome Back, <span className="text-yellow-400">Champion</span>
        </h1>
        <p className="mt-6 text-zinc-400 text-lg max-w-md">
          Your squad is waiting. Log in, lead the charge, and climb the ranks.
        </p>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-2xl border border-yellow-400/20 bg-zinc-900/70 p-8 backdrop-blur"
        >
          <h2 className="text-2xl font-bold text-yellow-400">Login</h2>

          <input
            name="identifier"
            placeholder="Email / Username / Phone"
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3 focus:border-yellow-400 outline-none"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3 focus:border-yellow-400 outline-none"
            onChange={handleChange}
          />

          <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
            {loading ? "Entering Arena..." : "Enter Arena"}
          </Button>

          <p className="text-sm text-zinc-400 text-center">
            New player?{" "}
            <span
              className="text-yellow-400 cursor-pointer"
              onClick={() => router.push("/signup")}
            >
              Create account
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
