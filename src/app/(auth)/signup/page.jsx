"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // 🔒 STRICT INPUT HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // Name → letters + space only
    if (name === "name") {
      newValue = value.replace(/[^A-Za-z ]/g, "");
    }

    // Phone → digits only + max 10
    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm({ ...form, [name]: newValue });
    setErrors({ ...errors, [name]: "" });
  };

  // 🔒 VALIDATION LOGIC (FINAL CHECK)
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (form.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(form.password)) {
      newErrors.password =
        "Password must be at least 8 characters and include letters & numbers";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const dob = new Date(form.dob);
      const today = new Date();
      const age =
        today.getFullYear() -
        dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
          ? 1
          : 0);

      if (age < 16) {
        newErrors.dob = "You must be at least 16 years old";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await signupUser(form);
      router.push("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* LEFT */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16">
        <h1 className="text-5xl font-bold">
          Enter the <span className="text-yellow-400">Battlefield</span>
        </h1>
        <p className="mt-6 text-zinc-400">
          Create squads. Compete. Rise through the ranks.
        </p>
      </div>

      {/* FORM */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 rounded-2xl bg-zinc-900/70 p-8"
        >
          <h2 className="text-2xl font-bold text-yellow-400">
            Create Account
          </h2>

          {/* NAME */}
          <input
            name="name"
            placeholder="NAME"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3"
          />
          {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            placeholder="EMAIL"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3"
          />
          {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}

          {/* PHONE */}
          <input
            type="tel"
            name="phone"
            placeholder="PHONE"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3"
          />
          {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}

          {/* USERNAME */}
          <input
            name="username"
            placeholder="USERNAME"
            value={form.username}
            onChange={handleChange}
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="PASSWORD"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md bg-black/40 border border-zinc-700 p-3 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm">{errors.password}</p>
          )}

          {/* DOB */}
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            className="w-full rounded-md bg-black/40 border border-zinc-700 p-3"
          />
          {errors.dob && <p className="text-red-400 text-sm">{errors.dob}</p>}

          <Button className="w-full bg-yellow-400 text-black">
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
