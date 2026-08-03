import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn({ name: 'profile_id' })
  id: number;
  @Column()
  name: string;
  @Column()
  surname: string;
  @Column()
  email: string;
  @Column()
  line_id: string;
  @Column()
  photo: string;
  @Column()
  site_id: number;
  @Column()
  created_at: Date;
  @Column()
  updated_at: Date;
}
