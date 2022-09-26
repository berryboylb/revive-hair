import { RolesGuard } from './auth/guards/roles.guards';
import { ValidatorOptions, ValidationError } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter, MongoExceptionFilter } from './exception.filter';

export interface ValidationPipeOptions extends ValidatorOptions {
  transform?: true;
  disableErrorMessages?: false;
  exceptionFactory?: (errors: ValidationError[]) => any;
}

async function bootstrap() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: '*',
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://revivehaircosmetics.com',
      'https://www.revivehaircosmetics.com',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalGuards(new RolesGuard(new Reflector()));
  app.useGlobalFilters(new MongoExceptionFilter());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(PORT);
}
bootstrap();
