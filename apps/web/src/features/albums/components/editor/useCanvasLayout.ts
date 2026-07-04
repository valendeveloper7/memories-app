import { useCallback, useRef, useState } from 'react';
import type { AlbumLayoutItem } from 'shared';

export const GRID_COLS = 12;
const MIN_SIZE = 1;

type Session =
  | { kind: 'drag'; id: string; startX: number; startY: number; itemX: number; itemY: number }
  | { kind: 'resize'; id: string; startX: number; startY: number; itemW: number; itemH: number };

/**
 * Estado e interacción del lienzo del editor: arrastrar y redimensionar con
 * snap a la cuadrícula. Trabaja en unidades de grid (no píxeles) para que el
 * layout sea responsive; el tamaño de celda se pasa en cada gesto.
 */
export function useCanvasLayout(initial: AlbumLayoutItem[]) {
  const [items, setItems] = useState<AlbumLayoutItem[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const session = useRef<{ data: Session; cell: number } | null>(null);

  const update = useCallback((id: string, patch: Partial<AlbumLayoutItem>) => {
    setItems((prev) => prev.map((it) => (it.memoryId === id ? { ...it, ...patch } : it)));
  }, []);

  const onPointerMove = useCallback((event: PointerEvent) => {
    const current = session.current;
    if (!current) return;
    const { data, cell } = current;
    const gx = Math.round((event.clientX - data.startX) / cell);
    const gy = Math.round((event.clientY - data.startY) / cell);

    if (data.kind === 'drag') {
      setItems((prev) =>
        prev.map((it) =>
          it.memoryId === data.id
            ? { ...it, x: Math.max(0, data.itemX + gx), y: Math.max(0, data.itemY + gy) }
            : it,
        ),
      );
    } else {
      setItems((prev) =>
        prev.map((it) =>
          it.memoryId === data.id
            ? {
                ...it,
                w: Math.max(MIN_SIZE, data.itemW + gx),
                h: Math.max(MIN_SIZE, data.itemH + gy),
              }
            : it,
        ),
      );
    }
  }, []);

  const endSession = useCallback(() => {
    session.current = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', endSession);
  }, [onPointerMove]);

  const startDrag = useCallback(
    (event: React.PointerEvent, item: AlbumLayoutItem, cell: number) => {
      if (item.locked) return;
      setSelectedId(item.memoryId);
      session.current = {
        cell,
        data: {
          kind: 'drag',
          id: item.memoryId,
          startX: event.clientX,
          startY: event.clientY,
          itemX: item.x,
          itemY: item.y,
        },
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endSession);
    },
    [onPointerMove, endSession],
  );

  const startResize = useCallback(
    (event: React.PointerEvent, item: AlbumLayoutItem, cell: number) => {
      event.stopPropagation();
      if (item.locked) return;
      session.current = {
        cell,
        data: {
          kind: 'resize',
          id: item.memoryId,
          startX: event.clientX,
          startY: event.clientY,
          itemW: item.w,
          itemH: item.h,
        },
      };
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endSession);
    },
    [onPointerMove, endSession],
  );

  return {
    items,
    setItems,
    selectedId,
    setSelectedId,
    update,
    startDrag,
    startResize,
  };
}
