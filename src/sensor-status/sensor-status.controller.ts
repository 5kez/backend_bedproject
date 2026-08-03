import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { SensorStatusService } from './sensor-status.service';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { CreateSensorStatusDto } from './dto/create-sensor-status.dto';
import { MasterStatus } from './entities/sensor-status.entity';
import { UpdateSensorStatusDto } from './dto/update-sensor-status.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import * as fs from 'fs';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('master-status')
export class SensorStatusController {
  constructor(private readonly sensorStatusService: SensorStatusService) {}

  @Get()
  findAll() {
    return this.sensorStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorStatusService.findOneByID(+id);
  }

  @Post()
  async create(
    @Body() createSensorStatusDto: CreateSensorStatusDto,
  ): Promise<MasterStatus> {
    return await this.sensorStatusService.create(createSensorStatusDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSensorStatusDto,
  ): Promise<MasterStatus> {
    return await this.sensorStatusService.update(+id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.sensorStatusService.remove(+id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // 🔹 เก็บใน RAM แทนการเขียนลงดิสก์
    }),
  )
  @ApiOperation({ summary: 'Upload sensor image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        statusId: { type: 'number', example: 1 },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('statusId') statusId?: number,
  ) {
    if (!file) {
      throw new Error('❌ No file uploaded');
    }

    // 🔹 สร้างชื่อไฟล์ใหม่
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;

    // 🔹 สร้างโฟลเดอร์ sensor ถ้าไม่มี
    const sensorDir = './uploads/sensor';
    if (!fs.existsSync(sensorDir)) {
      fs.mkdirSync(sensorDir, { recursive: true });
    }

    // 🔹 เขียนไฟล์จาก memory buffer ลงดิสก์
    const finalFilePath = `/uploads/sensor/${filename}`;
    fs.writeFileSync(`./uploads/sensor/${filename}`, file.buffer);

    // 🔹 ถ้ามี statusId ให้อัพเดท database ด้วย
    if (statusId) {
      await this.sensorStatusService.updateSensorImage(statusId, finalFilePath);
    }

    return { imageUrl: finalFilePath };
  }
}
