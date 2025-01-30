import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { Order } from 'src/entities/order.entity';
import admin from 'src/firebase.config';
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
    return `Dear ${order.user.first_name} ${order.user.last_name}, Your booking has been confirmed with Booking No: SCONLINE/${order.order_id}, on Dated ${order.created_at.toISOString()}, Total No of clothes ${order.items}, Total Amount: ${order.total}. Please, check your bill on this link: www.sikkacleaners.in/sikka-billing/customer-login.`;
  }

  async sendPushNotification(deviceToken: string, title: string, body: string) {
    const message = {
      notification: { title, body },
      token: deviceToken,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Notification sent successfully:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  }
}
