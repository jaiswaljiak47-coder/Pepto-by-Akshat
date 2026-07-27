import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { OrderStatus } from './entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser('id') customerId: string, @Body() dto: CreateOrderDto) {
    return this.ordersService.checkout(customerId, dto);
  }

  @Get('me')
  myOrders(@CurrentUser('id') customerId: string) {
    return this.ordersService.findForCustomer(customerId);
  }

  @Get('vendor/:vendorId')
  vendorOrders(@Param('vendorId') vendorId: string) {
    return this.ordersService.findForVendor(vendorId);
  }

  @Patch(':id/status/:vendorId')
  updateStatus(
    @Param('vendorId') vendorId: string,
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateStatus(vendorId, id, status);
  }
}
