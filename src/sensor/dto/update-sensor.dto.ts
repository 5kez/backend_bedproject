import { PartialType } from '@nestjs/swagger';
import { CreateSensorDto } from './create-sensor.dto';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Patient } from 'src/patient/entities/patient.entity';

export class UpdateSensorDto extends PartialType(CreateSensorDto) {
  @IsOptional()
  @IsString()
  mac?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsNumber()
  sensorType_Id?: number;

  @IsOptional()
  @IsNumber()
  patient_id?: number | null;

  @IsOptional()
  @IsString()
  patient?: Patient;

  @IsOptional()
  @IsNumber()
  site_Id?: number;
}
