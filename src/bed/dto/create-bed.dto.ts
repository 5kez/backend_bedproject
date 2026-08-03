import { ApiProperty } from '@nestjs/swagger';

export class CreateBedDto {
  @ApiProperty({ example: 1, description: 'DepartmentBuilding ID' })
  department_building_id: number;

  @ApiProperty({ example: 101, description: 'Patient ID', required: false })
  patient_id?: number;

  @ApiProperty({ example: 5, description: 'Sensor ID', required: false })
  sensor_id?: number;
}
