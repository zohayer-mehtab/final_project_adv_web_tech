import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Role } from '../role.enum';

describe('vendor order HTTP response', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: {
            find: async () => [
              {
                id: 'order-1',
                quantity: 2,
                status: 'pending',
                orderedAt: new Date(),
                buyer: {
                  id: 5,
                  username: 'buyer',
                  email: 'buyer@example.test',
                  password: 'hash',
                  resetToken: 'private-code',
                },
                product: {
                  id: 7,
                  name: 'Item',
                  description: 'Description',
                  price: 12,
                  vendor: { password: 'vendor-hash' },
                },
              },
            ],
          },
        },
        { provide: getRepositoryToken(Product), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: MailService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          context.switchToHttp().getRequest().user = {
            userId: 10,
            role: Role.VENDOR,
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => app.close());

  it('returns only the intended buyer fields', async () => {
    const response = await request(app.getHttpServer())
      .get('/orders/vendor-orders')
      .expect(200);
    expect(response.body[0].buyer).toEqual({ id: 5, username: 'buyer' });
    expect(response.body[0].product).not.toHaveProperty('vendor');
  });
});
