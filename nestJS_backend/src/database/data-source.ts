import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { BaselineSchema1762600000000 } from './migrations/1762600000000-BaselineSchema';
import { UniqueUserEmail1762600000001 } from './migrations/1762600000001-UniqueUserEmail';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Product, Order],
  migrations: [BaselineSchema1762600000000, UniqueUserEmail1762600000001],
  synchronize: false,
});
