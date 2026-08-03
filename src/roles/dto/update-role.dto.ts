import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  id: number;
  roles_name: string;
  desc: string;
  created_at: string;
  updated_at: string;
  roles_code: string;
}
