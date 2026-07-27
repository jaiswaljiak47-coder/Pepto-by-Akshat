import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from './entities/category.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { VendorsModule } from '@/modules/vendors/vendors.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category]), VendorsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
