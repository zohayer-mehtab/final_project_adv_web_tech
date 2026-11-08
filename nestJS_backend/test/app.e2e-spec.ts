import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Client } from 'pg';
import { randomBytes } from 'crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import appDataSource from '../src/database/data-source';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import { MailService } from '../src/mail/mail.service';

describe('marketplace authentication (e2e)', () => {
  const databaseName = `marketplace_e2e_${randomBytes(6).toString('hex')}`;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  let admin: Client;
  let database: DataSource;
  let app: INestApplication;
  let created = false;
  let resetCode: string;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL)
      throw new Error('DATABASE_URL is required for e2e tests');
    admin = new Client({ connectionString: process.env.DATABASE_URL });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${databaseName}"`);
    created = true;
    const testUrl = new URL(process.env.DATABASE_URL);
    testUrl.pathname = `/${databaseName}`;
    process.env.DATABASE_URL = testUrl.toString();
    database = new DataSource({
      ...appDataSource.options,
      url: testUrl.toString(),
    } as DataSourceOptions);
    await database.initialize();
    await database.runMigrations();
    await database.destroy();
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(MailService)
      .useValue({
        sendPasswordResetEmail: async (_email: string, code: string) => {
          resetCode = code;
        },
      })
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
    if (database?.isInitialized) await database.destroy();
    if (admin && created) await admin.query(`DROP DATABASE "${databaseName}"`);
    if (admin) await admin.end();
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
  }, 30000);

  it('rejects admin registration and self role changes while keeping login and reset working', async () => {
    const account = {
      username: 'buyer',
      email: 'buyer@example.test',
      password: 'old-pass-123',
      role: 'buyer',
    };
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ ...account, role: 'admin' })
      .expect(400);
    const registration = await request(app.getHttpServer())
      .post('/auth/register')
      .send(account)
      .expect(201);
    expect(registration.body).not.toHaveProperty('password');

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: account.email, password: account.password })
      .expect(200);
    const authorization = `Bearer ${login.body.access_token}`;
    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', authorization)
      .send({ role: 'admin' })
      .expect(400);
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', authorization)
      .expect(403);
    const profile = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', authorization)
      .expect(200);
    expect(profile.body.role).toBe('buyer');
    expect(profile.body).not.toHaveProperty('resetToken');

    await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: account.email })
      .expect(200);
    expect(resetCode).toMatch(/^\d{6}$/);
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetCode, newPassword: 'new-pass-123' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: resetCode, newPassword: 'new-pass-123' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: account.email, password: 'new-pass-123' })
      .expect(200);
  });
});
