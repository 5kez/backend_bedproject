import { Floor } from 'src/floors/entities/floor.entity';
import { Site } from 'src/sites/entities/site.entity';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('building')
export class Building {
  @PrimaryGeneratedColumn({ name: 'building_id' })
  id: number;

  @Column({ type: 'varchar', length: 60 })
  build_name: string;

  @Column({ type: 'float', precision: 10, scale: 6, nullable: true })
  lat: number;

  @Column({ type: 'float', precision: 10, scale: 6, nullable: true })
  lng: number;

  @Column()
  site_id: number;

  @Column()
  global_id: number;

  @Column({ nullable: true, default: 1 })
  floor_count: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @ManyToOne(() => Site, (site) => site.buildings)
  @JoinColumn({ name: 'site_id' })
  site: Site;

  @OneToMany(() => Floor, (floor) => floor.building)
  floors: Floor[];

  @OneToMany(() => DepartmentBuilding, (db) => db.building)
  departmentBuildings: DepartmentBuilding[];
}
