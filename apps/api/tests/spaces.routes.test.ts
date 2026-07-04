import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Application } from 'express';

/**
 * Runtime sin BD: la validación y requireAuth ocurren ANTES de llegar al
 * servicio (que sí tocaría MongoDB), así que estos casos son verificables aquí.
 */

process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'secreto-de-pruebas-suficientemente-largo';
process.env.JWT_REFRESH_SECRET ??= 'otro-secreto-de-pruebas-bastante-largo';

let app: Application;
let token: string;

beforeAll(async () => {
  const { createApp } = await import('../src/app.js');
  app = createApp();
  token = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: '15m',
  });
});

describe('Rutas de Spaces', () => {
  it('POST /api/spaces sin token devuelve 401', async () => {
    const res = await request(app).post('/api/spaces').send({ name: 'Nuestro espacio' });
    expect(res.status).toBe(401);
  });

  it('POST /api/spaces con token válido pero nombre vacío devuelve 400', async () => {
    const res = await request(app)
      .post('/api/spaces')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.details).toHaveProperty('name');
  });

  it('POST /api/spaces/join con código demasiado corto devuelve 400', async () => {
    const res = await request(app)
      .post('/api/spaces/join')
      .set('Authorization', `Bearer ${token}`)
      .send({ inviteCode: 'AB' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('el esquema de join normaliza el código a mayúsculas', async () => {
    const { joinSpaceSchema } = await import('shared');
    const parsed = joinSpaceSchema.parse({ inviteCode: 'abcd2345' });
    expect(parsed.inviteCode).toBe('ABCD2345');
  });
});
