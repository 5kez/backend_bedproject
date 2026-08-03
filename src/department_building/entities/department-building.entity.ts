import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Department } from 'src/department/entities/department.entity';
import { Building } from 'src/buildings/entities/building.entity';
import { Floor } from 'src/floors/entities/floor.entity';
import { Bed } from 'src/bed/entities/bed.entity';

@Entity('department_building')
export class DepartmentBuilding {
  @PrimaryGeneratedColumn({ name: 'department_building_id' })
  id: number;

  @Column()
  department_id: number;

  @Column()
  building_id: number;

  @Column({ type: 'int', nullable: true })
  floor_id: number | null;

  @Column({ type: 'int', nullable: true })
  floor_number: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Department, (department) => department.departmentBuildings, {
    eager: true,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Building, (building) => building.departmentBuildings, {
    eager: true,
  })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @ManyToOne(() => Floor, (floor) => floor.departmentBuildings, {
    eager: false,
  })
  @JoinColumn({ name: 'floor_id' })
  floor: Floor;

  @OneToMany(() => Bed, (bed) => bed.departmentBuilding)
  beds: Bed[];

  @OneToMany(() => Patient, (patient) => patient.department)
  patients: Patient[];
}
