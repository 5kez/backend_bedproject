import { PartialType, ApiProperty } from '@nestjs/swagger';
import {
  CreateDepartmentDto,
  DepartmentMappingDto,
} from './create-department.dto';
import { IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {
  @ApiProperty({
    type: [DepartmentMappingDto],
    required: false,
    description: 'อัปเดต mapping ของ department (building + floor)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepartmentMappingDto)
  mappings?: DepartmentMappingDto[];
}
