import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Vendor } from '@/modules/vendors/entities/vendor.entity';
import { OrderItem } from './order-item.entity';

// Each Order belongs to exactly ONE vendor. A customer checkout that spans
// multiple vendors is split into multiple Order records sharing a cartId,
// so each vendor manages fulfillment independently.
export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  cartId?: string;

  @ManyToOne(() => User)
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Vendor)
  vendor: Vendor;

  @Column()
  vendorId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  status: OrderStatus;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: Record<string, string>;

  @Column({ nullable: true })
  stripePaymentIntentId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
