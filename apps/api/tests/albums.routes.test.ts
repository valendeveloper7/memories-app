import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Application } from 'express';

/**
 * Runtime sin BD. requireSpace consulta la BD, así que con un token válido
 * pero sin instancia de Mongo estas rutas fallarían al llegar al middleware
 * de espacio; por eso aquí solo verificamos lo que ocurre ANTES de tocar la
 * BD: la ausencia de token (401) y la validación de esquema de la query.
 */

process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'secreto-de-pruebas-suficientemente-largo';
process.env.JWT_REFRESH_SECRET ??= 'otro-secreto-de-pruebas-bastante-largo';

let app: Application;

beforeAll(async () => {
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('Rutas de Álbumes', () => {
  it('GET /api/albums sin token devuelve 401', async () => {
    const res = await request(app).get('/api/albums');
    expect(res.status).toBe(401);
  });

  it('POST /api/albums sin token devuelve 401', async () => {
    const res = await request(app).post('/api/albums').send({ title: 'Verano' });
    expect(res.status).toBe(401);
  });

  it('token inválido en /api/albums devuelve 401', async () => {
    const res = await request(app).get('/api/albums').set('Authorization', 'Bearer basura');
    expect(res.status).toBe(401);
  });
});

describe('Esquema de creación de álbum', () => {
  it('rechaza título vacío y acepta uno válido con tags', async () => {
    const { createAlbumSchema } = await import('shared');
    expect(createAlbumSchema.safeParse({ title: '' }).success).toBe(false);
    const ok = createAlbumSchema.safeParse({ title: 'Verano', tags: ['playa', 'sol'] });
    expect(ok.success).toBe(true);
  });

  it('el esquema de update rechaza un objeto vacío', async () => {
    const { updateAlbumSchema } = await import('shared');
    expect(updateAlbumSchema.safeParse({}).success).toBe(false);
    expect(updateAlbumSchema.safeParse({ isFavorite: true }).success).toBe(true);
  });
});
