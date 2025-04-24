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
    const job = await this.notificationQueue.add('sendNotification', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return job;
  }

  private static isWorkerInitialized = false;

  private processQueue() {
    if (RedisQueueService.isWorkerInitialized) return;
    RedisQueueService.isWorkerInitialized = true;

    new Worker(
      'pushNotifications',
      async (job) => {
        const { appName, deviceToken, title, body } = job.data;

        const app = admin.app(appName);

        try {
          await app.messaging().send({
            notification: { title, body },
            token: deviceToken,
            android: {
              priority: 'high',
            },
            apns: {
              headers: {
                'apns-priority': '10',
              },
            },
            data: {
              updatedAt: String(Date.now()),
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
