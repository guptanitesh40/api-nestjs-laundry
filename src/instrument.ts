import * as dotenv from 'dotenv';
dotenv.config();

import * as Sentry from '@sentry/nestjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});
