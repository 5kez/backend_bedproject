import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreatePatientDto } from './create-patient.dto';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @ApiProperty({
    example: 101,
    description: 'Bed ID assigned to the patient',
    required: false,
  })
  sensors_id?: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the patient',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: '1990-05-20',
    description: 'Patient birth date',
    format: 'date',
    required: false,
  })
  birthDate?: Date;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date of admission',
    format: 'date-time',
    required: false,
  })
  admitDate?: Date;

  @ApiProperty({
    example: 1,
    description: 'Patient status (0: inactive, 1: active)',
    required: false,
  })
  status?: 0 | 1;

  @ApiProperty({
    example: '0891234567',
    description: 'Family contact number',
    required: false,
  })
  telFam?: string;

  @ApiProperty({
    example: '/uploads/patient/patient123.jpg',
    description: 'Patient image path',
    required: false,
  })
  image?: string;

  @ApiProperty({
    example: 3,
    description: 'Patient position (1-5)',
    required: false,
  })
  position?: 1 | 2 | 3 | 4 | 5;

  @ApiProperty({
    example: 'M',
    description: 'Gender of the patient (M: Male, F: Female)',
    required: false,
  })
  sex?: 'F' | 'M';

  @ApiProperty({
    example: 'Needs oxygen support',
    description: 'Additional remarks',
    required: false,
  })
  remark?: string;

  @ApiProperty({
    example: 95,
    description: 'Oxygen level of the patient',
    required: false,
  })
  oxygen?: number;

  @ApiProperty({
    example: 75,
    description: 'Heart rate of the patient',
    required: false,
  })
  heartRate?: number;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date created',
    format: 'date-time',
    required: false,
  })
  created_date?: Date;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'Date last updated',
    format: 'date-time',
    required: false,
  })
  updated_date?: Date;

  create_user_id: number;
  update_user_id: number;

  @ApiProperty({
    example: 101,
    description: 'Bed ID assigned to the patient',
    required: false,
  })
  floor_id?: number;
  @ApiProperty({
    example: 101,
    description: 'Bed ID assigned to the patient',
    required: false,
  })
  room_id?: number;
  @ApiProperty({
    example: 101,
    description: 'Bed ID assigned to the patient',
    required: false,
  })
  bed_id?: number;
  site_id?: number;
  department_id?: number;
}
