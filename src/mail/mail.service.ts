import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOrderConfirmationEmail(buyerEmail: string, orderDetails: any) {
    await this.mailerService.sendMail({
      to: buyerEmail,
      subject: `Order Confirmation - Order #${orderDetails.orderId}`,
      template: './order-confirmation',
      context: orderDetails,
    });
  }

  async sendProductSoldNotification(vendorEmail: string, orderData: any) {
    await this.mailerService.sendMail({
      to: vendorEmail,
      subject: 'Product Sold Notification',
      template: './product-sold',
      context: orderData,
    });
  }
}
