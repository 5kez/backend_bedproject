import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorType } from './entities/sensor-type.entity';
import { CreateSensorTypeDto } from './dto/create-sensor-type.dto';
import { UpdateSensorTypeDto } from './dto/update-sensor-type.dto';

@Injectable()
export class SensorTypeService {
  constructor(
    @InjectRepository(SensorType)
    private readonly sensorTypeRepository: Repository<SensorType>,
  ) {}

  create(dto: CreateSensorTypeDto) {
    return this.sensorTypeRepository.save(dto);
  }

  findAll() {
    return this.sensorTypeRepository.find();
  }

  findOne(id: number) {
    return this.sensorTypeRepository.findOneBy({ id });
  }

  update(id: number, dto: UpdateSensorTypeDto) {
    return this.sensorTypeRepository.update(id, dto);
  }

  remove(id: number) {
    return this.sensorTypeRepository.delete(id);
  }
}
