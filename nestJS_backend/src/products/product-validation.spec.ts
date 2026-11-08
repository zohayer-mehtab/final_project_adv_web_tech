import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../role.enum';

describe('product request validation', () => {
  let app: INestApplication;
  const service = {
    create: jest.fn(async (body) => body),
    findOne: jest.fn(async (id) => ({ id })),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          context.switchToHttp().getRequest().user = {
            userId: 1,
            role: Role.VENDOR,
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
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
  });

  afterAll(async () => app.close());

  it('rejects malformed IDs, nonintegral stock, and request-supplied identity', async () => {
    await request(app.getHttpServer()).get('/products/not-an-id').expect(400);
    const product = {
      name: 'Item',
      description: 'Description',
      price: 12.5,
      stock: 3,
    };
    await request(app.getHttpServer())
      .post('/products')
      .send({ ...product, stock: 1.5 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/products')
      .send({ ...product, vendorId: 999 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/products')
      .send(product)
      .expect(201);
    expect(service.create).toHaveBeenCalledWith(product, 1);
  });
});
