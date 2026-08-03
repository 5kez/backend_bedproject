import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import * as fs from 'fs';

@Controller('Profile')
export class ProfileController {
  constructor(private readonly ProfileService: ProfileService) {}

  @Post()
  async create(@Body() createProfileDto: CreateProfileDto) {
    return await this.ProfileService.create(createProfileDto);
  }

  @Get()
  async findAll() {
    return await this.ProfileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    console.log('Finding profile with ID:', id);
    return await this.ProfileService.getProfileByID(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() UpdateProfileDto: UpdateProfileDto,
  ) {
    return await this.ProfileService.update(id, UpdateProfileDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return await this.ProfileService.deleteProfile(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // 🔹 เก็บใน RAM แทนการเขียนลงดิสก์
    }),
  )
  @ApiOperation({ summary: 'Upload Profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('id') id?: number,
  ) {
    if (!file) {
      throw new Error('❌ No file uploaded');
    }

    // 🔹 สร้างชื่อไฟล์ใหม่
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;

    // 🔹 สร้างโฟลเดอร์ profile ถ้าไม่มี
    const profileDir = './uploads/profile';
    if (!fs.existsSync(profileDir)) {
      fs.mkdirSync(profileDir, { recursive: true });
    }

    // 🔹 เขียนไฟล์จาก memory buffer ลงดิสก์
    const finalFilePath = `/uploads/profile/${filename}`;
    fs.writeFileSync(`./uploads/profile/${filename}`, file.buffer);

    // 🔹 ถ้ามี id ให้อัพเดท database ด้วย
    if (id) {
      await this.ProfileService.updateProfileImage(id, finalFilePath);
    }

    return { imageUrl: finalFilePath };
  }
}
