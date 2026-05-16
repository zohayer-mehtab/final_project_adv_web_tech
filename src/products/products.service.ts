import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, MoreThan } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    vendorId: number,
  ): Promise<Product> {
    const newProduct = this.productsRepository.create({
      ...createProductDto,

      vendor: { id: vendorId } as DeepPartial<User>,
    });

    return await this.productsRepository.save(newProduct);
  }

  async approveProduct(id: number) {
    await this.productsRepository.update(id, { isApproved: true });

    return this.productsRepository.findOne({ where: { id } });
  }

  async rejectProduct(id: number) {
    // This was not in the proposal, I added it for completeness.

    await this.productsRepository.update(id, { isApproved: false });

    return this.productsRepository.findOne({ where: { id } });
  }

  async findVendorProducts(vendorId: number): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        vendor: { id: vendorId },
      },

      order: {
        id: 'DESC',
      },
    });
  }

  async findAllPublic(): Promise<Product[]> {
    return await this.productsRepository.find({
      where: {
        isApproved: true,
        stock: MoreThan(0),
      },
      relations: {
        vendor: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        vendor: {
          id: true,
          username: true,
          companyName: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id, isApproved: true },
      relations: {
        vendor: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        vendor: {
          id: true,
          username: true,
          companyName: true,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found or not available');
    }

    return product;
  }
}
