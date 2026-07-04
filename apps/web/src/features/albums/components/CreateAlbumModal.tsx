import { useState, type FormEvent } from 'react';
import { createAlbumSchema } from 'shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiErrorMessage } from '@/features/auth/hooks/useAuth';
import { useCreateAlbum } from '../hooks/useAlbums';

/** Modal para crear un álbum. Valida con el esquema zod compartido y separa
 *  los tags escritos por comas. */
export function CreateAlbumModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createAlbum = useCreateAlbum();
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rawTags = String(form.get('tags') ?? '').trim();
    const values = {
      title: String(form.get('title')),
      description: String(form.get('description') ?? '').trim() || undefined,
      icon: String(form.get('icon') ?? '').trim() || undefined,
      tags: rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
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
    <Modal open={open} onClose={onClose} title="Nuevo álbum">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField label="Título" name="title" placeholder="Ej. Verano 2024" error={errors.title} />
        <TextField
          label="Descripción (opcional)"
          name="description"
          placeholder="Un pequeño recuerdo de…"
          error={errors.description}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Icono (emoji)" name="icon" placeholder="🌅" />
          <TextField label="Tags (separadas por comas)" name="tags" placeholder="playa, sol" />
        </div>
        {createAlbum.isError && (
          <p className="text-sm text-red-500">{getApiErrorMessage(createAlbum.error)}</p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={createAlbum.isPending}>
            Crear
          </Button>
        </div>
      </form>
    </Modal>
  );
}
