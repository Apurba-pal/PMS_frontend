"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/services/authService";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    dob: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signupUser(form);
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 relative">
        <div className="absolute top-20 left-20 h-72 w-72 bg-yellow-400/20 blur-[120px]" />
        <h1 className="text-5xl font-bold leading-tight">
          Enter the <span className="text-yellow-400">Battlefield</span>
        </h1>
        <p className="mt-6 text-zinc-400 text-lg max-w-md">
          Create squads. Compete in tournaments. Rise through the ranks.
          This is where champions are built.
        </p>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 rounded-2xl border border-yellow-400/20 bg-zinc-900/70 p-8 backdrop-blur"
        >
          <h2 className="text-2xl font-bold text-yellow-400">Create Account</h2>

          {Object.keys(form).map((key) => (
            <input
              key={key}
              name={key}
              type={key === "password" ? "password" : "text"}
              placeholder={key.toUpperCase()}
              className="w-full rounded-md bg-black/40 border border-zinc-700 p-3 focus:border-yellow-400 outline-none"
              onChange={handleChange}
            />
          ))}

          <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300">
            Join the Arena
          </Button>

          <p className="text-sm text-zinc-400 text-center">
            Already a player?{" "}
            <span
              className="text-yellow-400 cursor-pointer"
              onClick={() => router.push("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
