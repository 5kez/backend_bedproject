import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterStatus } from './entities/sensor-status.entity';
import { CreateSensorStatusDto } from './dto/create-sensor-status.dto';
import { UpdateSensorStatusDto } from './dto/update-sensor-status.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SensorStatusService {
  constructor(
    @InjectRepository(MasterStatus)
    private readonly sensorStatusRepository: Repository<MasterStatus>,
  ) {}

  findAll() {
    return this.sensorStatusRepository.find();
  }

  findOneByID(id: number) {
    return this.sensorStatusRepository.findOneBy({ id });
  }

  async create(createDto: CreateSensorStatusDto): Promise<MasterStatus> {
    const newSensor = this.sensorStatusRepository.create({
      ...createDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log(newSensor);
    return this.sensorStatusRepository.save(newSensor);
  }

  async update(
    id: number,
    updateDto: UpdateSensorStatusDto,
  ): Promise<MasterStatus> {
    const sensor = await this.sensorStatusRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException('Sensor not found');

    const updated = this.sensorStatusRepository.merge(sensor, {
      ...updateDto,
      updated_at: new Date(),
    });

    return this.sensorStatusRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.sensorStatusRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException('Sensor not found');

    if (sensor.name_img) {
      const imagePath = path.join(
        __dirname,
        '../../uploads',
        sensor.name_img.replace('/uploads/', ''),
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await this.sensorStatusRepository.remove(sensor);
  }

  async updateSensorImage(status_id: number, imagePath: string) {
    const status = await this.sensorStatusRepository.findOneBy({
      id: status_id,
    });

    if (!status) {
      throw new NotFoundException(`❌ Patient with id ${status_id} not found`);
    }

    // 🔹 ลบรูปเก่า (ถ้ามี)
    if (status.name_img) {
      this.deleteOldImage(status.name_img);
    }

    // 🔹 อัปเดตรูปใหม่ในฐานข้อมูล
    await this.sensorStatusRepository.update(status_id, {
      name_img: imagePath,
    });

    const updatedPatient = await this.sensorStatusRepository.findOneBy({
      id: status_id,
    });

    return updatedPatient;
  }

  deleteOldImage(oldImagePath: string) {
    if (!oldImagePath) return;
    const imagePath = path.join(
      __dirname,
      '../../uploads',
      path.basename(oldImagePath),
    );

    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('❌ Error deleting old image:', err);
        });
      }
    });
  }
}
