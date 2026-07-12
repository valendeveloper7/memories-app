import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { registerSchema } from 'shared';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage, useRegister } from '../hooks/useAuth';
import { useI18n } from '@/i18n/useI18n';

export function RegisterPage() {
  const register = useRegister();
  const { t } = useI18n();
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
      title={t('auth.registerTitle')}
      subtitle={t('auth.registerSubtitle')}
      footer={
        <>
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-semibold text-accent hover:underline">
            {t('auth.enter')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label={t('auth.name')}
          name="name"
          autoComplete="name"
          placeholder={t('auth.namePlaceholder')}
          error={fieldErrors.name}
        />
        <TextField
          label={t('auth.email')}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          error={fieldErrors.email}
        />
        <TextField
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.passwordHint')}
          error={fieldErrors.password}
        />
        {register.isError && (
          <p className="text-sm text-red-500">{getApiErrorMessage(register.error)}</p>
        )}
        <Button type="submit" loading={register.isPending} className="mt-2 w-full">
          {t('auth.createAccount')}
        </Button>
      </form>
    </AuthLayout>
  );
}
