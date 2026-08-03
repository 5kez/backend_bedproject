import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePatientHistoryDto } from './create-patient-history.dto';
import { IsNumber } from 'class-validator';

export class UpdatePatientHistoryDto extends PartialType(
  CreatePatientHistoryDto,
) {
  id: number;

  @ApiProperty({ example: 1, description: 'รหัสผู้ป่วย' })
  @IsNumber()
  patient_id: number;

  @ApiProperty({ example: 1, description: 'รหัสอุปกรณ์' })
  @IsNumber()
  sensors_id: number;
  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'วันที่เวลาเข้าใช้งาน',
  })
  in_date?: Date;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'วันที่เวลาออก',
  })
  out_date?: Date;

  @ApiProperty({ example: 'Remark text', description: 'หมายเหตุ' })
  remark?: string;

  @ApiProperty({ example: '1', description: 'สถานะการใช้งาน' })
  status: string;

  @ApiProperty({ example: 1, description: 'รหัสผู้ใช้งาน' })
  @IsNumber()
  create_user_id: number;

  @ApiProperty({ example: 1, description: 'รหัสผู้ใช้งาน' })
  @IsNumber()
  update_user_id: number;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'วันที่เวลาเพิ่ม',
  })
  created_at: Date;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'วันที่เวลาแก้ไข',
  })
  updated_at: Date;
}
