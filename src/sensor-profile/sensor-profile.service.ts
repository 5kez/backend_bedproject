import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorProfile } from './entities/sensor-profile.entity';
import { CreateSensorProfileDto } from './dto/create-sensor-profile.dto';
import { UpdateSensorProfileDto } from './dto/update-sensor-profile.dto';

@Injectable()
export class SensorProfileService {
  constructor(
    @InjectRepository(SensorProfile)
    private readonly sensorProfileRepository: Repository<SensorProfile>,
  ) {}

  findAll() {
    return this.sensorProfileRepository.find();
  }

  findOneByID(id: number) {
    return this.sensorProfileRepository.findOneBy({ id });
  }

  async findBySensorId(sensorId: number): Promise<SensorProfile | null> {
    return this.sensorProfileRepository.findOne({
      where: { sensor: { id: sensorId } },
      relations: ['sensor', 'sensor.patient'],
    });
  }

  async create(createDto: CreateSensorProfileDto): Promise<SensorProfile> {
    const newSensor = this.sensorProfileRepository.create({
      ...createDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log(newSensor);
    return this.sensorProfileRepository.save(newSensor);
  }

  async update(
    id: number,
    updateDto: UpdateSensorProfileDto,
  ): Promise<SensorProfile> {
    const profile = await this.sensorProfileRepository.findOneBy({ id });
    if (!profile) throw new NotFoundException('Sensor not found');

    const updated = this.sensorProfileRepository.merge(profile, {
      ...updateDto,
      updated_at: new Date(),
    });
    return this.sensorProfileRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.sensorProfileRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException('Sensor not found');
    await this.sensorProfileRepository.remove(sensor);
  }
}
