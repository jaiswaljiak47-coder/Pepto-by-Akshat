import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UploadsService {
  private s3: S3Client;

  constructor(private config: ConfigService) {
    this.s3 = new S3Client({
      region: this.config.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.config.get<string>('aws.accessKeyId')!,
        secretAccessKey: this.config.get<string>('aws.secretAccessKey')!,
      },
    });
  }

  // Returns a pre-signed URL the client (Flutter app) can PUT directly to,
  // avoiding proxying large files through the API server.
  async getPresignedUploadUrl(contentType: string, folder = 'products') {
    const key = `${folder}/${uuid()}`;
    const command = new PutObjectCommand({
      Bucket: this.config.get<string>('aws.bucket'),
      Key: key,
      ContentType: contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `https://${this.config.get('aws.bucket')}.s3.${this.config.get('aws.region')}.amazonaws.com/${key}`;
    return { uploadUrl, publicUrl, key };
  }
}
