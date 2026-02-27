"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, QrCode, Camera, ArrowLeft, Check, AlertCircle, Gamepad2, MapPin, Zap } from "lucide-react";
import {
  getMyProfile,
  createProfile,
  updateProfile,
  uploadProfilePhoto,
  uploadProfileQR,
} from "@/services/profileService";

const ROLES = ["PRIMARY", "SECONDARY", "SNIPER", "NADER", "IGL"];
const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

/* ── form field components ───────────────────────── */
function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {label}
        {required && <span className="text-yellow-400 text-[10px]">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-zinc-700">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, mono = false, ...rest }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white
        placeholder-zinc-700 outline-none transition
        focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
        hover:border-zinc-700
        ${mono ? "font-mono tracking-widest" : ""}`}
      {...rest}
    />
  );
}

function SelectInput({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-white
        outline-none transition focus:border-yellow-400/60 focus:ring-1 focus:ring-yellow-400/20
        hover:border-zinc-700 appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

/* ── avatar upload well ──────────────────────────── */
function AvatarUpload({ preview, onChange }) {
  return (
    <label className="group relative cursor-pointer block w-28 h-28 mx-auto">
      <div className="w-28 h-28 rounded-full border-2 border-yellow-400/20 bg-zinc-900 overflow-hidden flex items-center justify-center group-hover:border-yellow-400/50 transition">
        {preview
          ? <img src={preview} className="w-full h-full object-cover" alt="avatar" />
          : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <User size={36} className="text-zinc-600" />
            </div>
          )
        }
      </div>
      {/* hover overlay */}
      <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
        <Camera size={20} className="text-yellow-400" />
      </div>
      <input type="file" hidden accept="image/*" onChange={(e) => onChange(e.target.files[0])} />
    </label>
  );
}

/* ── QR upload well ──────────────────────────────── */
function QRUpload({ preview, onChange }) {
  return (
    <label className="group relative cursor-pointer block w-28 h-28 mx-auto">
      <div className="w-28 h-28 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center group-hover:border-yellow-400/40 transition">
        {preview
          ? <img src={preview} className="w-full h-full object-cover" alt="QR" />
          : <QrCode size={32} className="text-zinc-600 group-hover:text-zinc-500 transition" />
        }
      </div>
      <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
        <Camera size={20} className="text-yellow-400" />
      </div>
      <input type="file" hidden accept="image/*" onChange={(e) => onChange(e.target.files[0])} />
    </label>
  );
}

/* ════════════════════════════════════════════════════ */
export default function EditPlayerProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [qrPreview, setQrPreview] = useState(null);
  const [form, setForm] = useState({ state: "", inGameName: "", gameUID: "", roles: [] });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getMyProfile();
        setIsEdit(true);
        setForm({ state: data.state || "", inGameName: data.inGameName || "", gameUID: data.gameUID || "", roles: data.roles || [] });
        setPhotoPreview(data.profilePhoto || null);
        setQrPreview(data.profileQR || null);
      } catch (err) {
        if (err.response?.status !== 404) setError("Failed to load profile");
      } finally { setLoading(false); }
    })();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleRole = (role) => setForm((prev) => ({
    ...prev,
    roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.inGameName || !form.gameUID) { setError("In-game name and Game UID are required"); return; }
    setSaving(true);
    try {
      if (isEdit) await updateProfile(form);
      else await createProfile(form);
      if (photoFile) await uploadProfilePhoto(photoFile);
      if (qrFile) await uploadProfileQR(qrFile);
      router.push("/dashboard/profile");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save profile");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-10">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.push("/dashboard/profile")}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-700 text-zinc-400 hover:border-yellow-400/50 hover:text-yellow-400 transition shrink-0">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            {isEdit ? "Edit Profile" : "Create Profile"}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isEdit ? "Update your player information" : "Set up your player card to compete"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ══ IDENTITY CARD ════════════════════════════ */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          {/* section header */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <User size={13} className="text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-400">Identity</span>
          </div>

          <div className="p-6 flex flex-col sm:flex-row gap-8">
            {/* avatar + QR upload */}
            <div className="flex sm:flex-col items-start gap-6 sm:gap-5 shrink-0">
              <div className="text-center space-y-2">
                <AvatarUpload preview={photoPreview} onChange={(f) => { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }} />
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Photo</p>
              </div>
              <div className="text-center space-y-2">
                <QRUpload preview={qrPreview} onChange={(f) => { setQrFile(f); setQrPreview(URL.createObjectURL(f)); }} />
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">QR Code</p>
              </div>
            </div>

            {/* text fields */}
            <div className="flex-1 space-y-4">
              <Field label="In-Game Name" required>
                <TextInput
                  name="inGameName"
                  value={form.inGameName}
                  onChange={handleChange}
                  placeholder="Your battle name"
                />
              </Field>

              <Field label="Game UID" required hint="Your unique in-game identifier">
                <TextInput
                  name="gameUID"
                  value={form.gameUID}
                  onChange={handleChange}
                  placeholder="e.g. 5123456789"
                  mono
                />
              </Field>

              <Field label="State">
                <SelectInput name="state" value={form.state} onChange={handleChange}>
                  <option value="">— Select state —</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </SelectInput>
              </Field>
            </div>
          </div>
        </div>

        {/* ══ ROLES CARD ═══════════════════════════════ */}
        <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800 bg-zinc-900/50">
            <Gamepad2 size={13} className="text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-[3px] text-zinc-400">Preferred Roles</span>
            <span className="ml-auto text-[10px] text-zinc-600">{form.roles.length} selected</span>
          </div>

          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => {
                const active = form.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider border transition-all duration-150
                      ${active
                        ? "bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-400/20"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                      }`}
                  >
                    {active && <Check size={13} />}
                    {role}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-700 mt-3">Click to toggle — multiple roles can be selected</p>
          </div>
        </div>

        {/* ── ERROR ────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-400/5 border border-red-400/20 text-red-400 text-sm">
            <AlertCircle size={15} className="shrink-0" />
            {error}
          </div>
        )}

        {/* ── ACTIONS ──────────────────────────────── */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 text-black font-bold text-sm hover:bg-yellow-300 transition shadow-lg shadow-yellow-400/20 disabled:opacity-50"
          >
            {saving
              ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Saving…</>
              : <><Zap size={14} /> {isEdit ? "Save Changes" : "Create Profile"}</>
            }
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-200 transition"
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
}
