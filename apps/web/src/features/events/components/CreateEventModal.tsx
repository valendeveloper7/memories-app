import { useEffect, useState, type FormEvent } from 'react';
import {
  EVENT_TYPE_COLORS,
  type CalendarEventType,
  type EventRecurrence,
} from 'shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useI18n } from '@/i18n/useI18n';
import { useCreateEvent } from '../hooks/useEvents';

/** Formatea una fecha a YYYY-MM-DD para el input date. */
function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function CreateEventModal({
  open,
  onClose,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  defaultDate: Date;
}) {
  const { t } = useI18n();
  const createEvent = useCreateEvent();
  const [type, setType] = useState<CalendarEventType>('birthday');
  const [color, setColor] = useState(EVENT_TYPE_COLORS.birthday);
  const [date, setDate] = useState(toDateInput(defaultDate));

  // Al abrir en un día concreto, precarga esa fecha.
  useEffect(() => {
    if (open) setDate(toDateInput(defaultDate));
  }, [open, defaultDate]);

  // Al cambiar el tipo, sugiere su color por defecto.
  function changeType(next: CalendarEventType) {
    setType(next);
    setColor(EVENT_TYPE_COLORS[next]);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    if (!title) return;

    createEvent.mutate(
      {
        title,
        type,
        color,
        date: new Date(`${date}T12:00:00`).toISOString(),
        recurrence: form.get('recurrence') as EventRecurrence,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal open={open} onClose={onClose} title={t('event.new')}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField label={t('event.title')} name="title" placeholder={t('event.titlePlaceholder')} />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('event.type')}
          </span>
          <div className="flex gap-2">
            {(['birthday', 'special', 'other'] as CalendarEventType[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => changeType(option)}
                className={`flex-1 rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
                  type === option
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-300'
                }`}
              >
                {t(
                  option === 'birthday'
                    ? 'event.typeBirthday'
                    : option === 'special'
                      ? 'event.typeSpecial'
                      : 'event.typeOther',
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('event.date')}
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {t('event.color')}
            </span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-full cursor-pointer rounded-xl border border-neutral-200 dark:border-neutral-700"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {t('event.recurrence')}
          </span>
          <select
            name="recurrence"
            defaultValue="none"
            className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="none">{t('event.recNone')}</option>
            <option value="weekly">{t('event.recWeekly')}</option>
            <option value="monthly">{t('event.recMonthly')}</option>
            <option value="yearly">{t('event.recYearly')}</option>
          </select>
        </label>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={createEvent.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
