import { Module } from '@nestjs/common';
import { FaceGateway } from './face.gateway';

@Module({
  providers: [FaceGateway],
})
export class FaceModule {}
