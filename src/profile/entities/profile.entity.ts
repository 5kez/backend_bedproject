import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
