import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotiTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  heartRateMin?: number;

  @IsOptional()
  @IsNumber()
  heartRateMax?: number;

  @IsOptional()
  @IsNumber()
  oxygenMin?: number;

  @IsOptional()
  @IsNumber()
  oxygenMax?: number;

  @IsEnum(['1', '2', '3', '4', '5'])
  condition: '1' | '2' | '3' | '4' | '5';
}
