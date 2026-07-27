import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { VendorStatus } from '../entities/vendor.entity';

export class UpdateVendorStatusDto {
  @ApiProperty({ enum: VendorStatus })
  @IsEnum(VendorStatus)
  status: VendorStatus;
}
