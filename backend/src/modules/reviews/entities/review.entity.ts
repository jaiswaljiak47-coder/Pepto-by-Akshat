import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Product } from '@/modules/products/entities/product.entity';

@Entity('reviews')
@Unique(['customerId', 'productId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  customer: User;

  @Column()
  customerId: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productId: string;

  @Column({ type: 'smallint' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn()
  createdAt: Date;
}
