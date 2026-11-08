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
    await request(app.getHttpServer()).post('/').send(payload(Role.ADMIN)).expect(401);
    await request(app.getHttpServer()).post('/').set('Authorization', token(Role.BUYER)).send(payload(Role.ADMIN)).expect(403);
    await request(app.getHttpServer()).post('/').set('Authorization', token(Role.ADMIN)).send(payload(Role.ADMIN)).expect(201);
  });

  it('allows profile fields but rejects role and approval changes', async () => {
    await request(app.getHttpServer()).post('/auth/register').send(payload(Role.BUYER)).expect(201);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ username: 'changed' }).expect(200);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ role: Role.ADMIN }).expect(400);
    await request(app.getHttpServer()).patch('/auth/me').set('Authorization', token(Role.BUYER)).send({ isApproved: true }).expect(400);
    expect(users[0].role).toBe(Role.BUYER);
    expect(users[0].username).toBe('changed');
  });
});
