import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import cookieSession from 'cookie-session';
import { configuration } from './config/configuration';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = configuration();

  app.use(
    cookieSession({
      name: "session",
      keys: ["some randome key", "some randome key"],
      maxAge: 24 * 7 * 3600000,
      secure: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true,
    transform: true,
    exceptionFactory: (errors) => {
      const messages = errors.map(error => ({
        field: error.property,
        message: Object.values(error.constraints).join(', '),
      }));
      return {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
        details: messages,
      };
    },
  }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet());
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(config.port);
}
bootstrap();
