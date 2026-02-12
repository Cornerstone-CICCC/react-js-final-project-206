<<<<<<< HEAD
import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { TOKEN_STORAGE_KEY } from '../contexts/AuthContext';

const API_BASE_URL = 'http://localhost:3000';

const getToken = (): string | null => {
  const local = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (local) return local;

  const session = sessionStorage.getItem(TOKEN_STORAGE_KEY);
  if (session) return session;

  return null;
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers ?? {};
      // config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

=======
// frontend/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

>>>>>>> origin/feature/backend-env
export default api;
