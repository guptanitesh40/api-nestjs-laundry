import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import admin from 'firebase-admin';
import { nanoid } from 'nanoid';
import { firstValueFrom } from 'rxjs';
import { Response } from 'src/dto/response.dto';
import { Notification } from 'src/entities/notification.entity';
import { Order } from 'src/entities/order.entity';
import { OrderStatus } from 'src/enum/order-status.eum';
import { In, Repository } from 'typeorm';
import { RedisQueueService } from '../../redis.config';

@Injectable()
export class NotificationService {
  private readonly apiUrl = 'https://wts.vision360solutions.co.in/api/sendText';

  constructor(
    private readonly httpService: HttpService,
    private readonly redisQueueService: RedisQueueService,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

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

    const notification = this.notificationRepository.create({
      order_id: order.order_id,
      user_id: order.user_id,
      order_status: order.order_status,
      notification_message: message,
    });

    await this.notificationRepository.save(notification);
  }

  async sendOrderPaymentNotification(order: any): Promise<void> {
    if (!order) {
      throw new NotFoundException(`Order with ID ${order.order_id} not found.`);
    }

    const message = this.prepareMessageOrderPayment(order);

    const encodedMessage = encodeURIComponent(message);

    const finalUrl = `${this.apiUrl}?token=${process.env.VISION360_WHATSAPP_API_TOKEN}&phone=91${order.user.mobile_number}&message=${encodedMessage}`;

    const response = await firstValueFrom(this.httpService.post(finalUrl, {}));

    if (response.status !== 200) {
      throw new Error('Failed to send WhatsApp notification');
    }

    const notification = this.notificationRepository.create({
      order_id: order.order_id,
      user_id: order.user_id,
      order_status: order.order_status,
      notification_message: message,
    });

    await this.notificationRepository.save(notification);
  }

  private prepareMessageOrderPayment(order: any) {
    return `Thank you for making the payment of ${order.paid_amount} at Sikka Cleaners. Payment has been processed successfully.`;
  }

  async sendUserNotification(user: any): Promise<any> {
    if (!user) {
      throw new NotFoundException(`User with Id ${user.user_id} not found`);
    }
    const message = this.prepareMessageForUser(user);

    const encodedMessage = encodeURIComponent(message);

    const finalUrl = `${this.apiUrl}?token=${process.env.VISION360_WHATSAPP_API_TOKEN}&phone=91${user.mobile_number}&message=${encodedMessage}`;

    const response = await firstValueFrom(this.httpService.post(finalUrl, {}));

    if (response.status !== 200) {
      throw new Error('Failed to send WhatsApp notification');
    }
  }

  async sendOrderCompleteworkshopNotification(order: any): Promise<any> {
    if (!order) {
      throw new NotFoundException(`Order with Id ${order.order_id} not found`);
    }
    const message = this.prepareMessageForOrderCompleted(order);

    const encodedMessage = encodeURIComponent(message);

    const finalUrl = `${this.apiUrl}?token=${process.env.VISION360_WHATSAPP_API_TOKEN}&phone=91${order.user.mobile_number}&message=${encodedMessage}`;

    const response = await firstValueFrom(this.httpService.post(finalUrl, {}));

    if (response.status !== 200) {
      throw new Error('Failed to send WhatsApp notification');
    }
  }

  private prepareMessageForOrderCompleted(order: any) {
    return `Dear ${order.user.first_name} ${order.user.last_name}, your order with Booking No: SCONLINE/${order.order_id} has been completed at the workshop and received at the branch.`;
  }

  private prepareMessageForUser(user: any) {
    return `Dear ${user.first_name} ${user.last_name}, your Sikka Cleaners account is activated`;
  }

  private prepareMessage(order: Order): string {
    const createdDate = new Date(order.created_at);

    const formattedDate = `${String(createdDate.getDate()).padStart(2, '0')}/${String(
      createdDate.getMonth() + 1,
    ).padStart(2, '0')}/${createdDate.getFullYear()}`;

    const deliveryDate = new Date(order.estimated_delivery_time);

    const formattedDelivryDate = `${String(deliveryDate.getDate()).padStart(2, '0')}/${String(
      deliveryDate.getMonth() + 1,
    ).padStart(2, '0')}/${deliveryDate.getFullYear()}`;

    if (order.order_status === OrderStatus.DELIVERED) {
      return `Dear ${order.user.first_name} ${order.user.last_name}, your order (Booking No: SCONLINE/${order.order_id}) has been successfully delivered. Received an amount ${order.paid_amount}. We hope you are satisfied with our service. If, any issue contact management team immediately. Thank you for choosing Sikka Cleaners. ${process.env.WEBSITE_IP}`;
    }

    if (
      order.order_status ===
      OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY
    ) {
      return `Dear ${order.user.first_name} ${order.user.last_name},your clothes for dry clean/steam press, (Booking No: SCONLINE/${order.order_id}) are ready. Thank You. Sikka Cleaners. ${process.env.WEBSITE_IP}
`;
    }

    const quantity = order.items.reduce((acc, o) => acc + (o.quantity || 1), 0);

    return `Dear ${order.user.first_name} ${order.user.last_name}, your order has been confirmed with Booking No:  SCONLINE/${order.order_id} on Dated ${formattedDate}.  Total Quantity: ${quantity}, Total Amount: ₹${order.total}. Delivery Date ${formattedDelivryDate}. Thank you for choosing Sikka Cleaners. ${process.env.WEBSITE_IP}`;
  }

  async sendPushNotification(
    app: admin.app.App,
    deviceToken: string,
    title: string,
    body: string,
  ) {
    try {
      await this.redisQueueService.addNotificationToQueue({
        appName: app.name,
        deviceToken,
        title,
        body,
      });
    } catch (error) {
      console.error('Error adding notification to queue:', error);
    }
  }

  async sendPushNotificationsAllCustomer(
    app: admin.app.App,
    deviceTokens: string[],
    title: string,
    body: string,
  ) {
    try {
      const message: any = {
        notification: { title, body },
        tokens: deviceTokens,
        android: {
          priority: 'high',
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
        },
        data: {
          updatedAt: String(new Date()),
          id: nanoid(10),
        },
      };

      const response = await app.messaging().sendEachForMulticast(message);

      return response;
    } catch (error) {
      console.error(
        'Error sending push notifications:',
        error?.errorInfo || error,
      );
    }
  }

  async getAll(user_id: number): Promise<Response> {
    const notification = await this.notificationRepository.find({
      where: { user_id: user_id, deleted_at: null },
    });

    return {
      statusCode: 200,
      message: 'Notification list retrived successfully',
      data: notification,
    };
  }

  async delete(notification_ids: number[], user_id: number): Promise<Response> {
    const notification = await this.notificationRepository.find({
      where: {
        notification_id: In(notification_ids),
        user_id: user_id,
        deleted_at: null,
      },
    });

    if (!notification.length) {
      return {
        statusCode: 404,
        message: 'Notification not found',
        data: null,
      };
    }

    notification.map((n) => {
      n.deleted_at = new Date();
    });

    await this.notificationRepository.save(notification);

    return {
      statusCode: 200,
      message: 'Notification Deleted Successfully',
      data: null,
    };
  }
}
