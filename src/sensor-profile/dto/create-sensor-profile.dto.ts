import { IsNumber, IsObject } from 'class-validator';
import { SensorConfig } from '../interface/sensor-profile.interface';

export class CreateSensorProfileDto {
  @IsNumber()
  sensorType_Id: number;

  @IsObject()
  config: SensorConfig;
}
