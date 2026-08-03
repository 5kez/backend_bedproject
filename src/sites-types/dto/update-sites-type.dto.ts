import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSitesTypeDto } from './create-sites-type.dto';

export class UpdateSitesTypeDto extends PartialType(CreateSitesTypeDto) {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: '2025-06-21T10:00:00Z',
    format: 'date-time',
    required: false,
  })
  created_at?: Date;

  @ApiProperty({
    example: '2025-06-21T12:00:00Z',
    format: 'date-time',
    required: false,
  })
  updated_at?: Date;
}
