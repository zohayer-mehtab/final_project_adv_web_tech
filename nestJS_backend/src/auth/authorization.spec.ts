import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersController } from '../users/users.controller';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { Role } from '../role.enum';
import { EndpointRateLimitGuard } from './endpoint-rate-limit.guard';

describe('registration and authorization HTTP routes', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const users: User[] = [];
  const repository = {
    findOne: jest.fn(async ({ where }) => users.find((user) => Object.entries(where).every(([key, value]) => user[key] === value)) ?? null),
    find: jest.fn(async () => users),
    create: jest.fn((value) => value),
    save: jest.fn(async (value) => {
      const user = { id: users.length + 1, ...value } as User;
      users.push(user);
      return user;
    }),
    update: jest.fn(async (id, changes) => {
      const user = users.find((item) => item.id === id);
      if (user) Object.assign(user, changes);
    }),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'test-only-secret' })],
      controllers: [AuthController, UsersController],
      providers: [
        AuthService,
        UsersService,
        JwtStrategy,
        EndpointRateLimitGuard,
        { provide: getRepositoryToken(User), useValue: repository },
        { provide: MailService, useValue: {} },
        { provide: ConfigService, useValue: { getOrThrow: () => 'test-only-secret' } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    jwt = module.get(JwtService);
  });

  afterAll(async () => app.close());
  beforeEach(() => { users.length = 0; jest.clearAllMocks(); });

  const payload = (role: Role) => ({ username: `user${role}`, email: `${role}@example.test`, password: 'strong-pass-123', role });
  const token = (role: Role, id = 1) => `Bearer ${jwt.sign({ sub: id, email: `${role}@example.test`, role })}`;

  it('rejects ADMIN registration and preserves BUYER and VENDOR registration', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.ADMIN)).expect(400);
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.BUYER)).expect(201);
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.VENDOR)).expect(201);
    expect(users.map(({ role, isApproved }) => ({ role, isApproved }))).toEqual([
      { role: Role.BUYER, isApproved: true },
      { role: Role.VENDOR, isApproved: false },
    ]);
  });

  it('rejects anonymous and non-admin account creation', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.BUYER)).expect(201);
    users.push({ id: 2, username: 'admin', email: 'admin@example.test', role: Role.ADMIN, isApproved: true } as User);
    await request(app.getHttpServer()).post('/').send(payload(Role.ADMIN)).expect(401);
    await request(app.getHttpServer()).post('/').set('Authorization', token(Role.BUYER)).send(payload(Role.ADMIN)).expect(403);
    await request(app.getHttpServer()).post('/').set('Authorization', token(Role.ADMIN, 2)).send({ ...payload(Role.ADMIN), email: 'new-admin@example.test', username: 'newadmin' }).expect(201);
  });

  it('allows profile fields but rejects role and approval changes', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.BUYER)).expect(201);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ username: 'changed' }).expect(200);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ role: Role.ADMIN }).expect(400);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ isApproved: true }).expect(400);
    expect(users[0].role).toBe(Role.BUYER);
    expect(users[0].username).toBe('changed');
  });

  it('serializes registration, profiles, and admin lists without credentials', async () => {
    const registration = await request(app.getHttpServer()).post('/auth/register').send(payload(Role.BUYER)).expect(201);
    expect(registration.body).not.toHaveProperty('password');
    users[0].resetToken = 'private-code';
    users[0].resetTokenExpires = new Date();
    users.push({ id: 2, username: 'admin', email: 'admin@example.test', role: Role.ADMIN, isApproved: true } as User);
    const profile = await request(app.getHttpServer()).get('/auth/me').set('Authorization', token(Role.BUYER)).expect(200);
    expect(profile.body).not.toHaveProperty('password');
    expect(profile.body).not.toHaveProperty('resetToken');
    const updated = await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ username: 'updated' }).expect(200);
    expect(updated.body).not.toHaveProperty('resetToken');
    const listing = await request(app.getHttpServer()).get('/admin/users').set('Authorization', token(Role.ADMIN, 2)).expect(200);
    expect(listing.body[0]).not.toHaveProperty('password');
    expect(listing.body[0]).not.toHaveProperty('resetToken');
  });

  it('rate limits repeated login attempts', async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await request(app.getHttpServer()).post('/auth/login').send({ email: 'missing@example.test', password: 'wrong-pass' }).expect(401);
    }
    await request(app.getHttpServer()).post('/auth/login').send({ email: 'missing@example.test', password: 'wrong-pass' }).expect(429);
  });

  it('rate limits reset requests without revealing account existence', async () => {
    const responses: Array<{ message: string }> = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await request(app.getHttpServer()).post('/auth/forgot-password').send({ email: 'missing@example.test' }).expect(200);
      responses.push(response.body);
    }
    expect(responses[0]).toEqual(responses[1]);
    await request(app.getHttpServer()).post('/auth/forgot-password').send({ email: 'missing@example.test' }).expect(429);
  });
});
