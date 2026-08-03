import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationSettingDto } from './dto/create-notification-setting.dto';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';
import { NotificationSetting } from './entities/notification-setting.entity';
import { SensorType } from '../sensor-type/entities/sensor-type.entity';

@Injectable()
export class NotificationSettingService {
  constructor(
    @InjectRepository(NotificationSetting)
    private notificationSettingRepository: Repository<NotificationSetting>,
    @InjectRepository(SensorType)
    private sensorTypeRepository: Repository<SensorType>,
  ) {}

  async create(
    createNotificationSettingDto: CreateNotificationSettingDto,
  ): Promise<NotificationSetting> {
    return this.notificationSettingRepository.save(
      createNotificationSettingDto,
    );
  }

  async findAll(): Promise<NotificationSetting[]> {
    return this.notificationSettingRepository.find({
      relations: ['patient', 'sensorType'],
    });
  }

  async findOne(id: number): Promise<NotificationSetting | null> {
    return this.notificationSettingRepository.findOne({
      where: { id },
      relations: ['patient', 'sensorType'],
    });
  }

  async findByPatientId(patient_id: number): Promise<NotificationSetting[]> {
    return this.notificationSettingRepository.find({
      where: { patient_id },
      relations: ['patient', 'sensorType'],
    });
  }

  async findByPatientAndSensorType(
    patient_id: number,
    sensor_type_id: number,
  ): Promise<NotificationSetting | null> {
    const setting = await this.notificationSettingRepository.findOne({
      where: { patient_id, sensor_type_id },
      relations: ['patient', 'sensorType'],
    });

    return setting;
  }

  async findByDepartment(
    department_id: number,
  ): Promise<NotificationSetting[]> {
    return this.notificationSettingRepository
      .createQueryBuilder('notification_setting')
      .leftJoinAndSelect('notification_setting.patient', 'patient')
      .leftJoinAndSelect('notification_setting.sensorType', 'sensorType')
      .where('patient.department_id = :department_id', { department_id })
      .getMany();
  }

  async update(
    id: number,
    updateNotificationSettingDto: UpdateNotificationSettingDto,
  ): Promise<void> {
    await this.notificationSettingRepository.update(
      id,
      updateNotificationSettingDto,
    );
  }

  async remove(id: number): Promise<void> {
    await this.notificationSettingRepository.delete(id);
  }

  async createDefaultNotificationSettings(patient_id: number): Promise<void> {
    // ดึง sensor types ทั้งหมด
    const sensorTypes = await this.sensorTypeRepository.find();

    // Function สำหรับสร้าง default config ตาม sensor type
    const getDefaultConfig = (sensorTypeId: number) => {
      switch (sensorTypeId) {
        case 1: // BedSensor
          return {
            alert_positions: [3, 4, 5],
          };
        case 2: // HeartRate
          return {
            threshold_low: 60,
            threshold_high: 100,
          };
        case 3: // Spo2
          return {
            threshold_low: 90,
          };
        default:
          // Default config สำหรับ sensor type อื่น ๆ
          return {
            threshold: {
              min: 0,
              max: 100,
            },
          };
      }
    };

    // สร้าง notification setting เริ่มต้นสำหรับแต่ละ sensor type
    const notificationSettings = sensorTypes.map((sensorType) => ({
      patient_id,
      sensor_type_id: sensorType.id,
      enabled: true,
      config: getDefaultConfig(sensorType.id),
    }));

    // บันทึกลงฐานข้อมูล
    await this.notificationSettingRepository.save(notificationSettings);
  }

  async removeByPatientId(patient_id: number): Promise<void> {
    await this.notificationSettingRepository.delete({ patient_id });
  }
}
