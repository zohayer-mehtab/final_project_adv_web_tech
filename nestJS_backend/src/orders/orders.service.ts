import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { OrderStatus } from 'src/order-status.enum';
import { toOrderResponse } from './dto/order-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailService: MailService,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    buyerId: number,
  ): Promise<OrderResponseDto> {
    const { product, buyer, savedOrder } = await this.ordersRepository.manager.transaction(async (manager) => {
      const product = await manager.getRepository(Product).findOne({
        where: { id: createOrderDto.productId, isApproved: true },
        relations: { vendor: true },
      });
      if (!product) throw new NotFoundException('Product not found or not available');
      const buyer = await manager.getRepository(User).findOne({ where: { id: buyerId } });
      if (!buyer) throw new NotFoundException('Buyer not found');

      const stockUpdate = await manager.getRepository(Product).createQueryBuilder()
        .update(Product)
        .set({ stock: () => '"stock" - :quantity' })
        .where('"id" = :id', { id: product.id })
        .andWhere('"isApproved" = true')
        .andWhere('"stock" >= :quantity', { quantity: createOrderDto.quantity })
        .execute();
      if (stockUpdate.affected !== 1) throw new BadRequestException('Insufficient stock available');

      const savedOrder = await manager.getRepository(Order).save(manager.getRepository(Order).create({
        product: { id: product.id } as DeepPartial<Product>,
        buyer: { id: buyerId } as DeepPartial<User>,
        quantity: createOrderDto.quantity,
      }));
      return { product, buyer, savedOrder };
    });

    const totalPrice = product.price * savedOrder.quantity;

    try {
      await this.mailService.sendProductSoldNotification(product.vendor.email, {
        productName: product.name,
        quantity: savedOrder.quantity,
        buyerEmail: buyer.email,
      });

      await this.mailService.sendOrderConfirmationEmail(buyer.email, {
        orderId: savedOrder.id,
        productName: product.name,
        quantity: savedOrder.quantity,
        totalPrice: totalPrice,
        date: new Date().toLocaleDateString(),
      });
    } catch {
      this.logger.warn('Order email delivery failed after the order was saved');
    }
    return toOrderResponse(savedOrder);
  }

  async findAllForBuyer(buyerId: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { buyer: { id: buyerId } },
      relations: { product: true },
      order: { orderedAt: 'DESC' },
    });
    return orders.map(toOrderResponse);
  }

  async findAllForVendor(vendorId: number): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: { product: { vendor: { id: vendorId } } },
      relations: { buyer: true, product: true },
      order: { orderedAt: 'DESC' },
    });
    return orders.map(toOrderResponse);
  }

  async remove(orderId: string, buyerId: number): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { buyer: true, product: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.buyer.id !== buyerId) {
      throw new ForbiddenException('You can only remove your own orders!');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'You cannot cancel an order that is already shipped.',
      );
    }

    //added for not to lose stock if order is cancelled
    await this.productsRepository.increment(
      { id: order.product.id },
      'stock',
      order.quantity,
    );

    await this.ordersRepository.remove(order);
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    vendorId: number,
  ): Promise<OrderResponseDto> {
    // 1. Fetch the order AND deep-load the product & vendor relations
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: {
        product: {
          vendor: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.product.vendor.id !== vendorId) {
      throw new ForbiddenException(
        'You can only update statuses for your own products!',
      );
    }

    order.status = status;
    return toOrderResponse(await this.ordersRepository.save(order));
  }
}
