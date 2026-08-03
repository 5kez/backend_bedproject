import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientHistory } from './entities/patient-history.entity';
import { CreatePatientHistoryDto } from './dto/create-patient-history.dto';
import { UpdatePatientHistoryDto } from './dto/update-patient-history.dto';

@Injectable()
export class PatientHistoryService {
  constructor(
    @InjectRepository(PatientHistory)
    private readonly PatientHistoryRepository: Repository<PatientHistory>,
  ) {}

  create(dto: CreatePatientHistoryDto) {
    return this.PatientHistoryRepository.save(dto as PatientHistory);
  }

  findAll() {
    return this.PatientHistoryRepository.find({
      where: { status: '1' },
    });
  }

  findActiveCase() {
    return this.PatientHistoryRepository.find({
      where: { status: '0' },
    });
  }

  findOne(id: number) {
    return this.PatientHistoryRepository.findOneBy({ id });
  }

  update(id: number, dto: UpdatePatientHistoryDto) {
    return this.PatientHistoryRepository.update(id, dto);
  }

  remove(id: number) {
    return this.PatientHistoryRepository.delete(id);
  }
}
