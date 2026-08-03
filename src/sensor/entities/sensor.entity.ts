import { SensorProfile } from 'src/sensor-profile/entities/sensor-profile.entity';
import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Bed } from 'src/bed/entities/bed.entity';
import { SensorType } from 'src/sensor-type/entities/sensor-type.entity';

@Entity()
export class Sensor {
  @PrimaryGeneratedColumn({ name: 'sensor_id' })
  id: number;

  @ManyToOne(() => Bed, (bed) => bed.sensors, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bed_id' })
  bed: Bed | null;

  @Column({
    name: 'bed_id',
    type: 'int',
    nullable: true,
  })
  bed_id: number | null;

  @Column()
  mac: string;

  @Column()
  name: string;

  @Column({ name: 'description', nullable: true })
  desc: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ name: 'site_Id' })
  site_Id: number;

  @Column({ name: 'sensor_type_id' })
  sensorType_Id: number;

  @ManyToOne(() => SensorType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sensor_type_id' })
  sensorType: SensorType;

  @OneToOne(() => SensorProfile, (profile) => profile.sensor)
  sensor_profile: SensorProfile;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
