import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/entities/order.entity';
import { customerApp, driverApp } from 'src/firebase.config';
import { getCustomerOrderStatusLabel } from 'src/utils/order-status.helper';
import Twilio from 'twilio';

@Injectable()
export class NotificationService {
  private readonly apiUrl = 'https://wts.vision360solutions.co.in/api/sendText';
  private readonly twilioClient: Twilio.Twilio;
  private readonly twilioFrom: string;

  constructor(private readonly httpService: HttpService) {
    this.twilioClient = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
    this.twilioFrom = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendOrderNotification(order: any): Promise<void> {
    if (!order) {
      throw new NotFoundException(`Order with ID ${order.order_id} not found.`);
    }

    const message = this.prepareMessage(order);

    const encodedMessage = encodeURIComponent(message);

    const finalUrl = `${this.apiUrl}?token=${process.env.VISION360_WHATSAPP_API_TOKEN}&phone=91${order.user.mobile_number}&message=${encodedMessage}`;

    const response = await firstValueFrom(this.httpService.post(finalUrl, {}));

    if (response.status !== 200) {
      throw new Error('Failed to send WhatsApp notification');
    }
  }

  private prepareMessage(order: Order): string {
    const formattedDate = new Date(order.created_at).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );

    return `Dear ${order.user.first_name} ${order.user.last_name}, your booking has been confirmed with Booking No: SCONLINE/${order.order_id} on ${formattedDate}. Total clothes: ${order.items.length}, Total Amount: ₹${order.total}. Please check your bill here: www.sikkacleaners.in/sikka-billing/customer-login.`;
  }

  async sendOrderStatusNotification(order: any): Promise<any> {
    if (!order) {
      throw new NotFoundException(`Order with Id ${order.order_id} not found.`);
    }

    const orderStatus = getCustomerOrderStatusLabel(order.order_status);

    const message = `Dear ${order.user?.first_name} ${order.user?.last_name}, we are delighted to inform you that your order #${order.order_id} is now ${orderStatus}. Thank you for choosing us!`;

    const encodedMessage = encodeURIComponent(message);

    const finalUrl = `${this.apiUrl}?token=${process.env.VISION360_WHATSAPP_API_TOKEN}&phone=91${order.user?.mobile_number}&message=${encodedMessage}`;

    const response = await firstValueFrom(this.httpService.post(finalUrl, {}));

    if (response.status !== 200) {
      throw new Error('Failed to send WhatsApp notification');
    }
  }

  async sendPushNotification(deviceToken: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };

    try {
      const response = await customerApp.messaging().send(message);

      return { success: true, response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  }

  async sendPushNotificationDriver(
    deviceToken: string,
    title: string,
    body: string,
  ) {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };

    try {
      const response = await driverApp.messaging().send(message);

      return { success: true, response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  }
}
