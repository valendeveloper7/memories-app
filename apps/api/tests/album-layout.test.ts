import { describe, it, expect } from 'vitest';

describe('Esquema de layout del editor', () => {
  it('acepta un layout válido con items posicionados', async () => {
    const { updateAlbumLayoutSchema } = await import('shared');
    const parsed = updateAlbumLayoutSchema.safeParse({
      layout: [{ memoryId: 'm1', x: 0, y: 0, w: 3, h: 3, rotation: 0, zIndex: 1 }],
      version: 2,
    });
    expect(parsed.success).toBe(true);
  });

  it('rechaza tamaños no positivos', async () => {
    const { updateAlbumLayoutSchema } = await import('shared');
    const parsed = updateAlbumLayoutSchema.safeParse({
      layout: [{ memoryId: 'm1', x: 0, y: 0, w: 0, h: 3 }],
    });
    expect(parsed.success).toBe(false);
  });

  it('aplica valores por defecto de rotation y zIndex', async () => {
    const { updateAlbumLayoutSchema } = await import('shared');
    const parsed = updateAlbumLayoutSchema.parse({
      layout: [{ memoryId: 'm1', x: 1, y: 2, w: 4, h: 2 }],
    });
    expect(parsed.layout[0]!.rotation).toBe(0);
    expect(parsed.layout[0]!.zIndex).toBe(0);
  });
});
