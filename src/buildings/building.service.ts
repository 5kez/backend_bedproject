import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';

@Injectable()
export class BuildingService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  async create(dto: CreateBuildingDto) {
    const building = this.buildingRepository.create(dto);
    return this.buildingRepository.save(building);
  }

  findAll() {
    return this.buildingRepository.find();
  }

  async findBySiteId(id: number) {
    const building = await this.buildingRepository.find({
      where: { site_id: id },
    });
    if (!building) throw new NotFoundException(`Building #${id} not found`);
    return building;
  }

  async findOne(id: number) {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building) throw new NotFoundException(`Building #${id} not found`);
    return building;
  }

  async update(id: number, dto: UpdateBuildingDto) {
    await this.buildingRepository.update(id, dto);
    const updated = await this.findOne(id);
    return updated;
  }

  async remove(id: number) {
    const result = await this.buildingRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Building #${id} not found`);
  }
}
