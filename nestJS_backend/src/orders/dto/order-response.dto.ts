import { Order } from '../entities/order.entity';

export function toOrderResponse(order: Order) {
  return {
    id: order.id,
    quantity: order.quantity,
    status: order.status,
    orderedAt: order.orderedAt,
    product: order.product ? {
      id: order.product.id,
      name: order.product.name,
      description: order.product.description,
      price: order.product.price,
    } : undefined,
    buyer: order.buyer ? {
      id: order.buyer.id,
      username: order.buyer.username,
    } : undefined,
  };
}

export type OrderResponseDto = ReturnType<typeof toOrderResponse>;
