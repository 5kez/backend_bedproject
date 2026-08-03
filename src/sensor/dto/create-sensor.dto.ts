import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSensorDto {
  @IsOptional()
  @IsString()
  mac: string;

  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  desc: string;

  @IsOptional()
  @IsString()
  hash: string;

  @IsOptional()
  @IsNumber()
  sensorType_Id: number;
  @IsOptional()
  @IsNumber()
  site_Id: number;
  @IsOptional()
  @IsNumber()
  patient_id?: number | null;
}
