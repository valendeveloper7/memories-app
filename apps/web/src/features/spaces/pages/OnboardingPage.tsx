import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createSpaceSchema, joinSpaceSchema } from 'shared';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/features/auth/hooks/useAuth';
import { useI18n } from '@/i18n/useI18n';
import { useCreateSpace, useJoinSpace } from '../hooks/useSpaces';

type Tab = 'create' | 'join';

export function OnboardingPage() {
  const [tab, setTab] = useState<Tab>('create');
  const { t } = useI18n();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent/5 to-secondary/5 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-3xl border border-neutral-200/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80"
      >
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {t('onboarding.title')}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {t('onboarding.subtitle')}
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
          <TabButton active={tab === 'create'} onClick={() => setTab('create')}>
            {t('onboarding.createTab')}
          </TabButton>
          <TabButton active={tab === 'join'} onClick={() => setTab('join')}>
            {t('onboarding.joinTab')}
          </TabButton>
        </div>

        {tab === 'create' ? <CreateForm /> : <JoinForm />}
      </motion.div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
        active
          ? 'bg-white text-accent shadow-sm dark:bg-neutral-900'
          : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}

function CreateForm() {
  const createSpace = useCreateSpace();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawDate = String(form.get('anniversaryDate') ?? '');
    const values = {
      name: String(form.get('name')),
      anniversaryDate: rawDate ? new Date(rawDate).toISOString() : undefined,
    };

    const parsed = createSpaceSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    createSpace.mutate(parsed.data, { onSuccess: () => navigate('/', { replace: true }) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={t('onboarding.spaceName')}
        name="name"
        placeholder={t('onboarding.spaceNamePlaceholder')}
        error={errors.name}
      />
      <TextField label={t('onboarding.anniversary')} name="anniversaryDate" type="date" />
      {createSpace.isError && (
        <p className="text-sm text-red-500">{getApiErrorMessage(createSpace.error)}</p>
      )}
      <Button type="submit" loading={createSpace.isPending} className="mt-2 w-full">
        {t('onboarding.createSpace')}
      </Button>
    </form>
  );
}

function JoinForm() {
  const joinSpace = useJoinSpace();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = joinSpaceSchema.safeParse({ inviteCode: String(form.get('inviteCode')) });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    joinSpace.mutate(parsed.data, { onSuccess: () => navigate('/', { replace: true }) });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <TextField
        label={t('onboarding.inviteCode')}
        name="inviteCode"
        placeholder={t('onboarding.inviteCodePlaceholder')}
        autoCapitalize="characters"
        error={error}
      />
      {joinSpace.isError && (
        <p className="text-sm text-red-500">{getApiErrorMessage(joinSpace.error)}</p>
      )}
      <Button type="submit" loading={joinSpace.isPending} className="mt-2 w-full">
        {t('onboarding.join')}
      </Button>
    </form>
  );
}
