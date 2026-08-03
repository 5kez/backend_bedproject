import { ApiProperty } from '@nestjs/swagger';
import { Sensor } from 'src/sensor/entities/sensor.entity';

export class CreatePatientDto {
  @ApiProperty({ example: 101, description: 'Bed ID assigned to the patient' })
  sensor_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the patient' })
  name: string;

  @ApiProperty({
    example: '1990-05-20',
    description: 'Patient birth date',
    format: 'date',
  })
  birthDate: Date;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date of admission',
    format: 'date-time',
  })
  admitDate: Date;

  @ApiProperty({
    example: 1,
    description: 'Patient status (0: inactive, 1: active)',
  })
  status: 0 | 1;

  @ApiProperty({ example: '0891234567', description: 'Family contact number' })
  telFam: string;

  @ApiProperty({
    example: '/uploads/patient/patient123.jpg',
    description: 'Patient image path',
  })
  image: string;

  @ApiProperty({ example: 3, description: 'Patient position (1-5)' })
  position: 1 | 2 | 3 | 4 | 5;

  @ApiProperty({
    example: 'M',
    description: 'Gender of the patient (M: Male, F: Female)',
  })
  sex: 'F' | 'M';

  @ApiProperty({
    example: 'Needs oxygen support',
    description: 'Additional remarks',
  })
  remark: string;

  @ApiProperty({ example: 95, description: 'Oxygen level of the patient' })
  oxygen: number;

  @ApiProperty({ example: 75, description: 'Heart rate of the patient' })
  heartRate: number;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date created',
    format: 'date-time',
  })
  created_date: Date;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'Date last updated',
    format: 'date-time',
  })
  updated_date: Date;

  @ApiProperty({ example: 101, description: 'Bed ID assigned to the patient' })
  floor_id: number;

  @ApiProperty({ example: 101, description: 'Bed ID assigned to the patient' })
  room_id: number;

  @ApiProperty({ example: 101, description: 'Bed ID assigned to the patient' })
  bed_id: number;

  sensors?: Sensor[];
  site_id: number;
  department_id: number;
}
