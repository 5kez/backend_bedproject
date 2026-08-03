import { PartialType } from '@nestjs/swagger';
import { CreateSensorProfileDto } from './create-sensor-profile.dto';
import { IsNumber, IsObject } from 'class-validator';
import { SensorConfig } from '../interface/sensor-profile.interface';

export class UpdateSensorProfileDto extends PartialType(
  CreateSensorProfileDto,
) {
  @IsNumber()
  sensorType_Id: number;

  @IsObject()
  config: SensorConfig;
}
