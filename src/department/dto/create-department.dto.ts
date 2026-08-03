import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// Object สำหรับ mapping
export class DepartmentMappingDto {
  @IsInt()
  building_id: number;

  @IsOptional()
  @IsInt()
  floor_id?: number | null;

  @IsOptional()
  @IsInt()
  floor_number?: number | null;
}

export class CreateDepartmentDto {
  @IsNotEmpty()
  @IsString()
  department_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentMappingDto)
  mappings: DepartmentMappingDto[];
}
