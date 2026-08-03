import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from 'src/department/entities/department.entity';
import { BedAssignment } from 'src/bed/entities/bed-assignment.entity';
import { Bed } from 'src/bed/entities/bed.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  patient_id: number;
  @Column()
  name: string;
  @Column()
  birthDate: Date;
  @Column()
  status: number;
  @Column()
  telFam: string;
  @Column()
  thaiId: string;
  @Column()
  image: string;
  @Column()
  sex: string;
  @Column()
  remark: string;
  @Column({ name: 'created_at' })
  created_date: Date;
  @Column({ name: 'updated_at' })
  updated_date: Date;
  @Column()
  create_user_id: number;
  @Column()
  update_user_id: number;
  @Column()
  room_id: number;
  @Column()
  floor_id: number;
  @Column()
  admitDate: Date;

  @OneToMany(() => BedAssignment, (assignment) => assignment.patient)
  bedAssignments: BedAssignment[];

  // ✅ เพิ่ม bed_id column สำหรับ one-to-one relationship
  @Column({ nullable: true })
  bed_id: number;

  // One-to-One relationship with Bed (bed.patient_id references this patient)
  @OneToOne(() => Bed, (bed) => bed.patient)
  bed: Bed;

  @Column({ name: 'site_id' })
  site_id: number;
  @Column()
  department_id: number;

  @ManyToOne(() => Department, (department) => department.patients, {
    eager: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;
}
