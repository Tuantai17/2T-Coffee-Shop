import axios from "axios";
import {
  AUTH_SCOPES,
  clearAuthSession,
  getAuthSession,
  getAuthStorageScopeFromPath,
} from "../utils/authStorage";

const axiosClient = axios.create({
  baseURL: "http://localhost:8900",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const scope = getAuthStorageScopeFromPath(pathname);
  const { token } = getAuthSession(scope);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let cartId = sessionStorage.getItem("cartId");
  if (!cartId) {
    cartId = String(Math.floor(Math.random() * 1000000) + 1);
    sessionStorage.setItem("cartId", cartId);
  }
  config.headers["Cart-Id"] = cartId;

  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isInvalidUserSessionRequest =
      /^\/api\/users\/\d+(\/.*)?$/.test(requestUrl) &&
      (status === 401 || status === 404);

    if (typeof window !== "undefined" && isInvalidUserSessionRequest) {
      clearAuthSession(AUTH_SCOPES.USER);
      window.dispatchEvent(new CustomEvent("userSessionInvalid"));

      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
