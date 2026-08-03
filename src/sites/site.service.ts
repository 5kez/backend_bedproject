import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './entities/site.entity';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Site)
    private readonly siteRepository: Repository<Site>,
  ) {}

  async create(createSiteDto: CreateSiteDto): Promise<Site> {
    const site = this.siteRepository.create(createSiteDto);
    return this.siteRepository.save(site);
  }

  async findAll(): Promise<Site[]> {
    return this.siteRepository.find({
      relations: {
        buildings: {
          floors: true,
        },
      },
    });
  }

  async findOne(id: number): Promise<Site> {
    const site = await this.siteRepository.findOne({
      where: { id },
      relations: {
        buildings: {
          floors: true,
        },
      },
    });

    if (!site) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }
    return site;
  }

  async update(id: number, updateSiteDto: UpdateSiteDto): Promise<Site> {
    await this.siteRepository.update(id, updateSiteDto);
    const updated = await this.siteRepository.findOne({
      where: { id },
      relations: {
        buildings: {
          floors: true,
        },
      },
    });
    if (!updated) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    const result = await this.siteRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Site with id ${id} not found`);
    }
  }

  async updateSiteImage(status_id: number, imagePath: string) {
    const status = await this.siteRepository.findOneBy({
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
    await this.siteRepository.update(status_id, {
      name_img: imagePath,
    });

    const updatedPatient = await this.siteRepository.findOneBy({
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
