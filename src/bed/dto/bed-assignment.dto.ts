import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
} from 'class-validator';
import { AssignmentStatus } from '../entities/bed-assignment.entity';

export class CreateBedAssignmentDto {
  @IsNotEmpty()
  @IsNumber()
  patient_id: number;

  @IsNotEmpty()
  @IsNumber()
  bed_id: number;

  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsNotEmpty()
  @IsDateString()
  assigned_at: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty()
  @IsNumber()
  assigned_by: number;
}

export class UpdateBedAssignmentDto {
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @IsOptional()
  @IsDateString()
  transferred_at?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class TransferPatientDto {
  @IsNotEmpty()
  @IsNumber()
  new_bed_id: number;

  @IsOptional()
  @IsString()
  transfer_notes?: string;

  @IsNotEmpty()
  @IsNumber()
  transferred_by: number;
}
