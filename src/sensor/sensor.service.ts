import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Sensor } from './entities/sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { SensorProfile } from 'src/sensor-profile/entities/sensor-profile.entity';
import { SensorProfileConfig } from 'src/sensor-profile/interface/sensor-profile.interface';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    @InjectRepository(SensorProfile)
    private profileRepository: Repository<SensorProfile>,
  ) {}

  async findBySite(siteId: number) {
    const result = await this.sensorRepository.find({
      where: { site_Id: siteId },
    });
    return result;
  }

  async findAll() {
    const result = await this.sensorRepository.find({
      relations: ['bed', 'bed.departmentBuilding'],
    });
    return result;
  }

  findOneByID(id: number) {
    return this.sensorRepository.findOne({
      where: { id },
      relations: ['bed', 'bed.departmentBuilding'],
    });
  }

  async create(createDto: CreateSensorDto): Promise<Sensor> {
    const newSensor = this.sensorRepository.create({
      ...createDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await this.sensorRepository.save(newSensor);
    // const profile = this.profileRepository.create({
    //   sensor: newSensor,
    //   sensorType_Id: newSensor.sensorType_Id,
    //   config: this.getDefaultConfigSensorType(newSensor.sensorType_Id),
    // });
    // newSensor.sensor_profile = profile;
    // // await this.profileRepository.save(profile);
    console.log('Sensor and profile created:', newSensor);
    return newSensor;
  }

  async update(id: number, updateDto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.sensorRepository.findOne({
      where: { id },
    });
    if (!sensor) throw new NotFoundException('Sensor not found');

    const updated = this.sensorRepository.merge(sensor, {
      ...updateDto,
      updated_at: new Date(),
    });
    console.log('Updating sensor:', updated);
    return this.sensorRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.sensorRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException('Sensor not found');
    await this.sensorRepository.remove(sensor);
  }

  // ผูก sensor กับเตียง
  async assignToBed(
    sensorId: number,
    bedId: number,
  ): Promise<{ message: string }> {
    const sensor = await this.sensorRepository.findOne({
      where: { id: sensorId },
      relations: ['bed'],
    });

    if (!sensor) {
      throw new NotFoundException('ไม่พบ sensor');
    }

    // ตรวจสอบว่าเตียงนั้นมี sensor type เดียวกันแล้วหรือไม่
    const existingSensor = await this.sensorRepository.findOne({
      where: {
        bed_id: bedId,
        sensorType_Id: sensor.sensorType_Id,
      },
    });

    if (existingSensor && existingSensor.id !== sensorId) {
      throw new BadRequestException(`เตียงนี้มี sensor type เดียวกันแล้ว`);
    }

    await this.sensorRepository.update(sensorId, { bed_id: bedId });

    return {
      message: `ผูก sensor ID ${sensorId} กับเตียง ID ${bedId} เรียบร้อยแล้ว`,
    };
  }

  // ลบการผูก sensor กับเตียง
  async removeFromBed(sensorId: number): Promise<{ message: string }> {
    const sensor = await this.sensorRepository.findOneBy({ id: sensorId });
    if (!sensor) {
      throw new NotFoundException('ไม่พบ sensor');
    }

    await this.sensorRepository.update(sensorId, { bed_id: null });

    return {
      message: `ลบการผูก sensor ID ${sensorId} กับเตียงเรียบร้อยแล้ว`,
    };
  }

  // หา sensor ทั้งหมดของเตียง
  async findByBed(bedId: number) {
    return this.sensorRepository.find({
      where: { bed_id: bedId },
      relations: ['bed', 'bed.departmentBuilding'],
    });
  }

  // หา sensor ที่ว่าง (ไม่ได้ผูกกับเตียงใด)
  async findAvailableSensors() {
    return this.sensorRepository.find({
      where: { bed_id: IsNull() },
    });
  }

  async checkMac(mac: string) {
    const sensor = await this.sensorRepository.findOneBy({ mac });
    return { exists: !sensor };
  }

  getDefaultConfigSensorType(sensorTypeId: number): SensorProfileConfig {
    switch (sensorTypeId) {
      case 1: // ท่านอน
        return {
          poses: [
            {
              name: 'ไม่อยู่เตียง',
              name_img: 'noimg.png',
              active: false,
              delay: 1,
              repeat: 1,
              sensitivity: 1,
            },
            {
              name: 'นั่ง',
              name_img: 'noimg.png',
              active: false,
              delay: 1,
              repeat: 1,
              sensitivity: 1,
            },
            {
              name: 'นอนซ้าย',
              name_img: 'noimg.png',
              active: false,
              delay: 1,
              repeat: 1,
              sensitivity: 1,
            },
            {
              name: 'นอนกลาง',
              name_img: 'noimg.png',
              active: false,
              delay: 1,
              repeat: 1,
              sensitivity: 1,
            },
            {
              name: 'นอนขวา',
              name_img: 'noimg.png',
              active: false,
              delay: 1,
              repeat: 1,
              sensitivity: 1,
            },
          ],
          globalSensitivity: 5,
        };

      case 2: // heart rate
        return { poses: [], globalSensitivity: 0 };

      default:
        return { poses: [], globalSensitivity: 0 };
    }
  }
}
