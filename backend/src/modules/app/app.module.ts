import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FaceModule } from '../face/face.module';
import config from '../../config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    FaceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
