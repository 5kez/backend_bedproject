import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Patient } from '../../patient/entities/patient.entity';
import { SensorType } from '../../sensor-type/entities/sensor-type.entity';

export interface SensorAlertConfig {
  alert_positions?: number[];
  threshold_low?: number;
  threshold_high?: number;
  threshold?: { min: number; max: number };
}

@Entity('notification_setting')
@Unique(['patient_id', 'sensor_type_id'])
@Index(['sensor_type_id'])
export class NotificationSetting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patient_id: number;

  @Column({ name: 'sensor_type_id' })
  sensor_type_id: number;

  @Column({ type: 'tinyint', width: 1, default: 1 })
  enabled: boolean;

  @Column({ type: 'json' })
  config: SensorAlertConfig;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Patient, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => SensorType, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType: SensorType;
}
