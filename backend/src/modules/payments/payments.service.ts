import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey')!, {
      apiVersion: '2024-09-30.acacia',
    });
  }

  // Creates a PaymentIntent for a single vendor order. In production, use
  // Stripe Connect (destination charges) so funds route to vendor accounts
  // automatically, minus the application_fee_amount (platform commission).
  async createPaymentIntent(amountCents: number, vendorStripeAccountId: string, feeCents: number) {
    return this.stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      application_fee_amount: feeCents,
      transfer_data: { destination: vendorStripeAccountId },
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.get<string>('stripe.webhookSecret')!,
    );
  }
}
