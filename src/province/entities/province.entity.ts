import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('province')
export class Province {
  @PrimaryGeneratedColumn({
    name: 'province_id',
    type: 'tinyint',
    unsigned: true,
  })
  id: number;

  @Column({ type: 'varchar', length: 4, nullable: false })
  prov_code: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  prov_name: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  prov_name_th: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  remark: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @Column({ type: 'tinyint', width: 1, nullable: true })
  geo_id: number;
}
