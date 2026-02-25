"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, QrCode, Camera } from "lucide-react";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadProfileQR,
} from "@/services/profileService";

const ROLES = ["PRIMARY", "SECONDARY", "SNIPER", "NADER", "IGL"];

export default function EditPlayerProfile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");

  const [photoFile, setPhotoFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);

  const [form, setForm] = useState({
    state: "",
    inGameName: "",
    gameUID: "",
    roles: [],
  });

  /* LOAD PROFILE */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getMyProfile();
        setIsEdit(true);

        setForm({
          state: data.state || "",
          inGameName: data.inGameName || "",
          gameUID: data.gameUID || "",
          roles: data.roles || [],
        });

        setPhotoPreview(data.profilePhoto || null);
        setQrPreview(data.profileQR || null);
      } catch (err) {
        if (err.response?.status === 404) {
          setIsEdit(false);
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleRole = (role) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.inGameName || !form.gameUID) {
      setError("In-game name and UID are required");
      return;
    }

    try {
      if (isEdit) {
        await updateProfile(form);
      } else {
        await createProfile(form);
      }

      if (photoFile) await uploadProfilePhoto(photoFile);
      if (qrFile) await uploadProfileQR(qrFile);

      router.push("/dashboard/profile");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-yellow-400">
        {isEdit ? "Edit Player Profile" : "Create Player Profile"}
      </h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT – IDENTITY */}
        <div className="lg:col-span-1 rounded-xl bg-zinc-900/70 border border-yellow-400/10 p-6 space-y-6">
          <ProfileImage
            label="Change Profile Photo"
            preview={photoPreview}
            icon={<User />}
            onChange={(file) => {
              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(file));
            }}
          />

          <ProfileImage
            label="Chnage Profile QR"
            preview={qrPreview}
            icon={<QrCode />}
            square
            onChange={(file) => {
              setQrFile(file);
              setQrPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        {/* RIGHT – DETAILS */}
        <div className="lg:col-span-3 rounded-xl bg-zinc-900/70 border border-yellow-400/10 p-8 space-y-8">

          <Section title="Player Information">
            <Input label="State" name="state" value={form.state} onChange={handleChange} />
            <Input label="In-Game Name *" name="inGameName" value={form.inGameName} onChange={handleChange} />
            <Input label="Game UID *" name="gameUID" value={form.gameUID} onChange={handleChange} />
          </Section>

          <Section title="Preferred Roles">
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition ${form.roles.includes(role)
                    ? "bg-yellow-400 text-black border-yellow-400"
                    : "border-zinc-700 text-zinc-300 hover:border-yellow-400"
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </Section>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-4 pt-4 border-t border-yellow-400/10">
            <Button
              type="submit"
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              {isEdit ? "Save Changes" : "Create Profile"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-yellow-600 text-yellow-300 bg-transparent hover:bg-amber-600"
              onClick={() => router.push("/dashboard/profile")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* 🔹 SMALL COMPONENTS */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-wide text-zinc-400 mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-xs text-zinc-400">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-md bg-black/40 border border-zinc-700 p-3 focus:border-yellow-400 outline-none"
      />
    </div>
  );
}

function ProfileImage({ label, preview, icon, square = false, onChange }) {
  return (
    <div className="space-y-2 text-center">
      <div
        className={`mx-auto ${square ? "w-24 h-24 rounded-lg" : "w-32 h-32 rounded-full"
          } bg-zinc-800 flex items-center justify-center overflow-hidden`}
      >
        {preview ? (
          <img src={preview} className="w-full h-full object-cover" />
        ) : (
          <div className="text-zinc-500">{icon}</div>
        )}
      </div>

      <label className="inline-flex items-center gap-2 text-xs cursor-pointer 
  rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 
  text-zinc-300 transition 
  hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400">
        <Camera size={14} /> {label}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => onChange(e.target.files[0])}
        />
      </label>
    </div>
  );

}
