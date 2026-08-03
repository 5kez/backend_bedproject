import { ApiProperty } from '@nestjs/swagger';

export class CreateSitesTypeDto {
  @ApiProperty({ example: 'โรงพยาบาล', description: 'Site type name' })
  name: string;

  @ApiProperty({ example: 'สถานพยาบาลขนาดใหญ่', required: false })
  remark?: string;
}
