import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  const corsConfig = configService.get('cors');
  const swaggerConfig = configService.get('swagger');

  // Налаштування валідації
  app.useGlobalPipes(new ValidationPipe());
  
  // Налаштування Swagger
  const config = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version)
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerConfig.path, app, document);

  // Налаштування CORS з конфігу
  app.enableCors(corsConfig);

  // Використовуємо Socket.IO адаптер
  app.useWebSocketAdapter(new IoAdapter(app));

  // Запускаємо на порту з env або 3000
  await app.listen(port);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/${swaggerConfig.path}`);
}
bootstrap();
