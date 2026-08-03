import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    private readonly configService: ConfigService,
  ) {}

  create(createProfileDto: CreateProfileDto) {
    const profile = this.profilesRepository.create(createProfileDto);
    return this.profilesRepository.save(profile);
  }

  findAll() {
    return this.profilesRepository.find();
  }

  async findOne(id: number) {
    const pro = await this.profilesRepository.findOne({ where: { id: id } });
    if (!pro) throw new NotFoundException(`Floor ${id} not found`);
    return pro;
  }

  async update(id: number, updateProvinceDto: UpdateProfileDto) {
    await this.profilesRepository.update(id, updateProvinceDto);
    const updated = await this.findOne(id);
    return updated;
  }

  async remove(id: number) {
    const result = await this.profilesRepository.delete(id);
    if (result.affected === 0)
      throw new NotFoundException(`Floor ${id} not found`);
  }

  async getProfileByID(id: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOneBy({ id: id });
    console.log('Finding profile with ID:', id);
    console.log('Profile:', profile);

    if (!profile) {
      throw new Error(`User with id ${id} not found`);
    }

    if (profile.photo && !profile.photo.startsWith('http')) {
      const baseUrl =
        this.configService.get<string>('BASE_URL') ?? 'http://localhost:3000';
      profile.photo = `${baseUrl}${profile.photo}`;
    }

    return profile;
  }

  async deleteProfile(id: number): Promise<void> {
    const profile = await this.profilesRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException(`Profile with id ${id} not found`);
    }

    // ✅ ตรวจสอบว่ามีรูปไหม และลบออกจากเซิร์ฟเวอร์
    if (profile.photo) {
      const imagePath = path.join(
        __dirname,
        '../../uploads/profile',
        profile.photo.replace('/uploads/profile', ''),
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  }

  async updateProfileImage(id: number, imagePath: string) {
    const profile = await this.profilesRepository.findOneBy({ id: id });

    if (!profile) {
      throw new NotFoundException(`❌ Profile with id ${id} not found`);
    }

    // 🔹 ลบรูปเก่า (ถ้ามี)
    if (profile.photo) {
      this.deleteOldImage(profile.photo);
    }

    // 🔹 อัปเดตรูปใหม่ในฐานข้อมูล
    await this.profilesRepository.update(id, { photo: imagePath });

    const updatedProfile = await this.profilesRepository.findOneBy({
      id: id,
    });

    return updatedProfile;
  }

  deleteOldImage(oldImagePath: string) {
    if (!oldImagePath) return;

    const imagePath = path.join(
      __dirname,
      '../../uploads/profile',
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
