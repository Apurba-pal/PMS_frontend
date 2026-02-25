import api from "./api";

export const loginUser  = (data) => api.post("/auth/login",  data);
export const signupUser = (data) => api.post("/auth/signup", data);
export const logoutUser = ()     => api.post("/auth/logout");

// Returns { userId, role } for the currently logged-in user
export const getMe = () => api.get("/auth/me");