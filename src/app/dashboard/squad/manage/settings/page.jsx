"use client";

import { useState, useRef } from "react";
import { useSquadStore } from "@/store/squadStore";
import {
    renameSquad,
    uploadSquadLogo,
    deleteSquadLogo,
} from "@/services/squadService";
import Image from "next/image";

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
    if (!message) return null;
    return (
        <div className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium border ${type === "error"
                ? "bg-red-500/10 border-red-500/25 text-red-400"
                : "bg-green-500/10 border-green-500/25 text-green-400"
            }`}>
            {type === "error"
                ? <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                : <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
            }
            {message}
        </div>
    );
}

function SectionCard({ title, children }) {
    return (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white/60 tracking-widest uppercase mb-5">{title}</h2>
            {children}
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SquadSettingsPage() {
    const { squad, refreshSquad } = useSquadStore();

    // ── Rename state
    const [nameInput, setNameInput] = useState(squad?.squadName ?? "");
    const [nameLoading, setNameLoading] = useState(false);
    const [nameMsg, setNameMsg] = useState({ text: "", type: "" });

    // ── Logo state
    const [preview, setPreview] = useState(null);       // local blob URL
    const [selectedFile, setSelectedFile] = useState(null);
    const [logoLoading, setLogoLoading] = useState(false);
    const [logoMsg, setLogoMsg] = useState({ text: "", type: "" });
    const fileRef = useRef();

    if (!squad) {
        return (
            <div className="flex items-center justify-center h-40 text-white/30 text-sm">
                Loading squad…
            </div>
        );
    }

    // ── Rename ────────────────────────────────────────────────────────────────
    const handleRename = async (e) => {
        e.preventDefault();
        const trimmed = nameInput.trim();
        if (!trimmed) return setNameMsg({ text: "Name cannot be empty", type: "error" });
        if (trimmed === squad.squadName) return setNameMsg({ text: "No change detected", type: "error" });

        setNameLoading(true);
        setNameMsg({ text: "", type: "" });
        try {
            await renameSquad(trimmed);
            await refreshSquad();
            setNameMsg({ text: "Squad name updated!", type: "success" });
        } catch (err) {
            setNameMsg({ text: err.response?.data?.message ?? "Rename failed", type: "error" });
        } finally {
            setNameLoading(false);
        }
    };

    // ── Logo file pick ────────────────────────────────────────────────────────
    const handleFilePick = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024)
            return setLogoMsg({ text: "Image must be under 5 MB", type: "error" });

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setLogoMsg({ text: "", type: "" });
    };

    // ── Upload logo ───────────────────────────────────────────────────────────
    const handleUpload = async () => {
        if (!selectedFile) return;
        setLogoLoading(true);
        setLogoMsg({ text: "", type: "" });
        try {
            await uploadSquadLogo(selectedFile);
            await refreshSquad();
            setSelectedFile(null);
            setPreview(null);
            setLogoMsg({ text: "Logo updated!", type: "success" });
        } catch (err) {
            setLogoMsg({ text: err.response?.data?.message ?? "Upload failed", type: "error" });
        } finally {
            setLogoLoading(false);
        }
    };

    // ── Delete logo ───────────────────────────────────────────────────────────
    const handleDeleteLogo = async () => {
        if (!squad.logo) return;
        setLogoLoading(true);
        setLogoMsg({ text: "", type: "" });
        try {
            await deleteSquadLogo();
            await refreshSquad();
            setPreview(null);
            setSelectedFile(null);
            setLogoMsg({ text: "Logo removed", type: "success" });
        } catch (err) {
            setLogoMsg({ text: err.response?.data?.message ?? "Delete failed", type: "error" });
        } finally {
            setLogoLoading(false);
        }
    };

    const displayImg = preview ?? squad.logo ?? null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page heading */}
            <div>
                <p className="text-yellow-400 text-[0.62rem] font-bold tracking-[0.18em] uppercase mb-1">IGL Controls</p>
                <h1 className="text-2xl font-black text-white tracking-tight">Squad Settings</h1>
                <p className="text-white/35 text-sm mt-0.5">Edit your squad's identity — name and logo.</p>
            </div>

            {/* ── SECTION: Squad Name ── */}
            <SectionCard title="Squad Name">
                <form onSubmit={handleRename} className="space-y-3">
                    <div className="relative">
                        {/* Icon */}
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                            </svg>
                        </span>
                        <input
                            value={nameInput}
                            onChange={e => { setNameInput(e.target.value); setNameMsg({ text: "", type: "" }); }}
                            placeholder="Enter new squad name"
                            className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow-400/50 focus:bg-yellow-400/[0.03] transition-all"
                        />
                    </div>

                    {nameMsg.text && <Toast message={nameMsg.text} type={nameMsg.type} />}

                    <div className="flex items-center justify-between">
                        <p className="text-white/25 text-xs">Current name:&nbsp;
                            <span className="text-yellow-400 font-semibold">{squad.squadName}</span>
                        </p>
                        <button
                            type="submit"
                            disabled={nameLoading || !nameInput.trim() || nameInput.trim() === squad.squadName}
                            className="flex items-center gap-2 px-5 py-2 bg-yellow-400 text-black text-sm font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_16px_rgba(250,204,21,0.25)] hover:bg-yellow-300 hover:shadow-[0_0_28px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
                        >
                            {nameLoading && (
                                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
                            )}
                            {nameLoading ? "Saving…" : "Save Name"}
                        </button>
                    </div>
                </form>
            </SectionCard>

            {/* ── SECTION: Squad Logo ── */}
            <SectionCard title="Squad Logo">
                <div className="flex flex-col sm:flex-row gap-6 items-start">

                    {/* Preview */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        className="relative group shrink-0 w-28 h-28 rounded-2xl border-2 border-dashed border-white/15 bg-black/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-yellow-400/40 transition-colors"
                    >
                        {displayImg ? (
                            <>
                                <Image src={displayImg} alt="Squad logo" fill className="object-cover" unoptimized />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-white/25">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                <span className="text-[0.6rem] font-medium tracking-wider uppercase">Upload</span>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-3">
                        <p className="text-white/40 text-xs leading-relaxed">
                            Click the box to choose an image, or drag one. Max 5 MB · PNG, JPG, WebP supported.
                        </p>

                        {/* Hidden file input */}
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={handleFilePick}
                        />

                        {/* File info */}
                        {selectedFile && (
                            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2">
                                <svg className="w-3.5 h-3.5 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                                <span className="text-white/60 text-xs truncate">{selectedFile.name}</span>
                                <span className="text-white/30 text-xs shrink-0">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                            </div>
                        )}

                        {logoMsg.text && <Toast message={logoMsg.text} type={logoMsg.type} />}

                        {/* Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.06] border border-white/10 text-white/70 text-xs font-semibold rounded-xl hover:bg-white/[0.1] hover:text-white transition-all"
                            >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                                Choose File
                            </button>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || logoLoading}
                                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-400 text-black text-xs font-extrabold tracking-widest uppercase rounded-xl shadow-[0_0_16px_rgba(250,204,21,0.25)] hover:bg-yellow-300 hover:shadow-[0_0_28px_rgba(250,204,21,0.4)] hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all"
                            >
                                {logoLoading && !selectedFile ? null : logoLoading ? (
                                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" /></svg>
                                ) : null}
                                {logoLoading ? "Uploading…" : "Upload Logo"}
                            </button>

                            {squad.logo && (
                                <button
                                    type="button"
                                    onClick={handleDeleteLogo}
                                    disabled={logoLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                                    Remove Logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
