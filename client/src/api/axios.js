import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:5000/api");

const readPersistedRoot = () => {
  try {
    const raw = localStorage.getItem("persist:root");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writePersistedSlice = (key, nextValue) => {
  const root = readPersistedRoot();
  if (!root) return;

  root[key] = JSON.stringify(nextValue);
  localStorage.setItem("persist:root", JSON.stringify(root));
};

const readSessionTokens = () => {
  const root = readPersistedRoot();

  let adminToken = localStorage.getItem("adminToken") || "";
  let userToken = localStorage.getItem("token") || "";

  try {
    if (root?.admin) {
      const admin = JSON.parse(root.admin);
      adminToken = admin?.adminToken || adminToken;
    }
  } catch {}

  try {
    if (root?.auth) {
      const auth = JSON.parse(root.auth);
      userToken =
        auth?.token || auth?.user?.token || auth?.user?.accessToken || userToken;
    }
  } catch {}

  return { adminToken, userToken };
};

const clearUserSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  writePersistedSlice("auth", {
    user: null,
    token: "",
    loading: false,
    error: null,
    successMessage: "",
  });
};

const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
  writePersistedSlice("admin", {
    admin: null,
    adminToken: "",
    loading: false,
    error: null,
  });
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

const isAdminApiRoute = (url = "") =>
  /^\/admin(\/|$)/.test(url) || /^\/[^/]+\/admin(\/|$)/.test(url);

api.interceptors.request.use((config) => {
  try {
    const { adminToken, userToken } = readSessionTokens();
    const url = config.url || "";
    const isAdminRoute = isAdminApiRoute(url);
    const token = isAdminRoute ? adminToken : userToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  } catch (err) {
    console.warn("Token parse error:", err);
    return config;
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const message = error.response?.data?.message || "";
    const isAdminRoute = isAdminApiRoute(url);
    const isAuthFailure =
      status === 401 &&
      /unauthorized|invalid token|no token provided/i.test(message);

    if (isAuthFailure) {
      if (isAdminRoute) {
        clearAdminSession();
        if (
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/admin") &&
          window.location.pathname !== "/admin/login"
        ) {
          window.location.replace("/admin/login");
        }
      } else {
        clearUserSession();
        if (
          typeof window !== "undefined" &&
          window.location.pathname !== "/login"
        ) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
