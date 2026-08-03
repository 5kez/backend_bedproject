import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { BedSensorStatus } from '../entities/bed-sensor.entity';

export class AssignSensorToBedDto {
  @IsNotEmpty()
  @IsNumber()
  bed_id: number;

  @IsNotEmpty()
  @IsNumber()
  sensor_id: number;

  @IsNotEmpty()
  @IsNumber()
  sensor_type_id: number;

  @IsNotEmpty()
  @IsDateString()
  installation_date: Date;

  @IsOptional()
  @IsDateString()
  last_maintenance?: Date;

  @IsOptional()
  calibration_data?: any;

  @IsOptional()
  @IsEnum(BedSensorStatus)
  status?: BedSensorStatus;

  @IsNotEmpty()
  @IsNumber()
  installed_by: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBedSensorDto {
  @IsOptional()
  @IsDateString()
  last_maintenance?: Date;

  @IsOptional()
  calibration_data?: any;

  @IsOptional()
  @IsEnum(BedSensorStatus)
  status?: BedSensorStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class RemoveSensorFromBedDto {
  @IsNotEmpty()
  @IsNumber()
  bed_id: number;

  @IsNotEmpty()
  @IsNumber()
  sensor_id: number;
}
