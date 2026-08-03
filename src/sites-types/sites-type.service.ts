import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitesType } from './entities/sites-type.entity';
import { CreateSitesTypeDto } from './dto/create-sites-type.dto';
import { UpdateSitesTypeDto } from './dto/update-sites-type.dto';

@Injectable()
export class SitesTypeService {
  constructor(
    @InjectRepository(SitesType)
    private readonly repo: Repository<SitesType>,
  ) {}

  create(dto: CreateSitesTypeDto) {
    const item = this.repo.create(dto);
    return this.repo.save(item);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`SitesType #${id} not found`);
    return item;
  }

  async update(id: number, dto: UpdateSitesTypeDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.repo.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`SitesType #${id} not found`);
  }
}
