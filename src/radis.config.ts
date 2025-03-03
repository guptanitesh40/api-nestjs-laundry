import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { RedisOptions } from 'ioredis';

const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
};

@Injectable()
export class RedisQueueService {
  private notificationQueue: Queue;

  constructor() {
    this.notificationQueue = new Queue('pushNotifications', {
      connection: redisConfig,
    });
    this.processQueue();
  }

  async addNotificationToQueue(data: any) {
    await this.notificationQueue.add('sendNotification', data);
  }

  private processQueue() {
    new Worker(
      'pushNotifications',
      async (job) => {
        const { app, deviceToken, title, body } = job.data;
        try {
          await app.messaging().send({
            notification: { title, body },
            token: deviceToken,
          });
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      },
      { connection: redisConfig },
    );
  }
}
