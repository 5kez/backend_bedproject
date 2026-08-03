import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BedAssignment,
  AssignmentStatus,
} from '../entities/bed-assignment.entity';
import {
  CreateBedAssignmentDto,
  UpdateBedAssignmentDto,
  TransferPatientDto,
} from '../dto/bed-assignment.dto';
import { Bed } from '../entities/bed.entity';
import { Patient } from '../../patient/entities/patient.entity';

@Injectable()
export class BedAssignmentService {
  private readonly logger = new Logger(BedAssignmentService.name);

  constructor(
    @InjectRepository(BedAssignment)
    private bedAssignmentRepository: Repository<BedAssignment>,
    @InjectRepository(Bed)
    private bedRepository: Repository<Bed>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createDto: CreateBedAssignmentDto): Promise<BedAssignment> {
    // Check if bed exists
    const bed = await this.bedRepository.findOne({
      where: { bed_id: createDto.bed_id },
    });
    if (!bed) {
      throw new NotFoundException(`Bed with ID ${createDto.bed_id} not found`);
    }

    // Check if patient exists
    const patient = await this.patientRepository.findOne({
      where: { patient_id: createDto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException(
        `Patient with ID ${createDto.patient_id} not found`,
      );
    }

    // Check if bed is already occupied
    const existingAssignment = await this.bedAssignmentRepository.findOne({
      where: {
        bed_id: createDto.bed_id,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Bed ${createDto.bed_id} is already occupied`,
      );
    }

    // Check if patient is already assigned to another bed
    const patientActiveAssignment = await this.bedAssignmentRepository.findOne({
      where: {
        patient_id: createDto.patient_id,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (patientActiveAssignment) {
      throw new BadRequestException(
        `Patient ${createDto.patient_id} is already assigned to bed ${patientActiveAssignment.bed_id}`,
      );
    }

    const assignment = this.bedAssignmentRepository.create({
      ...createDto,
      assigned_at: new Date(createDto.assigned_at),
      status: createDto.status || AssignmentStatus.ACTIVE,
    });

    return this.bedAssignmentRepository.save(assignment);
  }

  async findAll(): Promise<BedAssignment[]> {
    return this.bedAssignmentRepository.find({
      relations: ['patient', 'bed', 'assignedByUser'],
    });
  }

  async findByPatient(patientId: number): Promise<BedAssignment[]> {
    return this.bedAssignmentRepository.find({
      where: { patient_id: patientId },
      relations: ['bed', 'assignedByUser'],
      order: { created_at: 'DESC' },
    });
  }

  async findByBed(bedId: number): Promise<BedAssignment[]> {
    return this.bedAssignmentRepository.find({
      where: { bed_id: bedId },
      relations: ['patient', 'assignedByUser'],
      order: { created_at: 'DESC' },
    });
  }

  async findActive(): Promise<BedAssignment[]> {
    return this.bedAssignmentRepository.find({
      where: { status: AssignmentStatus.ACTIVE },
      relations: ['patient', 'bed', 'assignedByUser'],
    });
  }

  async update(
    id: number,
    updateDto: UpdateBedAssignmentDto,
  ): Promise<BedAssignment> {
    const assignment = await this.bedAssignmentRepository.findOne({
      where: { assignment_id: id },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    const { transferred_at, ...rest } = updateDto;
    const updatePayload: Partial<BedAssignment> = { ...rest };
    if (transferred_at) {
      updatePayload.transferred_at = new Date(transferred_at);
    }

    await this.bedAssignmentRepository.update(id, updatePayload);
    const updatedAssignment = await this.bedAssignmentRepository.findOne({
      where: { assignment_id: id },
      relations: ['patient', 'bed', 'assignedByUser'],
    });

    if (!updatedAssignment) {
      throw new NotFoundException(
        `Assignment with ID ${id} not found after update`,
      );
    }

    return updatedAssignment;
  }

  async transferPatient(
    assignmentId: number,
    transferDto: TransferPatientDto,
  ): Promise<BedAssignment> {
    const currentAssignment = await this.bedAssignmentRepository.findOne({
      where: { assignment_id: assignmentId, status: AssignmentStatus.ACTIVE },
    });

    if (!currentAssignment) {
      throw new NotFoundException(
        `Active assignment with ID ${assignmentId} not found`,
      );
    }

    // Check if new bed exists and is available
    const newBed = await this.bedRepository.findOne({
      where: { bed_id: transferDto.new_bed_id },
    });
    if (!newBed) {
      throw new NotFoundException(
        `Bed with ID ${transferDto.new_bed_id} not found`,
      );
    }

    const existingAssignment = await this.bedAssignmentRepository.findOne({
      where: {
        bed_id: transferDto.new_bed_id,
        status: AssignmentStatus.ACTIVE,
      },
    });

    if (existingAssignment) {
      throw new BadRequestException(
        `Bed ${transferDto.new_bed_id} is already occupied`,
      );
    }

    // Mark current assignment as transferred
    await this.bedAssignmentRepository.update(assignmentId, {
      status: AssignmentStatus.TRANSFERRED,
      transferred_at: new Date(),
      notes:
        currentAssignment.notes +
        (transferDto.transfer_notes
          ? ` | Transfer: ${transferDto.transfer_notes}`
          : ''),
    });

    // Create new assignment
    const newAssignment = await this.create({
      patient_id: currentAssignment.patient_id,
      bed_id: transferDto.new_bed_id,
      assigned_at: new Date().toISOString(),
      assigned_by: transferDto.transferred_by,
      notes:
        `Transferred from bed ${currentAssignment.bed_id}` +
        (transferDto.transfer_notes ? ` - ${transferDto.transfer_notes}` : ''),
    });

    return newAssignment;
  }

  async discharge(assignmentId: number, dischargedBy: number): Promise<void> {
    const assignment = await this.bedAssignmentRepository.findOne({
      where: { assignment_id: assignmentId, status: AssignmentStatus.ACTIVE },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Active assignment with ID ${assignmentId} not found`,
      );
    }

    // หมายเหตุ: ยังไม่มีคอลัมน์ discharged_by ในฐานข้อมูล จึงบันทึกไว้ใน log เพื่อ audit ไปก่อน
    this.logger.log(
      `Assignment ${assignmentId} discharged by user ${dischargedBy}`,
    );

    await this.bedAssignmentRepository.update(assignmentId, {
      status: AssignmentStatus.DISCHARGED,
      transferred_at: new Date(), // Using transferred_at as discharge time
    });
  }

  async remove(id: number): Promise<void> {
    const assignment = await this.bedAssignmentRepository.findOne({
      where: { assignment_id: id },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    await this.bedAssignmentRepository.remove(assignment);
  }
}
