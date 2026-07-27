import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

// Listens for domain events (order.created, vendor.approved, etc.) emitted
// elsewhere via EventEmitter2, and dispatches email/push notifications.
// A production version would queue these through Bull (see BullModule in
// app.module.ts) instead of sending inline.
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  @OnEvent('order.created')
  handleOrderCreated(payload: { orderId: string; vendorId: string }) {
    this.logger.log(`Notify vendor ${payload.vendorId} of new order ${payload.orderId}`);
    // TODO: send email via nodemailer / push via FCM
  }

  @OnEvent('vendor.approved')
  handleVendorApproved(payload: { vendorId: string }) {
    this.logger.log(`Notify vendor ${payload.vendorId}: application approved`);
  }
}
