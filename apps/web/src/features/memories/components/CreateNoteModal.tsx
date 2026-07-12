import { useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { memoriesApi } from '../api/memories.api';
import { memoryKeys } from '../hooks/useMemories';
import { useI18n } from '@/i18n/useI18n';

/** Crea un recuerdo de tipo nota (texto), sin media, asociado a un álbum. */
export function CreateNoteModal({
  albumId,
  open,
  onClose,
}: {
  albumId?: string;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const description = String(form.get('description') ?? '').trim();
    if (!description) return;

    setSaving(true);
    try {
      await memoriesApi.create({
        type: 'text',
        albumId,
        title: String(form.get('title') ?? '').trim() || undefined,
        description,
        actualDate: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({ queryKey: memoryKeys.all });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('note.title')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label={t('note.titleField')}
          name="title"
          placeholder={t('note.titlePlaceholder')}
        />
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('note.text')}
          </span>
          <textarea
            name="description"
            rows={4}
            placeholder={t('note.textPlaceholder')}
            className="rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
