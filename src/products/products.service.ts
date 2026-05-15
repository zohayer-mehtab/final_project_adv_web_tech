import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
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
}
