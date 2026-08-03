import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;
  @Column()
  profile_id: number;
  @Column()
  site_id: number;
  @Column()
  user_name: string;
  @Column()
  user_password: string;
  @Column()
  name: string;
  @Column()
  last_name: string;
  @Column()
  build_id: number;
  @Column()
  status: string;
  @Column()
  role_id: number;
  @Column()
  roles_code: string;
  @Column()
  department_id: number;
  @Column()
  floor_id: number;
}
