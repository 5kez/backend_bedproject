/* eslint-disable no-useless-catch */
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Patient } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MqttService } from '../mqtt/mqtt.service';
import { NotificationSettingService } from '../notification-setting/notification-setting.service';
import * as fs from 'fs';
import * as path from 'path';
import { SensorsService } from 'src/sensor/sensor.service';
import { Building } from 'src/buildings/entities/building.entity';
import { PatientHistoryService } from 'src/patient-history/patient-history.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private sensorRepository: SensorsService,
    private readonly configService: ConfigService,
    private readonly mqttService: MqttService,
    private readonly notificationSettingService: NotificationSettingService,
    private readonly patientHistoryService: PatientHistoryService,
    @InjectRepository(Building)
    private buildingRepository: Repository<Building>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // สร้าง patient ใหม่
    const newPatient = await this.patientsRepository.save(createPatientDto);

    // สร้าง notification settings เริ่มต้นสำหรับ patient ใหม่
    try {
      await this.notificationSettingService.createDefaultNotificationSettings(
        newPatient.patient_id,
      );
      await this.patientHistoryService.create({
        patient_id: newPatient.patient_id,
        sensors_id: null,
        in_date: new Date(),
        out_date: null,
        remark: '',
        status: '0',
        create_user_id: newPatient.create_user_id,
        update_user_id: newPatient.update_user_id,
      });
    } catch (error) {
      // console.error('❌ Error creating default notification settings:', error);
      throw error;
      // console.error('❌ Error creating default notification settings:', error);
      throw error;
    }

    return newPatient;
  }

  async getPatientsByFloorID(floor_id): Promise<Patient[]> {
    const pas = await this.patientsRepository.find({
      where: { floor_id: Number(floor_id) },
    });
    if (!pas) {
      // console.log('Users not found:', floor_id);
      return [];
      // console.log('Users not found:', floor_id);
      return [];
    }
    // console.log('Found users from :', floor_id + pas);
    // console.log('Found users from :', floor_id + pas);
    return pas;
  }

  async getPatientsByBuildingAndDepartment(
    building_id: number,
    department_id: number,
  ): Promise<Patient[]> {
    // Find the building to get its site_id
    const building = await this.buildingRepository.findOneBy({
      id: building_id,
    });
    if (!building) {
      throw new Error(`Building with id ${building_id} not found`);
    }

    // Query patients via bed.patient_id (beds that have patients assigned)
    return this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.bed', 'bed')
      .where('bed.patient_id = patient.patient_id')
      .andWhere('patient.site_id = :site_id', { site_id: building.site_id })
      .andWhere('patient.department_id = :department_id', { department_id })
      .andWhere('patient.status = :status', { status: 1 })
      .getMany();
  }

  async getPatientsByDepartment(department_id: number): Promise<Patient[]> {
    console.log(
      '🔍 [Backend] Searching patients for department_id:',
      department_id,
      'Type:',
      typeof department_id,
    );

    // ✅ แปลง string เป็น number ก่อนเสมอ
    const deptId = Number(department_id);

    // ✅ Query ด้วย QueryBuilder แทน find() เพื่อให้แน่ใจว่า WHERE ทำงาน
    const patients = await this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.bed', 'bed')
      .leftJoinAndSelect('patient.department', 'department')
      .where('patient.department_id = :deptId', { deptId })
      .andWhere('patient.status = :status', { status: 1 })
      .getMany();

    console.log(
      `📊 [Backend] Found ${patients.length} patients for department ${department_id}`,
    );

    if (patients.length > 0) {
      patients.forEach((patient, index) => {
        console.log(`👤 [Backend] Patient ${index + 1}:`, {
          name: patient.name,
          patient_id: patient.patient_id,
          department_id: patient.department_id,
          bed_id: patient.bed_id,
          status: patient.status,
        });
      });

      // 🔍 Debug: ตรวจสอบข้อมูลที่จะส่งกลับไปยัง frontend
      // console.log(
      //   '🌐 [Backend] Patient data being sent to frontend:',
      //   JSON.stringify(
      //     patients.map((p) => ({
      //       patient_id: p.patient_id,
      //       name: p.name,
      //       bed_id: p.bed_id,
      //       department_id: p.department_id,
      //     })),
      //     null,
      //     2,
      //   ),
      // );
    } else {
      console.log('⚠️ [Backend] No patients found matching criteria');

      // ตรวจสอบว่ามีผู้ป่วยในแผนกนี้หรือไม่ (ไม่สนใจ bed_id และ status)
      const allPatientsInDept = await this.patientsRepository.find({
        where: { department_id: department_id },
      });
      console.log(
        `🔍 [Backend] Total patients in department ${department_id} (ignoring bed/status):`,
        allPatientsInDept.length,
      );

      // ตรวจสอบ active patients ทั้งหมด
      const allActivePatients = await this.patientsRepository.find({
        where: { status: 1 }, // ใช้ 1 แทน true สำหรับ number type
      });
      console.log(
        `🔍 [Backend] Total active patients in system:`,
        allActivePatients.length,
      );
    }

    return patients;
  }
  getAllPatient(): Promise<Patient[]> {
    return this.patientsRepository.find({
      relations: ['bed'], // เพิ่ม relation เพื่อดึงข้อมูล bed ที่ผู้ป่วยนอน
    });
    return this.patientsRepository.find({
      relations: ['bed'], // เพิ่ม relation เพื่อดึงข้อมูล bed ที่ผู้ป่วยนอน
    });
  }

  async getPatientsBySiteID(site_id: number): Promise<Patient[]> {
    // console.log('Fetching patients for site_id:', site_id);
    // console.log('Fetching patients for site_id:', site_id);
    return await this.patientsRepository.find({
      where: { site_id },
      // relations: ['sensors'],
    });
  }

  async getPatientByID(patient_id: number): Promise<Patient | null> {
    const patient = await this.patientsRepository.findOneBy({
      patient_id: patient_id,
    });

    if (!patient) {
      throw new Error(`User with id ${patient_id} not found`);
    }

    // if (patient.image) {
    //   const baseUrl =
    //     this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
    //   patient.image = `${baseUrl}${patient.image}`;
    // }

    return patient;
  }

  async updatePatient(id: number, updatePatientDto: UpdatePatientDto) {
    const { sensor_id, ...patientData } = updatePatientDto;
    // อัปเดตเฉพาะข้อมูล patient
    const result = await this.patientsRepository.update(id, patientData);
    const sensor = await this.sensorRepository.findOneByID(sensor_id || 0);
    // ถ้ามีการส่ง sensors มา
    if (sensor) {
      // หา patient instance ตัวจริงสำหรับใช้ผูก
      const patient = await this.patientsRepository.findOneBy({
        patient_id: id,
      });
      // ผูกเซนเซอร์ใหม่
      await this.sensorRepository.update(sensor.id, {
        patient_id: patient?.patient_id || null,
        patient: patient!,
      });
    }
    await this.mqttService.reloadSensorSubscriptions(); // รีโหลด MQTT
    return result;
  }

  // async updatePatient(id: number, updatePatientDto: UpdatePatientDto) {
  //   await this.mqttService.reloadSensorSubscriptions(); // ต้องมีบรรทัดนี้
  //   return this.patientsRepository.update(id, updatePatientDto);
  // }

  async deletePatient(patient_id: number): Promise<void> {
    const patient = await this.patientsRepository.findOneBy({ patient_id });
    if (!patient) {
      throw new NotFoundException(`Patient with id ${patient_id} not found`);
    }

    if (patient.image) {
      // 🔹 รองรับทั้ง path เก่าและใหม่
      const relativePath = patient.image.replace('/uploads/', '');
      let imagePath: string;

      if (relativePath.startsWith('patient/')) {
        // ไฟล์ใหม่ในโฟลเดอร์ patient
        imagePath = path.join(__dirname, '../../uploads', relativePath);
      } else {
        // ไฟล์เก่าใน root uploads
        imagePath = path.join(__dirname, '../../uploads', relativePath);
      }

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // ลบ notification settings ของ patient
    try {
      await this.notificationSettingService.removeByPatientId(patient_id);
    } catch (error) {
      console.error('❌ Error removing notification settings:', error);
    }

    await this.patientsRepository.remove(patient);
  }

  async updatePatientImage(patient_id: number, imagePath: string) {
    const patient = await this.patientsRepository.findOneBy({
      patient_id: patient_id,
    });

    if (!patient) {
      throw new NotFoundException(`❌ Patient with id ${patient_id} not found`);
    }

    // 🔹 ลบรูปเก่า (ถ้ามี)
    if (patient.image) {
      this.deleteOldImage(patient.image);
    }

    // 🔹 อัปเดตรูปใหม่ในฐานข้อมูล
    await this.patientsRepository.update(patient_id, { image: imagePath });

    const updatedPatient = await this.patientsRepository.findOneBy({
      patient_id: patient_id,
    });

    return updatedPatient;
  }

  deleteOldImage(oldImagePath: string) {
    if (!oldImagePath) return;

    // 🔹 รองรับทั้ง path เก่าและใหม่
    const relativePath = oldImagePath.replace('/uploads/', '');
    let imagePath: string;

    if (relativePath.startsWith('patient/')) {
      // ไฟล์ใหม่ในโฟลเดอร์ patient
      imagePath = path.join(__dirname, '../../uploads', relativePath);
    } else {
      // ไฟล์เก่าใน root uploads - ใช้ basename เพื่อความปลอดภัย
      imagePath = path.join(
        __dirname,
        '../../uploads',
        path.basename(oldImagePath),
      );
    }

    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('❌ Error deleting old image:', err);
        });
      }
    });
  }

  findAllPatientActiveCase() {
    // Query patients via bed.patient_id (only patients that are assigned to beds)
    return this.patientsRepository
      .createQueryBuilder('patient')
      .leftJoinAndSelect('patient.bed', 'bed')
      .where('bed.patient_id = patient.patient_id')
      .andWhere('patient.status = :status', { status: 1 })
      .getMany();
  }

  // Helper method to get patient with bed information
  async findPatientWithBed(patientId: number): Promise<any> {
    return this.patientsRepository
      .createQueryBuilder('patient')
      .innerJoin('bed', 'bed', 'bed.patient_id = patient.patient_id')
      .select([
        'patient.*',
        'bed.bed_id as bed_id',
        'bed.department_building_id',
      ])
      .where('patient.patient_id = :patientId', { patientId })
      .andWhere('patient.status = :status', { status: 1 })
      .getRawOne();
  }
}
