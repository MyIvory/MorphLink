import { IsString, IsNumber, IsArray, ValidateNested, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PointDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class FaceLandmarksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PointDto)
  points: PointDto[];
}

export class FaceExpressionsDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  happy: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  sad: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  angry: number;
}

export class FaceDto {
  @IsObject()
  @ValidateNested()
  @Type(() => FaceLandmarksDto)
  landmarks: FaceLandmarksDto;

  @IsObject()
  @ValidateNested()
  @Type(() => FaceExpressionsDto)
  expressions: FaceExpressionsDto;
}

export class FaceMessageDto {
  @IsString()
  roomId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => FaceDto)
  faceData: FaceDto;
}

export class JoinRoomDto {
  @IsString()
  room: string;
}
