import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed)
    private readonly repo: Repository<Bed>,
  ) {}

  create(dto: CreateBedDto) {
    const bed = this.repo.create(dto);
    return this.repo.save(bed);
  }

  findAll() {
    return this.repo.find({
      relations: [
        'departmentBuilding',
        'departmentBuilding.department',
        'departmentBuilding.building',
        'departmentBuilding.floor',
        'sensors',
      ],
    });
  }

  findByDepartment(departmentId: number) {
    return this.repo.find({
      where: {
        departmentBuilding: {
          department: {
            id: departmentId,
          },
        },
      },
      relations: [
        'departmentBuilding',
        'departmentBuilding.department',
        'departmentBuilding.building',
        'departmentBuilding.floor',
        'sensors',
      ],
    });
  }

  async findOne(id: number) {
    const bed = await this.repo.findOne({
      where: { bed_id: id },
      relations: [
        'departmentBuilding',
        'departmentBuilding.department',
        'departmentBuilding.building',
        'departmentBuilding.floor',
        'sensors',
      ],
    });
    if (!bed) throw new NotFoundException(`Bed #${id} not found`);
    return bed;
  }

  async update(id: number, dto: UpdateBedDto) {
    await this.repo.update({ bed_id: id }, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Bed #${id} not found`);
  }
}
