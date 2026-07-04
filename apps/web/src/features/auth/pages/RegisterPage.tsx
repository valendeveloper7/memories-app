import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerSchema } from 'shared';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage, useRegister } from '../hooks/useAuth';

export function RegisterPage() {
  const register = useRegister();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = {
      name: String(form.get('name')),
      email: String(form.get('email')),
      password: String(form.get('password')),
    };

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    register.mutate(parsed.data);
  }

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Empezad a guardar vuestros recuerdos"
      footer={
        <>
          ¿Ya tenéis cuenta?{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label="Nombre"
          name="name"
          autoComplete="name"
          placeholder="Tu nombre"
          error={fieldErrors.name}
        />
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
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          error={fieldErrors.password}
        />
        {register.isError && (
          <p className="text-sm text-red-500">{getApiErrorMessage(register.error)}</p>
        )}
        <Button type="submit" loading={register.isPending} className="mt-2 w-full">
          Crear cuenta
        </Button>
      </form>
    </AuthLayout>
  );
}
