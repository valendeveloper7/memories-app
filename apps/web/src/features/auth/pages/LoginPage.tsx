import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { loginSchema } from 'shared';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage, useLogin } from '../hooks/useAuth';

export function LoginPage() {
  const login = useLogin();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = { email: String(form.get('email')), password: String(form.get('password')) };

    // Validación en cliente con el MISMO esquema que usa el backend.
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    login.mutate(parsed.data);
  }

  return (
    <AuthLayout
      title="Nosotros"
      subtitle="Entra en nuestro rincón de recuerdos"
      footer={
        <>
          ¿Aún no tenéis cuenta?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Crear una
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          error={fieldErrors.email}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={fieldErrors.password}
        />
        {login.isError && (
          <p className="text-sm text-red-500">{getApiErrorMessage(login.error)}</p>
        )}
        <Button type="submit" loading={login.isPending} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthLayout>
  );
}
