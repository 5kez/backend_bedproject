import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { Bed } from './bed.entity';
import { User } from '../../user/entities/user.entity';

export enum AssignmentStatus {
  ACTIVE = 'active',
  TRANSFERRED = 'transferred',
  DISCHARGED = 'discharged',
}

@Entity('bed_assignments')
export class BedAssignment {
  @PrimaryGeneratedColumn()
  assignment_id: number;

  @Column()
  patient_id: number;

  @Column()
  bed_id: number;

  @Column({
    type: 'enum',
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus;

  @Column({ type: 'datetime' })
  assigned_at: Date;

  @Column({ type: 'datetime', nullable: true })
  transferred_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  assigned_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Patient, (patient) => patient.bedAssignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Bed, (bed) => bed.assignments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser: User;
}
