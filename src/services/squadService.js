import api from "./api";

/* =======================
   CREATE / FETCH
======================= */

// Create squad
export const createSquad = (data) =>
  api.post("/squads", data);

// Get my squad
export const getMySquad = () =>
  api.get("/squads/me");


/* =======================
   INVITES (Squad → Player)
======================= */

// IGL sends invite to player
export const sendInvite = (playerId) =>
  api.post("/squads/invite", { playerId });

// IGL sees invites sent by his squad
export const getSquadSentInvites = () =>
  api.get("/squads/invites/sent");

// IGL cancels sent invite  ✅ (MISSING)
export const cancelInvite = (inviteId) =>
  api.post(`/squads/invite/${inviteId}/cancel`);

// Player sees invites received
export const getMyInvites = () =>
  api.get("/squads/invites/me");

// Player accepts invite
export const acceptInvite = (inviteId) =>
  api.post(`/squads/invite/${inviteId}/accept`);

// Player rejects invite
export const rejectInvite = (inviteId) =>
  api.post(`/squads/invite/${inviteId}/reject`);


/* =======================
   SEARCH
======================= */

// Player searches squads
export const searchSquads = (q, type = "all") =>
  api.get(`/squads/search?q=${q}&type=${type}`);


/* =======================
   JOIN REQUESTS (Player → Squad)
======================= */

// Player sends join request
export const sendJoinRequest = (squadId) =>
  api.post("/squads/join-request", { squadId });

// Player sees join requests they sent ✅ (MISSING)
export const getMyJoinRequests = () =>
  api.get("/squads/join-requests/me");

// Player cancels join request ✅ (MISSING)
export const cancelJoinRequest = (requestId) =>
  api.post(`/squads/join-request/${requestId}/cancel`);

// IGL gets join requests for his squad
export const getSquadJoinRequests = () =>
  api.get("/squads/join-requests");

// IGL accepts join request
export const acceptJoinRequest = (requestId) =>
  api.post(`/squads/join-request/${requestId}/accept`);

// IGL rejects join request
export const rejectJoinRequest = (requestId) =>
  api.post(`/squads/join-request/${requestId}/reject`);


/* =======================
   LEAVE REQUESTS
======================= */

// Player requests to leave squad
export const requestLeaveSquad = () =>
  api.post("/squads/leave-request");

// IGL sees leave requests ✅ (MISSING)
export const getSquadLeaveRequests = () =>
  api.get("/squads/leave-requests");

// IGL approves leave request
export const approveLeaveRequest = (requestId) =>
  api.post(`/squads/leave-request/${requestId}/approve`);

// IGL rejects leave request ✅ (MISSING)
export const rejectLeaveRequest = (requestId) =>
  api.post(`/squads/leave-request/${requestId}/reject`);


/* =======================
   LEADERSHIP / REMOVAL
======================= */

// IGL transfers leadership ✅ (MISSING)
export const transferIGL = (newIglId) =>
  api.post("/squads/transfer-igl", { newIglId });

// IGL kicks player
export const kickPlayer = (playerId) =>
  api.post("/squads/kick", { playerId });

// IGL disbands squad
export const disbandSquad = () =>
  api.post("/squads/disband");


/* =======================
   LOGO
======================= */

// Upload squad logo
export const uploadSquadLogo = (file) => {
  const fd = new FormData();
  fd.append("image", file);
  return api.post("/squads/upload-logo", fd);
};

// Delete squad logo
export const deleteSquadLogo = () =>
  api.delete("/squads/delete-logo");

// Rename squad (IGL only)
export const renameSquad = (squadName) =>
  api.patch("/squads/rename", { squadName });
