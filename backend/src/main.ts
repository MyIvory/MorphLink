import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Налаштування CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['content-type'],
    credentials: true,
  });

  // Використовуємо Socket.IO адаптер
  app.useWebSocketAdapter(new IoAdapter(app));

  // Запускаємо на порту з env або 3000
  await app.listen(process.env.PORT || 3000);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
