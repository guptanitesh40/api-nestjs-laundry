import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import bodyParser from 'body-parser';
import { useContainer, ValidationError } from 'class-validator';
import dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';
import './instrument';
import { TrimPipe } from './pipes/trim.pipe';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new TrimPipe(),
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
  app.useStaticAssets(join(__dirname, '..', 'pdf'), {
    prefix: '/pdf',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    },
  });
  app.useStaticAssets(join(__dirname, '..', 'images'), {
    index: false,
    prefix: '/images',
  });
  // app.use(cors({ origin: '*' }));

  // app.enableCors({
  //   origin: [`${process.env.WEBSITE_IP}`, `${process.env.ADMIN_IP}`],
  //   credentials: true,
  //   exposedHeaders: ['Content-Disposition'],
  // });

  app.enableCors({
    origin: '*',
    exposedHeaders: ['Content-Disposition'],
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.setBaseViewsDir(join(__dirname, '..', 'src', 'templates'));
  app.setViewEngine('ejs');

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const port = process.env.PORT;
  await app.listen(port);
}
bootstrap();
