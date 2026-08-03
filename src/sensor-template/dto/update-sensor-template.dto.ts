import { PartialType } from '@nestjs/swagger';
import { CreateSensorTemplateDto } from './create-sensor-template.dto';
import { IsNumber, IsObject } from 'class-validator';
import { SensorConfig } from '../interface/sensor-profile.interface';

export class UpdateSensorTemplateDto extends PartialType(
  CreateSensorTemplateDto,
) {
  @IsNumber()
  sensorType_Id: number;

  @IsObject()
  config: SensorConfig;
}
