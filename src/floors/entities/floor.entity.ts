import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Building } from '../../buildings/entities/building.entity';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';

@Entity('floor')
export class Floor {
  @PrimaryGeneratedColumn({ name: 'floor_id' })
  id: number;

  @Column({ length: 60 })
  floor_name: string;

  @Column({ length: 60 })
  floor_name_en: string;

  @Column({ length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Building, (building) => building.floors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @OneToMany(() => DepartmentBuilding, (db) => db.floor)
  departmentBuildings: DepartmentBuilding[];
}
