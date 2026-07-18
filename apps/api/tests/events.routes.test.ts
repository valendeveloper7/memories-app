import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'secreto-de-pruebas-suficientemente-largo';
process.env.JWT_REFRESH_SECRET ??= 'otro-secreto-de-pruebas-bastante-largo';

let app: Application;

beforeAll(async () => {
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('Rutas de eventos de calendario', () => {
  it('GET /api/events sin token devuelve 401', async () => {
    expect((await request(app).get('/api/events')).status).toBe(401);
  });

  it('POST /api/events sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: 'Cumple', type: 'birthday', date: new Date().toISOString() });
    expect(res.status).toBe(401);
  });
});

describe('Esquema de evento', () => {
  it('rechaza tipos y recurrencias no válidos', async () => {
    const { createEventSchema } = await import('shared');
    const base = { title: 'X', date: new Date().toISOString() };
    expect(createEventSchema.safeParse({ ...base, type: 'nope' }).success).toBe(false);
    expect(
      createEventSchema.safeParse({ ...base, type: 'birthday', recurrence: 'daily' }).success,
    ).toBe(false);
    expect(createEventSchema.safeParse({ ...base, type: 'special' }).success).toBe(true);
  });

  it('recurrence por defecto es "none"', async () => {
    const { createEventSchema } = await import('shared');
    const parsed = createEventSchema.parse({
      title: 'Aniversario',
      type: 'special',
      date: new Date().toISOString(),
    });
    expect(parsed.recurrence).toBe('none');
  });

  it('createAlbumSchema acepta una fecha personalizada opcional', async () => {
    const { createAlbumSchema } = await import('shared');
    expect(
      createAlbumSchema.safeParse({ title: 'Verano 2025', date: new Date().toISOString() }).success,
    ).toBe(true);
    expect(createAlbumSchema.safeParse({ title: 'Sin fecha' }).success).toBe(true);
  });
});
