import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';
import { BedAssignment, AssignmentStatus } from './bed-assignment.entity';
import { BedSensor } from './bed-sensor.entity';
import { NotificationHistory } from './notification-history.entity';
import { Sensor } from 'src/sensor/entities/sensor.entity';
import { Patient } from 'src/patient/entities/patient.entity';

@Entity('bed')
export class Bed {
  @PrimaryGeneratedColumn()
  bed_id: number;

  @Column()
  department_building_id: number;

  @Column({ nullable: true })
  patient_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => DepartmentBuilding, (db) => db.beds, { eager: true })
  @JoinColumn({ name: 'department_building_id' })
  departmentBuilding: DepartmentBuilding;

  // One-to-One relationship with Patient (this bed.patient_id references patient.patient_id)
  @OneToOne(() => Patient, (patient) => patient.bed, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
  // One-to-Many relationships with new entities
  @OneToMany(() => BedAssignment, (assignment) => assignment.bed, {
    cascade: true,
  })
  assignments: BedAssignment[];

  @OneToMany(() => BedSensor, (sensor) => sensor.bed, { cascade: true })
  bedSensors: BedSensor[];

  @OneToMany(() => Sensor, (sensor) => sensor.bed, { cascade: true })
  sensors: Sensor[];

  @OneToMany(() => NotificationHistory, (notification) => notification.bed)
  notifications: NotificationHistory[];

  // Helper method to get current active assignment
  getCurrentAssignment(): BedAssignment | undefined {
    return this.assignments?.find(
      (assignment) => assignment.status === AssignmentStatus.ACTIVE,
    );
  }

  // Helper method to get current patient
  getCurrentPatient(): Patient | undefined {
    return this.getCurrentAssignment()?.patient;
  }
}
