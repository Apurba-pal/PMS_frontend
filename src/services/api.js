import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  // baseURL: "https://pms-backend-b1t3.onrender.com/api",
  withCredentials: true, // important for cookie auth
});

export default api;
