import api from "./api";

/* =======================
   VERIFICATION REQUESTS
======================= */

// List all requests, optionally filter by status (PENDING | APPROVED | REJECTED)
export const getVerificationRequests = (status) =>
  api.get("/admin/verifications", { params: status ? { status } : {} });

// Get single request + player profile
export const getVerificationRequestById = (id) =>
  api.get(`/admin/verifications/${id}`);

// Approve or Reject
export const reviewVerificationRequest = (id, { status, adminNote }) =>
  api.patch(`/admin/verifications/${id}`, { status, adminNote });

/* =======================
   PLAYER MANAGEMENT
======================= */

// List all players with merged profile data
export const getAllPlayers = () =>
  api.get("/admin/players");

// Toggle DISABLED ↔ UNVERIFIED
export const togglePlayerDisable = (userId) =>
  api.patch(`/admin/players/${userId}/disable`);

// Promote a player to ADMIN (player must have no squad)
export const promoteToAdmin = (userId) =>
  api.patch(`/admin/players/${userId}/promote`);
