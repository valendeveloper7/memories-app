import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlbumLayoutItem, PublicAlbum, PublicMemory } from 'shared';
import { cloudinaryThumb } from '@/utils/cloudinary';
import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/features/auth/hooks/useAuth';
import { useI18n } from '@/i18n/useI18n';
import { useUpdateLayout } from '../../hooks/useAlbums';
import { GRID_COLS, useCanvasLayout } from './useCanvasLayout';

const SHADOW_CLASS: Record<NonNullable<AlbumLayoutItem['shadow']>, string> = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-xl',
};

/** Coloca los recuerdos que aún no tienen posición en un flujo de rejilla. */
function buildInitialLayout(album: PublicAlbum, memories: PublicMemory[]): AlbumLayoutItem[] {
  const existing = new Map((album.layout ?? []).map((item) => [item.memoryId, item]));
  const placed: AlbumLayoutItem[] = [];
  let cursorX = 0;
  let cursorY = existing.size
    ? Math.max(...[...existing.values()].map((i) => i.y + i.h))
    : 0;

  for (const memory of memories) {
    const found = existing.get(memory.id);
    if (found) {
      placed.push(found);
      continue;
    }
    if (cursorX + 3 > GRID_COLS) {
      cursorX = 0;
      cursorY += 3;
    }
    placed.push({
      memoryId: memory.id,
      x: cursorX,
      y: cursorY,
      w: 3,
      h: 3,
      rotation: 0,
      zIndex: 1,
    });
    cursorX += 3;
  }
  return placed;
}

export function AlbumEditor({
  album,
  memories,
  onClose,
}: {
  album: PublicAlbum;
  memories: PublicMemory[];
  onClose: () => void;
}) {
  const initial = useMemo(() => buildInitialLayout(album, memories), [album, memories]);
  const { items, selectedId, setSelectedId, update, startDrag, startResize } =
    useCanvasLayout(initial);
  const saveLayout = useUpdateLayout(album.id);
  const { t } = useI18n();

  const containerRef = useRef<HTMLDivElement>(null);
  const [cell, setCell] = useState(60);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setCell(el.clientWidth / GRID_COLS);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const memoryById = useMemo(() => new Map(memories.map((m) => [m.id, m])), [memories]);
  const maxY = items.reduce((max, it) => Math.max(max, it.y + it.h), 6);
  const selected = items.find((it) => it.memoryId === selectedId);

  function bringToFront() {
    if (!selected) return;
    const maxZ = Math.max(...items.map((it) => it.zIndex));
    update(selected.memoryId, { zIndex: maxZ + 1 });
  }

  function rotate(delta: number) {
    if (!selected) return;
    update(selected.memoryId, { rotation: selected.rotation + delta });
  }

  function toggleLock() {
    if (!selected) return;
    update(selected.memoryId, { locked: !selected.locked });
  }

  function save() {
    saveLayout.mutate({ layout: items, version: album.version }, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <span className="min-w-0 flex-1 truncate font-semibold text-neutral-900 dark:text-neutral-100">
          {t('editor.editing', { title: album.title })}
        </span>
        <div className="flex items-center gap-2">
          {selected && (
            <div className="mr-2 flex items-center gap-1">
              <IconBtn onClick={() => rotate(-5)} label={t('editor.rotateLeft')}>
                ↺
              </IconBtn>
              <IconBtn onClick={() => rotate(5)} label={t('editor.rotateRight')}>
                ↻
              </IconBtn>
              <IconBtn onClick={bringToFront} label={t('editor.front')}>
                ⬆️
              </IconBtn>
              <IconBtn onClick={toggleLock} label={t('editor.lock')}>
                {selected.locked ? '🔒' : '🔓'}
              </IconBtn>
            </div>
          )}
          <Button variant="ghost" onClick={onClose}>
            {t('editor.cancel')}
          </Button>
          <Button onClick={save} loading={saveLayout.isPending}>
            {t('editor.save')}
          </Button>
        </div>
      </header>

      {saveLayout.isError && (
        <p className="bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-950/40">
          {getApiErrorMessage(saveLayout.error)}
        </p>
      )}

      <div className="flex-1 overflow-auto p-6" onPointerDown={() => setSelectedId(null)}>
        <div
          ref={containerRef}
          className="relative mx-auto max-w-4xl rounded-2xl bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)]"
          style={{
            height: (maxY + 2) * cell,
            backgroundSize: `${cell}px ${cell}px`,
          }}
        >
          {items.map((item) => {
            const memory = memoryById.get(item.memoryId);
            if (!memory) return null;
            const isSelected = item.memoryId === selectedId;
            return (
              <div
                key={item.memoryId}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startDrag(e, item, cell);
                }}
                style={{
                  left: item.x * cell,
                  top: item.y * cell,
                  width: item.w * cell,
                  height: item.h * cell,
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: item.zIndex,
                  borderRadius: item.borderRadius ?? 12,
                  // Evita que el navegador haga scroll/zoom al arrastrar en táctil.
                  touchAction: 'none',
                }}
                className={`absolute cursor-move overflow-hidden ring-offset-2 ${
                  item.shadow ? SHADOW_CLASS[item.shadow] : 'shadow-md'
                } ${isSelected ? 'ring-2 ring-accent' : ''} ${
                  item.locked ? 'opacity-90' : ''
                }`}
              >
                {memory.type === 'video' ? (
                  <video src={memory.mediaUrl} className="h-full w-full object-cover" muted />
                ) : (
                  <img
                    src={cloudinaryThumb(memory.mediaUrl, 500)}
                    alt={memory.title ?? ''}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}

                {isSelected && !item.locked && (
                  <span
                    onPointerDown={(e) => startResize(e, item, cell)}
                    style={{ touchAction: 'none' }}
                    className="absolute bottom-0 right-0 h-6 w-6 cursor-se-resize rounded-tl bg-accent md:h-4 md:w-4"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded-lg px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      {children}
    </button>
  );
}
