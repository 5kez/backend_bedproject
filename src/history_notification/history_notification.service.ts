import { Injectable } from '@nestjs/common';
import { CreateHistoryNotificationDto } from './dto/create-history_notification.dto';
import { HistoryNotification } from './entities/history_notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from 'src/patient/entities/patient.entity';

@Injectable()
export class HistoryNotificationService {
  constructor(
    @InjectRepository(HistoryNotification)
    private historyNotificationRepository: Repository<HistoryNotification>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}
  create(createHistoryNotificationDto: CreateHistoryNotificationDto) {
    return this.historyNotificationRepository.save(
      createHistoryNotificationDto,
    );
  }

  // newest first - the history screen used to open on the oldest alerts
  findAll() {
    return this.historyNotificationRepository.find({
      order: { Noti_time: 'DESC' },
    });
  }

  findOne(id: number) {
    return this.historyNotificationRepository.findOne({ where: { Id: id } });
  }

  async findBySiteId(site_id: number) {
    return this.historyNotificationRepository
      .createQueryBuilder('history')
      .innerJoin(Patient, 'patient', 'history.Patient_Id = patient.patient_id')
      .where('patient.site_id = :site_id', { site_id })
      .select('history')
      .orderBy('history.Noti_time', 'DESC')
      .getMany();
  }
}
