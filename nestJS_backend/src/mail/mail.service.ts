import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

interface OrderMailDetails {
  orderId: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  date: string;
}

interface ProductSoldDetails {
  productName: string;
  quantity: number;
  buyerEmail: string;
}

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendOrderConfirmationEmail(
    buyerEmail: string,
    orderDetails: OrderMailDetails,
  ) {
    await this.mailerService.sendMail({
      to: buyerEmail,
      subject: `Order Confirmation - Order #${orderDetails.orderId}`,
      template: './order-confirmation',
      context: orderDetails,
    });
  }

  async sendProductSoldNotification(
    vendorEmail: string,
    orderData: ProductSoldDetails,
  ) {
    await this.mailerService.sendMail({
      to: vendorEmail,
      subject: 'Product Sold Notification',
      template: './product-sold',
      context: orderData,
    });
  }

  async sendPasswordResetEmail(userEmail: string, token: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Password Reset Code - B2B Marketplace',
      template: './reset-password',
      context: { token },
    });
  }
}
