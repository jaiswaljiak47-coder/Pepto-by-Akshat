import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor, VendorStatus } from './entities/vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(@InjectRepository(Vendor) private repo: Repository<Vendor>) {}

  async applyAsVendor(userId: string, dto: CreateVendorDto) {
    const existing = await this.repo.findOneBy({ userId });
    if (existing) throw new ConflictException('Vendor profile already exists for this user');

    const slug = dto.storeName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const vendor = this.repo.create({
      userId,
      storeName: dto.storeName,
      description: dto.description,
      storeSlug: `${slug}-${Date.now().toString(36)}`,
      status: VendorStatus.PENDING,
    });
    return this.repo.save(vendor);
  }

  findAll(status?: VendorStatus) {
    return this.repo.find({ where: status ? { status } : {} });
  }

  async findById(id: string) {
    const vendor = await this.repo.findOneBy({ id });
    if (!vendor) throw new NotFoundException('Vendor not found');
    return vendor;
  }

  findByUserId(userId: string) {
    return this.repo.findOneBy({ userId });
  }

  async updateStatus(id: string, status: VendorStatus) {
    const vendor = await this.findById(id);
    vendor.status = status;
    return this.repo.save(vendor);
  }
}
