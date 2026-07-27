import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '@/modules/products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'RESTRICT' })
  product: Product;

  @Column()
  productId: string;

  @Column()
  productTitle: string; // snapshot at time of order

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // snapshot at time of order

  @Column()
  quantity: number;
}
