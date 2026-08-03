import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sites_type')
export class SitesType {
  @PrimaryGeneratedColumn({ name: 'site_type_id' })
  id: number;

  @Column({ length: 60 })
  name: string;

  @Column({ length: 255, nullable: true })
  remark: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
