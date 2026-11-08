import { ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrderStatus } from '../order-status.enum';

describe('OrdersService', () => {
  it('rejects cancellation by another buyer without restoring stock', async () => {
    const ordersRepo = {
      findOne: jest.fn().mockResolvedValue({
        id: 'order',
        buyer: { id: 2 },
        product: { id: 4 },
        status: OrderStatus.PENDING,
      }),
    };
    const productsRepo = { increment: jest.fn() };
    const service = new OrdersService(
      ordersRepo as any,
      productsRepo as any,
      {} as any,
      {} as any,
    );
    await expect(service.remove('order', 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(productsRepo.increment).not.toHaveBeenCalled();
  });

  it('projects vendor order results before returning them', async () => {
    const ordersRepo = {
      find: jest.fn().mockResolvedValue([
        {
          id: 'order',
          buyer: { id: 2, username: 'buyer', password: 'hash' },
          product: {
            id: 4,
            name: 'Item',
            price: 10,
            vendor: { password: 'hash' },
          },
        },
      ]),
    };
    const service = new OrdersService(
      ordersRepo as any,
      {} as any,
      {} as any,
      {} as any,
    );
    const result = await service.findAllForVendor(1);
    expect(result[0].buyer).toEqual({ id: 2, username: 'buyer' });
    expect(result[0].product).not.toHaveProperty('vendor');
  });
});
