import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sensor_type')
export class SensorType {
  @PrimaryGeneratedColumn({ name: 'sensor_type_id' })
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  desc?: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
