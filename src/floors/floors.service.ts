import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Floor } from './entities/floor.entity';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';

@Injectable()
export class FloorsService {
  constructor(
    @InjectRepository(Floor)
    private readonly floorRepo: Repository<Floor>,
  ) {}

  create(createFloorDto: CreateFloorDto) {
    const floor = this.floorRepo.create({
      floor_name: createFloorDto.floor_name,
      floor_name_en: createFloorDto.floor_name_en,
      remark: createFloorDto.remark,
      building: { id: createFloorDto.building_id },
    });
    return this.floorRepo.save(floor);
  }

  findAll() {
    return this.floorRepo.find({ relations: ['building'] });
  }

  async findOne(id: number) {
    const floor = await this.floorRepo.findOne({
      where: { id },
      relations: ['building'],
    });
    if (!floor) throw new NotFoundException(`Floor ${id} not found`);
    return floor;
  }

  async update(id: number, updateFloorDto: UpdateFloorDto) {
    const { building_id, ...rest } = updateFloorDto;
    const updateData: QueryDeepPartialEntity<Floor> = { ...rest };

    if (building_id !== undefined) {
      updateData.building = { id: building_id };
    }

    await this.floorRepo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.floorRepo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Floor ${id} not found`);
  }
}
