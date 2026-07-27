import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateVendorDto {
  @ApiProperty()
  @IsString()
  storeName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
