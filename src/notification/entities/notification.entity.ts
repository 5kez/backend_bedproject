import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { SensorType } from '../../sensor-type/entities/sensor-type.entity';

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  CONFIRMED = 'confirmed',
  DISMISSED = 'dismissed',
}

@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patient_id: number;

  @Column({ name: 'patient_name' })
  patient_name: string;

  @Column({ name: 'sensor_type_id' })
  sensor_type_id: number;

  @Column({ name: 'sensor_type_name' })
  sensor_type_name: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text', nullable: true })
  details: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => SensorType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType: SensorType;
}
