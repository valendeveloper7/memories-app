import axios from 'axios';

/**
 * Instancia de axios compartida por toda la app. `withCredentials` permite
 * que la cookie httpOnly del refresh token viaje en las peticiones. El
 * interceptor que refresca el access token expirado se añadirá junto con el
 * módulo de autenticación (Paso 2).
 */
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});
