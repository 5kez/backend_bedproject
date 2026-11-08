import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sensor_type')
export class SensorType {
  @PrimaryGeneratedColumn({ name: 'sensor_type_id' })
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  desc?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
