import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  id: number;
  name: string;
  surname: string;
  email: string;
  line_id: string;
  photo: string;
  site_id: number;
  created_at: Date;
  updated_at: Date;
}
