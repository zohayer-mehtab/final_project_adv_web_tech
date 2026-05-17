import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { OrderStatus } from 'src/order-status.enum';

@Injectable()
export class OrdersService {
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
  ): Promise<Order> {
    const product = await this.productsRepository.findOne({
      where: { id: createOrderDto.productId, isApproved: true },
      relations: { vendor: true },
    });

    const buyer = await this.usersRepository.findOne({
      where: { id: buyerId },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    if (product.stock < createOrderDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock available, Only ${product.stock} left`,
      );
    }

    //product.stock -= createOrderDto.quantity;
    //await this.productsRepository.save(product); //bad code
    await this.productsRepository.decrement(
      { id: product.id },
      'stock',
      createOrderDto.quantity,
    ); //This code is better because does the operation sequentially.

    const newOrder = this.ordersRepository.create({
      product: { id: createOrderDto.productId } as DeepPartial<Product>,
      buyer: { id: buyerId } as DeepPartial<User>,
      quantity: createOrderDto.quantity,
    });

    const savedOrder = await this.ordersRepository.save(newOrder);

    const totalPrice = product.price * savedOrder.quantity;

    try {
      await this.mailService.sendProductSoldNotification(product.vendor.email, {
        productName: product.name,
        quantity: savedOrder.quantity,
        buyerEmail: buyer.email,
      });

      await new Promise((resolve) => setTimeout(resolve, 10000));

      await this.mailService.sendOrderConfirmationEmail(buyer.email, {
        orderId: savedOrder.id,
        productName: product.name,
        quantity: savedOrder.quantity,
        totalPrice: totalPrice,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error(
        // added for not to lose order data if mail sending fails
        'Mailtrap warning: Email failed to send, but order was saved.',
        error.message,
      );
    }
    return savedOrder;
  }

  async findAllForBuyer(buyerId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { buyer: { id: buyerId } },
      relations: { product: true },
      order: { orderedAt: 'DESC' },
    });
  }

  async findAllForVendor(vendorId: number): Promise<Order[]> { //Not in the proposal but needs to be added for vendors to see their orders.
    return await this.ordersRepository.find({
      where: { product: { vendor: { id: vendorId } } },
      relations: { buyer: true, product: true },
      order: { orderedAt: 'DESC' },
    });
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
    status: string,
    vendorId: number,
  ): Promise<Order> {
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
    return await this.ordersRepository.save(order);
  }
}
