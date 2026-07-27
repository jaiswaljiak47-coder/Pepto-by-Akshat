import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
// Use @Public() to bypass the global JwtAuthGuard on a route (e.g. login, register, webhooks)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
