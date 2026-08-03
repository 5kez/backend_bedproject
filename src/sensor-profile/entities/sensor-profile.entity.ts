import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Sensor } from 'src/sensor/entities/sensor.entity';
import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';

@Entity()
export class SensorProfile {
  @PrimaryGeneratedColumn({ name: 'sensor_profile_id' })
  id: number;

  @OneToOne(() => Sensor, (sensor) => sensor.sensor_profile)
  @JoinColumn({ name: 'sensorId' })
  sensor: Sensor;

  @Column()
  sensorType_Id: number;

  @Column({ type: 'json' })
  config: any;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export class PoseSettingDto {
  @IsString()
  name: string;

  @IsString()
  name_img: string;

  @IsBoolean()
  active: boolean;

  @IsNumber()
  delay: number;

  @IsNumber()
  repeat: number;

  @IsNumber()
  sensitivity: number;
}

export class PoseSensorConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PoseSettingDto)
  poses: PoseSettingDto[];

  @IsNumber()
  globalSensitivity: number;
}
