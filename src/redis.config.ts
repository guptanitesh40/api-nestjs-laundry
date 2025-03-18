import { Injectable } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import admin from 'firebase-admin';
import { RedisOptions } from 'ioredis';
import { nanoid } from 'nanoid';

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
    const dateWithMilliseconds = new Date();
    const unixTimeStampWithMilliseconds = dateWithMilliseconds.getTime();
    new Worker(
      'pushNotifications',
      async (job) => {
        const { appName, deviceToken, title, body } = job.data;

        const app = admin.app(appName);

        try {
          await app.messaging().send({
            notification: { title, body },
            token: deviceToken,
            data: {
              updatedAt: String(unixTimeStampWithMilliseconds),
              id: nanoid(10),
            },
          });
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      },
      { connection: redisConfig },
    );
  }
}
