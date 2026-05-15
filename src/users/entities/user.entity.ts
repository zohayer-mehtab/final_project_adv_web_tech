import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Relation,
} from 'typeorm';
import { Role } from '../../role.enum';
import { Product } from '../../products/entities/product.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.BUYER })
  role: Role;

  @Column({ default: false })
  isApproved: boolean;

  @Column({ nullable: true })
  companyName?: string;

  @OneToMany(() => Product, (product) => product.vendor)
  products: Relation<Product[]>;

  @OneToMany(() => Order, (order) => order.buyer)
  orders: Relation<Order[]>;
}
