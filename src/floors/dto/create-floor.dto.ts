import { ApiProperty } from '@nestjs/swagger';

export class CreateFloorDto {
  @ApiProperty({ example: 'Floor 1' })
  floor_name: string;

  @ApiProperty({ example: 'ชั้น 1' })
  floor_name_en: string;

  @ApiProperty({ example: 'Near lobby', required: false })
  remark?: string;

  @ApiProperty({ example: 1 })
  building_id: number;
}
