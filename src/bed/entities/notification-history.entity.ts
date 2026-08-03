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
import { Sensor } from '../../sensor/entities/sensor.entity';
import { User } from '../../user/entities/user.entity';

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

export enum NotificationStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ACKNOWLEDGED = 'acknowledged',
}

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn()
  history_id: number;

  @Column({ type: 'varchar', length: 50 })
  alert_type: string; // HeartRate, SpO2, BedSensor, etc.

  @Column({
    type: 'enum',
    enum: AlertLevel,
  })
  alert_level: AlertLevel;

  @Column()
  patient_id: number;

  @Column({ nullable: true })
  bed_id: number;

  @Column({ nullable: true })
  sensor_id: number;

  @Column({ type: 'text' })
  alert_message: string;

  @Column({ type: 'json', nullable: true })
  sensor_data: any; // JSON data ของค่าเซนเซอร์ตอนแจ้งเตือน

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.ACTIVE,
  })
  status: NotificationStatus;

  @Column({ type: 'datetime', nullable: true })
  resolved_at: Date;

  @Column({ nullable: true })
  resolved_by: number;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;

  @Column({ type: 'datetime', nullable: true })
  acknowledged_at: Date;

  @Column({ nullable: true })
  acknowledged_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Patient, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Bed, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @ManyToOne(() => Sensor, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'resolved_by' })
  resolvedByUser: User;

  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledgedByUser: User;
}
