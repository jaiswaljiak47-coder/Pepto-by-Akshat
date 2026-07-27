import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewsRepo: Repository<Review>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async create(customerId: string, dto: CreateReviewDto) {
    const review = this.reviewsRepo.create({ ...dto, customerId });
    const saved = await this.reviewsRepo.save(review);
    await this.recalculateProductRating(dto.productId);
    return saved;
  }

  findForProduct(productId: string) {
    return this.reviewsRepo.find({ where: { productId }, order: { createdAt: 'DESC' } });
  }

  private async recalculateProductRating(productId: string) {
    const { avg } = await this.reviewsRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .where('r.productId = :productId', { productId })
      .getRawOne();
    // Product rating is denormalized onto Vendor.averageRating in a scheduled
    // job in production; kept simple here for illustration.
    return avg;
  }
}
