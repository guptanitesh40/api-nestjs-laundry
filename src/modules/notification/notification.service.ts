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
import { getCustomerOrderStatusLabel } from 'src/utils/order-status.helper';
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

  private prepareMessage(order: Order): string {
    const formattedDate = new Date(order.created_at).toLocaleDateString(
      'en-GB',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    );

    if (order.order_status === OrderStatus.DELIVERED) {
      return `Dear ${order.user.first_name} ${order.user.last_name}, your order (Booking No: SCONLINE/${order.order_id}) has been successfully delivered. We hope you are satisfied with our service. Thank you for choosing Sikka Cleaners!`;
    }

    if (
      order.order_status ===
      OrderStatus.DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY
    ) {
      return `Dear ${order.user.first_name} ${order.user.last_name}, your order (Booking No: SCONLINE/${order.order_id}) has been assigned to a delivery boy and is ready for delivery. Thank you for choosing Sikka Cleaners!`;
    }

    return `Dear ${order.user.first_name} ${order.user.last_name}, your order has been confirmed with Booking No: SCONLINE/${order.order_id} on ${formattedDate}. Total clothes: ${order.items.length}, Total Amount: ₹${order.total}. Thank you for choosing Sikka Cleaners!`;
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
