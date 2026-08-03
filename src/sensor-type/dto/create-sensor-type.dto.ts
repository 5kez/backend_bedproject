import { ApiProperty } from '@nestjs/swagger';

export class CreateSensorTypeDto {
  user_id: number;

  @ApiProperty({ example: 1, description: 'Role ID of the user' })
  role_id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  user_password: string;

  @ApiProperty({
    example: '0891234567',
    description: 'Phone number of the user',
  })
  tel: string;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date when the user was created',
    format: 'date-time',
  })
  created_date: string;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'Date when the user was last updated',
    format: 'date-time',
  })
  updated_date: string;

  sites_id: number;

  user_name: string;

  last_name: string;

  build_id: number;

  status: string;

  roles_code: string;

  floor_id: number;
}
