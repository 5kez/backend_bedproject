import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { NotificationStatus } from '../entities/notification.entity';
import type { NotificationMetadata } from '../notification.service';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsNumber()
  patient_id: number;

  @IsNotEmpty()
  @IsString()
  patient_name: string;

  @IsNotEmpty()
  @IsNumber()
  sensor_type_id: number;

  @IsNotEmpty()
  @IsString()
  sensor_type_name: string;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsNumber()
  room_id?: number;

  @IsOptional()
  @IsNumber()
  bed_id?: number;

  @IsOptional()
  metadata?: NotificationMetadata;
}
