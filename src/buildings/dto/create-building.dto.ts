import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({ example: 'อาคารผู้ป่วยใน' })
  @IsString()
  build_name: string;

  @ApiProperty({ example: 13.7563 })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: 100.5018 })
  @IsNumber()
  lng: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  sites_id: number;

  @ApiProperty({ example: 10 })
  @IsNumber()
  global_id: number;

  @ApiProperty({ example: 5, description: 'จำนวนชั้นของอาคาร' })
  @IsOptional()
  @IsNumber()
  floor_count?: number;
}
