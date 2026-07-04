import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

/**
 * Tests de runtime que NO tocan la base de datos: verifican que la cadena de
 * middlewares (seguridad, validación, auth, manejo de errores y rutas) se
 * ensambla y responde correctamente. Los flujos que requieren MongoDB se
 * cubrirán con tests de integración cuando haya una instancia disponible.
 */

// Variables de entorno mínimas para que la validación de env no aborte.
process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'secreto-de-pruebas-suficientemente-largo';
process.env.JWT_REFRESH_SECRET ??= 'otro-secreto-de-pruebas-bastante-largo';

let app: Application;

beforeAll(async () => {
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('Infraestructura de la API', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET a una ruta inexistente devuelve 404 uniforme', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('Validación de auth', () => {
  it('POST /api/auth/register con body inválido devuelve 400 con detalles', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'a', email: 'no-es-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    expect(res.body.details).toHaveProperty('email');
    expect(res.body.details).toHaveProperty('password');
  });

  it('POST /api/auth/login sin campos devuelve 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});

describe('requireAuth', () => {
  it('GET /api/users/me sin token devuelve 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('GET /api/users/me con token inválido devuelve 401', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer token-basura');
    expect(res.status).toBe(401);
  });
});

describe('refresh sin cookie', () => {
  it('POST /api/auth/refresh sin cookie devuelve 401', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});
