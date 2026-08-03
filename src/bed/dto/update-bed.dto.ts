import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateBedDto } from './create-bed.dto';

export class UpdateBedDto extends PartialType(CreateBedDto) {
  @ApiProperty({ example: 1 })
  bed_id: number;

  @ApiProperty({
    example: '2025-09-01T10:00:00Z',
    format: 'date-time',
    required: false,
  })
  created_at?: Date;

  @ApiProperty({
    example: '2025-09-01T12:00:00Z',
    format: 'date-time',
    required: false,
  })
  updated_at?: Date;
}
