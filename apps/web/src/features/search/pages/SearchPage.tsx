import { useState } from 'react';
import type { ListMemoriesQuery, MemoryType } from 'shared';
import { TextField } from '@/components/ui/TextField';
import { MemoryGrid } from '@/features/memories/components/MemoryGrid';
import { useDebounce } from '@/hooks/useDebounce';

const TYPE_FILTERS: { label: string; value?: MemoryType }[] = [
  { label: 'Todo' },
  { label: 'Fotos', value: 'photo' },
  { label: 'Vídeos', value: 'video' },
];

export function SearchPage() {
  const [text, setText] = useState('');
  const [type, setType] = useState<MemoryType | undefined>();
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const debouncedText = useDebounce(text);

  const query: Omit<ListMemoriesQuery, 'cursor'> = {
    ...(debouncedText ? { q: debouncedText } : {}),
    ...(type ? { type } : {}),
    ...(onlyFavorites ? { favorite: 'true' } : {}),
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-100">Buscar</h1>

      <div className="mb-4">
        <TextField
          label=""
          placeholder="Busca por título o descripción…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => (
          <Chip
            key={filter.label}
            active={type === filter.value}
            onClick={() => setType(filter.value)}
          >
            {filter.label}
          </Chip>
        ))}
        <Chip active={onlyFavorites} onClick={() => setOnlyFavorites((v) => !v)}>
          ❤️ Favoritos
        </Chip>
      </div>

      <MemoryGrid query={query} emptyLabel="No hay recuerdos que coincidan con la búsqueda." />
    </div>
  );
}

function Chip({
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
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-accent text-white'
          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300'
      }`}
    >
      {children}
    </button>
  );
}
