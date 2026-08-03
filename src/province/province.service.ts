import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';

@Injectable()
export class ProvinceService {
  constructor(
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
  ) {}

  create(dto: CreateProvinceDto): Promise<Province> {
    const newProvince = this.provinceRepo.create(dto);
    return this.provinceRepo.save(newProvince);
  }

  findAll(): Promise<Province[]> {
    return this.provinceRepo.find();
  }

  async findOne(id: number): Promise<Province> {
    const province = await this.provinceRepo.findOne({ where: { id } });
    if (!province) {
      throw new NotFoundException(`Province with id ${id} not found`);
    }
    return province;
  }

  async update(id: number, dto: UpdateProvinceDto): Promise<Province> {
    await this.provinceRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.provinceRepo.delete(id);
  }
}
