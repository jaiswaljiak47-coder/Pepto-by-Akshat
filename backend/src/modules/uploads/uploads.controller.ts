import { Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('presign')
  presign(@Query('contentType') contentType: string, @Query('folder') folder?: string) {
    return this.uploadsService.getPresignedUploadUrl(contentType, folder);
  }
}
