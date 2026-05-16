import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    buyerId: number,
  ): Promise<Order> {
    const product = await this.productsRepository.findOne({
      where: { id: createOrderDto.productId, isApproved: true },
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

    return await this.ordersRepository.save(newOrder);
  }
}
