import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentBuilding } from './entities/department-building.entity';
import { CreateDepartmentBuildingDto } from './dto/create-department-building.dto';
import { UpdateDepartmentBuildingDto } from './dto/update-department-building.dto';

@Injectable()
export class DepartmentBuildingService {
  constructor(
    @InjectRepository(DepartmentBuilding)
    private readonly repo: Repository<DepartmentBuilding>,
  ) {}

  create(dto: CreateDepartmentBuildingDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item)
      throw new NotFoundException(`DepartmentBuilding #${id} not found`);
    return item;
  }

  //   async findBySite(site_id: number) {
  //   const item = await this.repo.findOne({ where: { building:site_id } });
  //   if (!item)
  //     throw new NotFoundException(`DepartmentBuilding #${id} not found`);
  //   return item;
  // }

  async update(id: number, dto: UpdateDepartmentBuildingDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`DepartmentBuilding #${id} not found`);
  }
}
