import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from 'src/order-status.enum';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus, {
    message: 'Status must be Pending, Shipped, or Delivered',
  })
  @IsNotEmpty()
  status: OrderStatus;
}
