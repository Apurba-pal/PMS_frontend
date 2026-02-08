import api from "./api";

/* =======================
   CREATE / FETCH
======================= */

export const createSquad = (data) =>
  api.post("/squads", data);

export const getMySquad = () =>
  api.get("/squads/me");

/* =======================
   INVITES (Squad → Player)
======================= */

export const sendInvite = (playerId) =>
  api.post("/squads/invite", { playerId });

export const getMyInvites = () =>
  api.get("/squads/invites/me");

export const acceptInvite = (inviteId) =>
  api.post(`/squads/invite/${inviteId}/accept`);

export const rejectInvite = (inviteId) =>
  api.post(`/squads/invite/${inviteId}/reject`);

/* =======================
   SEARCH
======================= */

export const searchSquads = (q) =>
  api.get(`/squads/search?q=${q}`);

/* =======================
   JOIN REQUESTS (Player → Squad)
======================= */

export const sendJoinRequest = (squadId) =>
  api.post("/squads/join-request", { squadId });

export const getJoinRequests = () =>
  api.get("/squads");

export const acceptJoinRequest = (requestId) =>
  api.post(`/squads/join-request/${requestId}/accept`);

export const rejectJoinRequest = (requestId) =>
  api.post(`/squads/join-request/${requestId}/reject`);

/* =======================
   LEAVE / KICK / DISBAND
======================= */

export const requestLeaveSquad = () =>
  api.post("/squads/leave-request");

export const approveLeaveRequest = (requestId) =>
  api.post(`/squads/leave-request/${requestId}/approve`);

export const kickPlayer = (playerId) =>
  api.post("/squads/kick", { playerId });

export const disbandSquad = () =>
  api.post("/squads/disband");

/* =======================
   LOGO
======================= */

export const uploadSquadLogo = (file) => {
  const fd = new FormData();
  fd.append("image", file);
  return api.post("/squads/upload-logo", fd);
};

export const deleteSquadLogo = () =>
  api.delete("/squads/delete-logo");
