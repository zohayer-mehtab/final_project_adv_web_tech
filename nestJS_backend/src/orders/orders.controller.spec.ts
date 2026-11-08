import { OrdersController } from './orders.controller';
import { OrderStatus } from '../order-status.enum';

describe('OrdersController', () => {
  it('passes authenticated identities to create and status operations', async () => {
    const orders = {
      create: jest.fn().mockResolvedValue({ id: 'order' }),
      updateOrderStatus: jest
        .fn()
        .mockResolvedValue({ status: OrderStatus.SHIPPED }),
    };
    const controller = new OrdersController(orders as any);
    await controller.create(
      { productId: 4, quantity: 2 },
      { user: { userId: 7 } },
    );
    await controller.updateStatus(
      'order-id',
      { status: OrderStatus.SHIPPED },
      { user: { userId: 9 } },
    );
    expect(orders.create).toHaveBeenCalledWith(
      { productId: 4, quantity: 2 },
      7,
    );
    expect(orders.updateOrderStatus).toHaveBeenCalledWith(
      'order-id',
      OrderStatus.SHIPPED,
      9,
    );
  });
});
