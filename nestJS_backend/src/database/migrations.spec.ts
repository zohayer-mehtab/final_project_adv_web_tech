import { config } from 'dotenv';
import { randomBytes } from 'crypto';
import { Client } from 'pg';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import appDataSource from './data-source';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../role.enum';
import * as bcrypt from 'bcryptjs';

config();

describe('PostgreSQL migrations and email integrity', () => {
  const databaseName = `marketplace_test_${randomBytes(6).toString('hex')}`;
  let admin: Client;
  let dataSource: DataSource;
  let created = false;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required for database integration tests');
    admin = new Client({ connectionString: process.env.DATABASE_URL });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${databaseName}"`);
    created = true;
    const testUrl = new URL(process.env.DATABASE_URL);
    testUrl.pathname = `/${databaseName}`;
    dataSource = new DataSource({ ...appDataSource.options, url: testUrl.toString() } as DataSourceOptions);
    await dataSource.initialize();
    await dataSource.runMigrations();
  }, 30000);

  afterAll(async () => {
    if (dataSource?.isInitialized) await dataSource.destroy();
    if (admin && created) await admin.query(`DROP DATABASE "${databaseName}"`);
    if (admin) await admin.end();
  }, 30000);

  it('creates all entity tables and records both migrations', async () => {
    for (const name of ['user', 'products', 'orders']) {
      const tables = await dataSource.query('SELECT to_regclass($1) AS table_name', [name]);
      expect(tables[0].table_name).not.toBeNull();
    }
    const migrations = await dataSource.query('SELECT name FROM migrations ORDER BY id');
    expect(migrations.map(({ name }) => name)).toEqual([
      'BaselineSchema1762600000000',
      'UniqueUserEmail1762600000001',
    ]);
  });

  it('rejects case-insensitive duplicate emails at the database level', async () => {
    await dataSource.query('INSERT INTO "user" ("username", "email", "password") VALUES ($1,$2,$3)', ['first', 'buyer@example.test', 'hash']);
    await expect(dataSource.query('INSERT INTO "user" ("username", "email", "password") VALUES ($1,$2,$3)', ['second', 'BUYER@example.test', 'hash']))
      .rejects.toMatchObject({ code: '23505' });
  });

  it('allows only one concurrent registration for the same email', async () => {
    const users = new UsersService(dataSource.getRepository(User));
    const registrations = await Promise.allSettled([
      users.register({ username: 'concurrent1', email: 'race@example.test', password: 'strong-pass-123', role: Role.BUYER }),
      users.register({ username: 'concurrent2', email: 'RACE@example.test', password: 'strong-pass-123', role: Role.BUYER }),
    ]);
    expect(registrations.filter(({ status }) => status === 'fulfilled')).toHaveLength(1);
    expect(registrations.filter(({ status }) => status === 'rejected')).toHaveLength(1);
    const count = await dataSource.query('SELECT count(*)::int AS count FROM "user" WHERE lower("email") = $1', ['race@example.test']);
    expect(count[0].count).toBe(1);
  });

  it('atomically consumes reset hashes and rejects expired or reused hashes', async () => {
    const users = new UsersService(dataSource.getRepository(User));
    const account = await users.register({ username: 'resetbuyer', email: 'reset@example.test', password: 'old-pass-123', role: Role.BUYER });
    const hash = 'a'.repeat(64);
    await users.setResetToken(account.id, hash, new Date(Date.now() + 60_000));
    expect(await users.consumeResetToken('b'.repeat(64), 'new-pass-123')).toBe(false);
    expect(await users.consumeResetToken(hash, 'new-pass-123')).toBe(true);
    expect(await users.consumeResetToken(hash, 'another-pass-123')).toBe(false);
    expect(await bcrypt.compare('new-pass-123', (await users.findAuthUserById(account.id))!.password)).toBe(true);
    await users.setResetToken(account.id, hash, new Date(Date.now() - 1));
    expect(await users.consumeResetToken(hash, 'another-pass-123')).toBe(false);
  });
});
