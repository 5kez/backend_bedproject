import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateDepartmentBuildingDto } from './create-department-building.dto';

export class UpdateDepartmentBuildingDto extends PartialType(
  CreateDepartmentBuildingDto,
) {
  @ApiProperty({ example: 1, description: 'Primary ID of Department_Building' })
  id: number;

  @ApiProperty({
    example: '2025-08-29T10:00:00Z',
    format: 'date-time',
    required: false,
  })
  created_at?: Date;

  @ApiProperty({
    example: '2025-08-29T12:00:00Z',
    format: 'date-time',
    required: false,
  })
  updated_at?: Date;
}
