import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';

process.env.MONGODB_URI ??= 'mongodb://127.0.0.1:27017/test';
process.env.JWT_ACCESS_SECRET ??= 'secreto-de-pruebas-suficientemente-largo';
process.env.JWT_REFRESH_SECRET ??= 'otro-secreto-de-pruebas-bastante-largo';
process.env.CLOUDINARY_CLOUD_NAME ??= 'demo';
process.env.CLOUDINARY_API_KEY ??= '123';
process.env.CLOUDINARY_API_SECRET ??= 'secret';

let app: Application;

beforeAll(async () => {
  const { configureCloudinary } = await import('../src/config/cloudinary.js');
  configureCloudinary();
  const { createApp } = await import('../src/app.js');
  app = createApp();
});

describe('Rutas de Memories y Uploads', () => {
  it('GET /api/memories sin token devuelve 401', async () => {
    expect((await request(app).get('/api/memories')).status).toBe(401);
  });

  it('POST /api/uploads/signature sin token devuelve 401', async () => {
    const res = await request(app).post('/api/uploads/signature').send({ resourceType: 'image' });
    expect(res.status).toBe(401);
  });
});

describe('Esquemas de memory y upload', () => {
  it('createMemorySchema exige un type válido', async () => {
    const { createMemorySchema } = await import('shared');
    expect(createMemorySchema.safeParse({}).success).toBe(false);
    expect(createMemorySchema.safeParse({ type: 'photo' }).success).toBe(true);
    expect(createMemorySchema.safeParse({ type: 'otro' }).success).toBe(false);
  });

  it('uploadSignatureSchema solo acepta image o video', async () => {
    const { uploadSignatureSchema } = await import('shared');
    expect(uploadSignatureSchema.safeParse({ resourceType: 'image' }).success).toBe(true);
    expect(uploadSignatureSchema.safeParse({ resourceType: 'pdf' }).success).toBe(false);
  });

  it('la firma de Cloudinary es un hash de 40 caracteres', async () => {
    const { CloudinaryStorage } = await import('../src/services/mediaStorage/CloudinaryStorage.js');
    const storage = new CloudinaryStorage();
    const sig = storage.createUploadSignature({ spaceId: 'abc', resourceType: 'image' });
    expect(sig.signature).toHaveLength(40);
    expect(sig.folder).toBe('spaces/abc');
  });
});
