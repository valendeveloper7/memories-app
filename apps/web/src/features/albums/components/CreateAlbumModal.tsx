import { useState, type FormEvent } from 'react';
import { createAlbumSchema } from 'shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/features/auth/hooks/useAuth';
import { useI18n } from '@/i18n/useI18n';
import { useCreateAlbum } from '../hooks/useAlbums';

/** Modal para crear un álbum. Valida con el esquema zod compartido y separa
 *  los tags escritos por comas. */
export function CreateAlbumModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createAlbum = useCreateAlbum();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawTags = String(form.get('tags') ?? '').trim();
    const rawDate = String(form.get('date') ?? '').trim();
    const values = {
      title: String(form.get('title')),
      description: String(form.get('description') ?? '').trim() || undefined,
      icon: String(form.get('icon') ?? '').trim() || undefined,
      tags: rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
      date: rawDate ? new Date(`${rawDate}T12:00:00`).toISOString() : undefined,
    };

    const parsed = createAlbumSchema.safeParse(values);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    createAlbum.mutate(parsed.data, {
      onSuccess: () => {
        onClose();
      },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title={t('albumForm.title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          label={t('albumForm.titleField')}
          name="title"
          placeholder={t('albumForm.titlePlaceholder')}
          error={errors.title}
        />
        <TextField
          label={t('albumForm.description')}
          name="description"
          placeholder={t('albumForm.descriptionPlaceholder')}
          error={errors.description}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={t('albumForm.icon')} name="icon" placeholder="🌅" />
          <TextField
            label={t('albumForm.tags')}
            name="tags"
            placeholder={t('albumForm.tagsPlaceholder')}
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('album.date')}
          </span>
          <input
            type="date"
            name="date"
            className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        {createAlbum.isError && (
          <p className="text-sm text-red-500">{getApiErrorMessage(createAlbum.error)}</p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={createAlbum.isPending}>
            {t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
