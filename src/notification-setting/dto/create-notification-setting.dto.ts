import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateNotificationSettingDto {
  @IsNotEmpty()
  @IsNumber()
  patient_id: number;

  @IsNotEmpty()
  @IsNumber()
  sensor_type_id: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsNotEmpty()
  config: any;
}
