import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { UserRole } from '@/modules/users/entities/user.entity';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private vendorsService: VendorsService) {}

  @Post('apply')
  apply(@CurrentUser('id') userId: string, @Body() dto: CreateVendorDto) {
    return this.vendorsService.applyAsVendor(userId, dto);
  }

  @Public()
  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findById(id);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateVendorStatusDto) {
    return this.vendorsService.updateStatus(id, dto.status);
  }
}
