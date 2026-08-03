import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSiteDto } from './create-site.dto';

export class UpdateSiteDto extends PartialType(CreateSiteDto) {
  @ApiProperty({
    example: 'โรงพยาบาลบ้านรักษ์',
    description: 'ชื่อของสถานที่',
    required: false,
  })
  sites_name?: string;

  @ApiProperty({
    example: 13.7563,
    description: 'ละติจูด (Latitude)',
    type: 'number',
    format: 'float',
    required: false,
  })
  lat?: number;

  @ApiProperty({
    example: 100.5018,
    description: 'ลองจิจูด (Longitude)',
    type: 'number',
    format: 'float',
    required: false,
  })
  lng?: number;

  @ApiProperty({
    example: '123/45 ถ.พหลโยธิน เขตบางเขน กรุงเทพฯ',
    description: 'ที่อยู่ของสถานที่',
    required: false,
  })
  address?: string;

  @ApiProperty({
    example: 'type-001',
    description: 'รหัสประเภทของสถานพยาบาล (FK)',
    required: false,
  })
  sites_type_id?: number;

  @ApiProperty({
    example: 'province-001',
    description: 'รหัสจังหวัด (FK)',
    required: false,
  })
  prov_id?: number;

  @ApiProperty({
    example: 'GLOBAL-SITE-001',
    description: 'Global site ID',
    required: false,
  })
  site_global?: number;

  @ApiProperty({
    example: '2025-05-27T09:00:00Z',
    description: 'วันที่แก้ไขล่าสุด',
    format: 'date-time',
    required: false,
  })
  updated_at?: Date;

  @ApiProperty({
    example: 1001,
    description: 'ID ของผู้ใช้ที่แก้ไขล่าสุด',
    required: false,
  })
  update_user_id?: number;

  @ApiProperty({
    example: 1000,
    description: 'ID ของผู้ใช้ที่สร้าง',
    required: false,
  })
  create_user_id?: number;

  @ApiProperty({
    example: '2025-05-25T10:00:00Z',
    description: 'วันที่สร้างข้อมูล',
    format: 'date-time',
    required: false,
  })
  created_at?: Date;
}
