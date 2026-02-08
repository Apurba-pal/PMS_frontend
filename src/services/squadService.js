import api from "./api";

/* CREATE */
export const createSquad = (data) =>
  api.post("/squad", data);

/* MY SQUAD */
export const getMySquad = () =>
  api.get("/squad/me");

/* INVITES */
export const getMyInvites = () =>
  api.get("/squad/invites/me");

export const acceptInvite = (inviteId) =>
  api.post(`/squad/invite/${inviteId}/accept`);

export const rejectInvite = (inviteId) =>
  api.post(`/squad/invite/${inviteId}/reject`);

/* SEARCH */
export const searchSquads = (q) =>
  api.get(`/squad/search?q=${q}`);

/* JOIN REQUESTS */
export const sendJoinRequest = (squadId) =>
  api.post("/squad/join-request", { squadId });

export const getJoinRequests = () =>
  api.get("/squad");

export const acceptJoinRequest = (requestId) =>
  api.post(`/squad/join-request/${requestId}/accept`);

export const rejectJoinRequest = (requestId) =>
  api.post(`/squad/join-request/${requestId}/reject`);

/* LEAVE / DISBAND */
export const requestLeaveSquad = () =>
  api.post("/squad/leave-request");

export const disbandSquad = () =>
  api.post("/squad/disband");

/* LOGO */
export const uploadSquadLogo = (file) => {
  const fd = new FormData();
  fd.append("image", file);
  return api.post("/squad/upload-logo", fd);
};

export const deleteSquadLogo = () =>
  api.delete("/squad/delete-logo");
