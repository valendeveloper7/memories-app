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

describe('Comentarios y reacciones', () => {
  it('GET /api/comments sin token devuelve 401', async () => {
    expect((await request(app).get('/api/comments')).status).toBe(401);
  });

  it('POST /api/reactions/toggle sin token devuelve 401', async () => {
    const res = await request(app)
      .post('/api/reactions/toggle')
      .send({ targetType: 'memory', targetId: 'x', emoji: '❤️' });
    expect(res.status).toBe(401);
  });

  it('toggleReactionSchema solo acepta los emojis permitidos', async () => {
    const { toggleReactionSchema } = await import('shared');
    expect(
      toggleReactionSchema.safeParse({ targetType: 'memory', targetId: 'x', emoji: '❤️' }).success,
    ).toBe(true);
    expect(
      toggleReactionSchema.safeParse({ targetType: 'memory', targetId: 'x', emoji: '👍' }).success,
    ).toBe(false);
  });

  it('createCommentSchema rechaza texto vacío', async () => {
    const { createCommentSchema } = await import('shared');
    expect(
      createCommentSchema.safeParse({ targetType: 'memory', targetId: 'x', text: '' }).success,
    ).toBe(false);
    expect(
      createCommentSchema.safeParse({ targetType: 'album', targetId: 'x', text: 'Hola' }).success,
    ).toBe(true);
  });
});
