import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({
    example: 'โรงพยาบาลบ้านรักษ์',
    description: 'ชื่อของสถานที่ (Site name)',
  })
  @IsString()
  sites_name: string;

  @ApiProperty({
    example: 13.7563,
    description: 'ละติจูด (Latitude) ความแม่นยำ 6 ตำแหน่ง',
    type: 'number',
    format: 'float',
  })
  @IsNumber()
  lat: number;

  @ApiProperty({
    example: 100.5018,
    description: 'ลองจิจูด (Longitude) ความแม่นยำ 6 ตำแหน่ง',
    type: 'number',
    format: 'float',
  })
  @IsNumber()
  lng: number;

  @ApiProperty({
    example: '123/45 ถ.พหลโยธิน เขตบางเขน กรุงเทพฯ',
    description: 'ที่อยู่ของสถานที่',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: 1,
    description: 'รหัสประเภทสถานที่ (FK - เป็นเลข id)',
  })
  @IsNumber()
  sites_type_id: number;

  @ApiProperty({
    example: 10,
    description: 'รหัสจังหวัด (FK - เป็นเลข id)',
  })
  @IsNumber()
  prov_id: number;

  @ApiProperty({
    example: 'GLOBAL-SITE-001',
    description: 'Global site ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  site_global?: number;
}
