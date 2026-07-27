import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { VendorsService } from '@/modules/vendors/vendors.service';
import { VendorStatus } from '@/modules/vendors/entities/vendor.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private vendorsService: VendorsService,
  ) {}

  async create(userId: string, dto: CreateProductDto) {
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor || vendor.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException('Only approved vendors can create products');
    }
    const product = this.repo.create({
      ...dto,
      vendorId: vendor.id,
      status: ProductStatus.ACTIVE,
      stockQuantity: dto.stockQuantity ?? 0,
    });
    return this.repo.save(product);
  }

  async findAll(query: QueryProductsDto) {
    const qb = this.repo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', { status: ProductStatus.ACTIVE });

    if (query.search) {
      qb.andWhere('product.title ILIKE :search', { search: `%${query.search}%` });
    }
    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    }
    if (query.vendorId) {
      qb.andWhere('vendor.id = :vendorId', { vendorId: query.vendorId });
    }

    const [items, total] = await qb
      .skip(query.skip)
      .take(query.limit)
      .orderBy('product.createdAt', 'DESC')
      .getManyAndCount();

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string) {
    const product = await this.repo.findOne({
      where: { id },
      relations: ['vendor', 'category'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(userId: string, id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor || product.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this product');
    }
    Object.assign(product, dto);
    return this.repo.save(product);
  }

  async remove(userId: string, id: string) {
    const product = await this.findOne(id);
    const vendor = await this.vendorsService.findByUserId(userId);
    if (!vendor || product.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this product');
    }
    product.status = ProductStatus.ARCHIVED;
    return this.repo.save(product);
  }
}
