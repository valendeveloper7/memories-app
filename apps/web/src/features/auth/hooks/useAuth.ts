import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import type { ApiError } from 'shared';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth.api';

/** Extrae un mensaje legible del error de axios. */
export function getApiErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiError>;
  return axiosError.response?.data?.message ?? 'Algo ha salido mal. Inténtalo de nuevo.';
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate('/', { replace: true });
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession(data.user, data.accessToken);
      navigate('/', { replace: true });
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clear();
      navigate('/login', { replace: true });
    },
  });
}
