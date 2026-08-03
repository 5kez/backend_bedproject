import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Bed } from './bed.entity';
import { Sensor } from '../../sensor/entities/sensor.entity';
import { SensorType } from '../../sensor-type/entities/sensor-type.entity';
import { User } from '../../user/entities/user.entity';

export enum BedSensorStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  ERROR = 'error',
}

@Entity('bed_sensors')
export class BedSensor {
  @PrimaryGeneratedColumn()
  bed_sensor_id: number;

  @Column()
  bed_id: number;

  @Column()
  sensor_id: number;

  @Column()
  sensor_type_id: number;

  @Column({ type: 'datetime' })
  installation_date: Date;

  @Column({ type: 'datetime', nullable: true })
  last_maintenance: Date;

  @Column({ type: 'json', nullable: true })
  calibration_data: any;

  @Column({
    type: 'enum',
    enum: BedSensorStatus,
    default: BedSensorStatus.ACTIVE,
  })
  status: BedSensorStatus;

  @Column()
  installed_by: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Bed, (bed) => bed.sensors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @ManyToOne(() => Sensor, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;

  @ManyToOne(() => SensorType, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType: SensorType;

  @ManyToOne(() => User, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'installed_by' })
  installedByUser: User;
}
