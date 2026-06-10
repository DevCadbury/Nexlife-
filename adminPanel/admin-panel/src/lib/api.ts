import axios from "axios";

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "";
// If NEXT_PUBLIC_BACKEND_URL is set (e.g., http://localhost:4000), use that, else rely on /api reverse proxy
export const api = axios.create({
  baseURL: BACKEND_BASE ? `${BACKEND_BASE}/api` : "/api",
  withCredentials: true,
});
export const fetcher = (url: string) => api.get(url).then((r) => r.data);

// Attach JWT from localStorage if present for cross-origin backend calls
if (typeof window !== "undefined") {
  api.interceptors.request.use((config) => {
    try {
      const token = window.localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    } catch {}
    return config;
  });

  // On 401 during an active session: clear JWT and redirect to login
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        try {
          window.localStorage.removeItem("token");
          document.cookie = "nxl_jwt=; Path=/; Max-Age=0";
        } catch {}
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
}
