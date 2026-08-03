import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 1, description: 'User ID', required: false })
  user_id?: number;

  @ApiProperty({
    example: 1,
    description: 'Role ID of the user',
    required: false,
  })
  role_id?: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
    required: false,
  })
  user_password?: string;

  @ApiProperty({
    example: '0891234567',
    description: 'Phone number of the user',
    required: false,
  })
  tel?: string;

  @ApiProperty({
    example: '2025-03-22T10:00:00Z',
    description: 'Date when the user was created',
    format: 'date-time',
    required: false,
  })
  created_date?: string;

  @ApiProperty({
    example: '2025-03-22T12:00:00Z',
    description: 'Date when the user was last updated',
    format: 'date-time',
    required: false,
  })
  updated_date?: string;

  @ApiProperty({ description: 'Sites ID', required: false })
  sites_id?: number;

  @ApiProperty({ description: 'Username', required: false })
  user_name?: string;

  @ApiProperty({ description: 'Last name', required: false })
  last_name?: string;

  @ApiProperty({ description: 'Building ID', required: false })
  build_id?: number;

  @ApiProperty({ description: 'Status', required: false })
  status?: string;

  @ApiProperty({ description: 'Roles code', required: false })
  roles_code?: string;

  @ApiProperty({ description: 'Department id', required: false })
  department_id?: number;
}
