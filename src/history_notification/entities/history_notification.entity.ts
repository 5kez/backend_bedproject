import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
@Entity()
export class HistoryNotification {
  @PrimaryGeneratedColumn()
  Id: number;
  @Column()
  Patient_Id: number;
  @Column({ type: 'datetime' }) // ✅ กำหนด type เป็น datetime อย่างชัดเจน
  Noti_time: Date; // ✅ เปลี่ยนจาก string เป็น Date
  @Column()
  Noti_type: string;
  @Column()
  Noti_desc: string;
  @Column()
  Noti_id: number;
  @Column()
  Noti_setting_id: number;
  @Column()
  Status: number;
  @Column()
  Sensor_id: number;
  @Column()
  Sensor_type: string;
  @Column()
  Device_id: string;
  @Column()
  User_id: number;
  @Column({ type: 'datetime', nullable: true })
  Patient_indate: Date;
  @Column()
  Patient_remark: string;
  @Column()
  Patient_department: string;
  @Column()
  Patient_room_num: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'Patient_Id' })
  patient: Patient;
}
