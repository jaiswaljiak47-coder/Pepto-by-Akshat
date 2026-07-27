import { Controller, Headers, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // Stripe requires the raw body for signature verification;
  // configure a raw-body middleware/exception for this route in main.ts.
  @Public()
  @Post('webhook')
  handleWebhook(@Req() req: Request, @Headers('stripe-signature') signature: string) {
    const event = this.paymentsService.constructWebhookEvent(req.body, signature);
    // TODO: switch on event.type (payment_intent.succeeded, charge.refunded, etc.)
    // and update the corresponding Order status accordingly.
    return { received: true, type: event.type };
  }
}
