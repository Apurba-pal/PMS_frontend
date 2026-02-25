import api from "./api";

/* =======================
   PROFILE CRUD
======================= */

// Get my profile (404 if not created yet)
export const getMyProfile = () =>
  api.get("/player/me");

// Create a new player profile
export const createProfile = (data) =>
  api.post("/player", data);

// Update existing player profile
export const updateProfile = (data) =>
  api.put("/player/me", data);

/* =======================
   UPLOADS
======================= */

// Upload profile photo
export const uploadProfilePhoto = (file) => {
  const fd = new FormData();
  fd.append("image", file);
  return api.post("/player/upload-photo", fd);
};

// Upload profile QR
export const uploadProfileQR = (file) => {
  const fd = new FormData();
  fd.append("image", file);
  return api.post("/player/upload-qr", fd);
};
