import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  
  try {
    const raw = localStorage.getItem("persist:root");
    if (!raw) return config;

    const root = JSON.parse(raw);

    // ----------------------
    // 1️⃣ ADMIN TOKEN
    // ----------------------
    let adminToken = null;
    if (root.admin) {
      const admin = JSON.parse(root.admin);
      adminToken = admin?.adminToken || null;
    }

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }

    // ----------------------
    // 2️⃣ USER TOKEN
    // ----------------------
    let userToken = null;
    if (root.auth) {
      const auth = JSON.parse(root.auth);
      userToken =
        auth?.token || auth?.user?.token || auth?.user?.accessToken || null;
    }

    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    
    return config;
  } catch (err) {
    console.warn("Token parse error:", err);
    return config;
  }
});

export default api;
