import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity()
export class SensorTemplate {
  @PrimaryGeneratedColumn({ name: 'sensor_template_id' })
  id: number;

  @Column()
  name: string; // ชื่อ template

  @Column()
  sensorType_Id: number;

  @Column({ type: 'json' })
  config: any; // default config เดียวกับใน SensorProfile

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
