import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class NotificationTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  heartRateMin: number;

  @Column({ nullable: true })
  heartRateMax: number;

  @Column({ nullable: true })
  oxygenMin: number;

  @Column({ nullable: true })
  oxygenMax: number;

  @Column({ type: 'enum', enum: ['1', '2', '3', '4', '5'] })
  condition: '1' | '2' | '3' | '4' | '5';

  @CreateDateColumn()
  createdAt: Date;
}
