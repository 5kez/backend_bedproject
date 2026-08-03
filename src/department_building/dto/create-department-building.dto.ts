import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';

export class CreateDepartmentBuildingDto {
  @ApiProperty({ example: 1, description: 'Department ID' })
  department_id: number;

  @ApiProperty({ example: 2, description: 'Building ID' })
  building_id: number;

  @ApiProperty({
    example: 3,
    description: 'Floor ID (deprecated - ใช้ floor_number แทน)',
    required: false,
  })
  @IsOptional()
  floor_id?: number;

  @ApiProperty({
    example: 5,
    description: 'หมายเลขชั้น (1, 2, 3, ...)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  floor_number?: number;
}
