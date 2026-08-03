import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Roles {
  @PrimaryGeneratedColumn({ name: 'role_id' })
  id: number;
  @Column()
  roles_name: string;
  @Column({ name: 'description' })
  desc: string;
  @Column()
  created_at: string;
  @Column()
  updated_at: string;
  @Column()
  roles_code: string;
}
