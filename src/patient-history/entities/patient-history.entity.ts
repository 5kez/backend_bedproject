import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('history_patient')
export class PatientHistory {
  @PrimaryGeneratedColumn({ name: 'history_id' })
  id: number;

  @Column()
  patient_id: number;

  @Column({ nullable: true })
  sensors_id?: number;

  @Column({ type: 'timestamp', nullable: false })
  in_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  out_date?: Date;

  @Column({ nullable: true })
  remark?: string;

  @Column()
  status: string;

  @Column()
  create_user_id: number;

  @Column()
  update_user_id: number;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}
