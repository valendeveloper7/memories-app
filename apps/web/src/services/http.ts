import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from 'shared';
import { useAuthStore } from '@/features/auth/store/authStore';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Instancia principal de axios. `withCredentials` permite que la cookie
 * httpOnly del refresh token viaje en cada petición.
 */
export const http = axios.create({ baseURL, withCredentials: true });

/** Cliente aparte para el endpoint de refresh: evita recursión de interceptores. */
const refreshClient = axios.create({ baseURL, withCredentials: true });

// Interceptor de petición: adjunta el access token si existe.
http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Single-flight: si varias peticiones fallan con 401 a la vez, solo se dispara
 * un único refresh y todas esperan al mismo resultado.
 */
let refreshPromise: Promise<string> | null = null;

export async function refreshSession(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthResponse>('/auth/refresh')
      .then((res) => {
        useAuthStore.getState().setSession(res.data.user, res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// Interceptor de respuesta: ante un 401, intenta refrescar una vez y reintenta.
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const token = await refreshSession();
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      } catch {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);
