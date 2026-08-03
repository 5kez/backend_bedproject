import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateProvinceDto {
  @IsString()
  prov_code: string;

  @IsOptional()
  @IsString()
  prov_name?: string;

  @IsOptional()
  @IsString()
  prov_name_th?: string;

  @IsOptional()
  @IsString()
  hash?: string;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsOptional()
  @IsNumber()
  geo_id?: number;
}
