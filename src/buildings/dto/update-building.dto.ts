import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateBuildingDto } from './create-building.dto';

export class UpdateBuildingDto extends PartialType(CreateBuildingDto) {
  @ApiProperty({ example: 1, description: 'ID of the building' })
  id: number;

  @ApiProperty({ example: 'อาคารผู้ป่วยใน', description: 'Building name' })
  build_name: string;

  @ApiProperty({ example: 13.7563, description: 'Latitude coordinate' })
  lat: number;

  @ApiProperty({ example: 100.5018, description: 'Longitude coordinate' })
  lng: number;

  @ApiProperty({ example: 2, description: 'Hospital site ID (foreign key)' })
  sites_id: number;

  @ApiProperty({
    example: 10,
    description: 'Global reference ID (foreign key)',
  })
  global_id: number;

  @ApiProperty({
    example: '2025-05-27T10:00:00Z',
    description: 'Timestamp when the building was created',
    format: 'date-time',
  })
  created_at: string;

  @ApiProperty({
    example: '2025-05-27T12:00:00Z',
    description: 'Timestamp when the building was last updated',
    format: 'date-time',
  })
  updated_at: string;
}
