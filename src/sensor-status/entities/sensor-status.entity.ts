import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MasterStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  name_img: string;

  @Column()
  status_group: number;

  @Column()
  active: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;

  @Column()
  create_userlogin: number;

  @Column()
  update_userlogin: number;
}
