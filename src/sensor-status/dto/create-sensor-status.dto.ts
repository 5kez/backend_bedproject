import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateSensorStatusDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  name_img?: string;

  @IsInt()
  status_group: number;

  @IsString()
  active: string;

  create_userlogin: number;

  update_userlogin: number;
}
