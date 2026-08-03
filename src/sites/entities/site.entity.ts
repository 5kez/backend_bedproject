import { Building } from 'src/buildings/entities/building.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn({ name: 'site_id' })
  id: number;

  @Column({ type: 'varchar', length: 60 })
  sites_name: string;

  @Column({ type: 'float', precision: 10, scale: 6 })
  lat: number;

  @Column({ type: 'float', precision: 10, scale: 6 })
  lng: number;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'tinyint' })
  sites_type_id: number;

  @Column({ type: 'tinyint' })
  prov_id: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @Column({ type: 'int' })
  site_global: number;

  @Column({ type: 'varchar', nullable: true })
  name_img: string;

  @OneToMany(() => Building, (building) => building.site)
  buildings: Building[];
}
