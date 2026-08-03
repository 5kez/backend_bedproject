import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorTemplate } from './entities/sensor-template.entity';
import { CreateSensorTemplateDto } from './dto/create-sensor-template.dto';
import { UpdateSensorTemplateDto } from './dto/update-sensor-template.dto';

@Injectable()
export class SensorTemplateService {
  constructor(
    @InjectRepository(SensorTemplate)
    private readonly sensorTemplateRepository: Repository<SensorTemplate>,
  ) {}

  findAll() {
    return this.sensorTemplateRepository.find();
  }

  findOneByID(id: number) {
    return this.sensorTemplateRepository.findOneBy({ id });
  }

  async create(createDto: CreateSensorTemplateDto): Promise<SensorTemplate> {
    const newSensor = this.sensorTemplateRepository.create({
      ...createDto,
      created_at: new Date(),
      updated_at: new Date(),
    });
    console.log(newSensor);
    return this.sensorTemplateRepository.save(newSensor);
  }

  async update(
    id: number,
    updateDto: UpdateSensorTemplateDto,
  ): Promise<SensorTemplate> {
    const profile = await this.sensorTemplateRepository.findOneBy({ id });
    if (!profile) throw new NotFoundException('Sensor not found');

    const updated = this.sensorTemplateRepository.merge(profile, {
      ...updateDto,
      updated_at: new Date(),
    });
    return this.sensorTemplateRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const sensor = await this.sensorTemplateRepository.findOneBy({ id });
    if (!sensor) throw new NotFoundException('Sensor not found');
    await this.sensorTemplateRepository.remove(sensor);
  }
}
