import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import cookieSession from 'cookie-session';
import { configuration } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = configuration();

  app.use(
    cookieSession({
      name: config.cookie.name,
      keys: config.cookie.keys,
      maxAge: config.cookie.maxAge,
      secure: config.cookie.secure,
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(helmet());
  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(config.port);
}
bootstrap();
