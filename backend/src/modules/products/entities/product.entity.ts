import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Vendor } from '@/modules/vendors/entities/vendor.entity';
import { Category } from './category.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  ARCHIVED = 'archived',
}

@Entity('products')
@Index(['vendor', 'status'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vendor, { onDelete: 'CASCADE' })
  vendor: Vendor;

  @Column()
  vendorId: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  category?: Category;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  compareAtPrice?: number;

  @Column({ default: 0 })
  stockQuantity: number;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ default: 0 })
  soldCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
