import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { useContainer, ValidationError } from 'class-validator';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        if (validationErrors.length === 0) {
          return new BadRequestException('Validation failed');
        }
        const firstError = validationErrors[0];

        const firstConstraint = Object.values(firstError.constraints || {})[0];
        return new BadRequestException(firstConstraint || 'Validation failed');
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'images'), {
    index: false,
    prefix: '/images',
  });
  app.use(cors({ origin: '*' }));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
