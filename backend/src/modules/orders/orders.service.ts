import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '@/modules/products/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    private dataSource: DataSource,
    private config: ConfigService,
  ) {}

  /**
   * Splits a multi-vendor cart into one Order per vendor, atomically
   * decrementing stock, inside a single DB transaction.
   */
  async checkout(customerId: string, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const productIds = dto.items.map((i) => i.productId);
      const products = await productRepo.findByIds(productIds);

      if (products.length !== productIds.length) {
        throw new NotFoundException('One or more products could not be found');
      }

      const byVendor = new Map<string, { product: Product; quantity: number }[]>();
      for (const line of dto.items) {
        const product = products.find((p) => p.id === line.productId)!;
        if (product.stockQuantity < line.quantity) {
          throw new BadRequestException(`Insufficient stock for "${product.title}"`);
        }
        const group = byVendor.get(product.vendorId) ?? [];
        group.push({ product, quantity: line.quantity });
        byVendor.set(product.vendorId, group);
      }

      const feePercent = this.config.get<number>('stripe.platformFeePercent') ?? 10;
      const cartId = uuid();
      const createdOrders: Order[] = [];

      for (const [vendorId, lines] of byVendor.entries()) {
        const subtotal = lines.reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0);
        const platformFee = Number(((subtotal * feePercent) / 100).toFixed(2));
        const total = Number((subtotal + platformFee).toFixed(2));

        const order = manager.getRepository(Order).create({
          cartId,
          customerId,
          vendorId,
          subtotal,
          platformFee,
          total,
          status: OrderStatus.PENDING_PAYMENT,
          shippingAddress: dto.shippingAddress,
          items: lines.map((l) =>
            manager.getRepository(OrderItem).create({
              productId: l.product.id,
              productTitle: l.product.title,
              unitPrice: l.product.price,
              quantity: l.quantity,
            }),
          ),
        });
        const saved = await manager.getRepository(Order).save(order);

        for (const line of lines) {
          await productRepo.decrement({ id: line.product.id }, 'stockQuantity', line.quantity);
        }

        createdOrders.push(saved);
      }

      return createdOrders;
    });
  }

  findForCustomer(customerId: string) {
    return this.ordersRepo.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  findForVendor(vendorId: string) {
    return this.ordersRepo.find({
      where: { vendorId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(vendorId: string, orderId: string, status: OrderStatus) {
    const order = await this.ordersRepo.findOneBy({ id: orderId });
    if (!order || order.vendorId !== vendorId) {
      throw new NotFoundException('Order not found for this vendor');
    }
    order.status = status;
    return this.ordersRepo.save(order);
  }
}
