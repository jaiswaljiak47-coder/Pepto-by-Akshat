import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class OrderLineDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderLineDto], description: 'Cart lines; may span multiple vendors' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  items: OrderLineDto[];

  @ApiProperty()
  @IsObject()
  shippingAddress: Record<string, string>;
}
