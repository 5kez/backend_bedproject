import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';
import type { Patient } from 'src/patient/entities/patient.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ name: 'department_id' })
  id: number;

  @Column({ name: 'department_name', type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DepartmentBuilding, (db) => db.department)
  departmentBuildings: DepartmentBuilding[];

  @OneToMany('Patient', 'department')
  patients: Patient[];
}
