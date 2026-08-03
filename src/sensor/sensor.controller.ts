import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SensorsService } from './sensor.service';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { Sensor } from './entities/sensor.entity';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  findAll() {
    return this.sensorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorsService.findOneByID(+id);
  }
  @Get('site/:siteId')
  findBySite(@Param('siteId') siteId: string) {
    return this.sensorsService.findBySite(+siteId);
  }

  @Post()
  async create(@Body() createSensorDto: CreateSensorDto): Promise<Sensor> {
    return await this.sensorsService.create(createSensorDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSensorDto,
  ): Promise<Sensor> {
    return await this.sensorsService.update(+id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.sensorsService.remove(+id);
  }

  // ผูก sensor กับเตียง
  @Post(':id/assign-bed/:bedId')
  async assignToBed(
    @Param('id') sensorId: string,
    @Param('bedId') bedId: string,
  ) {
    return await this.sensorsService.assignToBed(+sensorId, +bedId);
  }

  // ลบการผูก sensor กับเตียง
  @Post(':id/remove-from-bed')
  async removeFromBed(@Param('id') id: string) {
    return await this.sensorsService.removeFromBed(+id);
  }

  // หา sensor ทั้งหมดของเตียง
  @Get('bed/:bedId')
  async findByBed(@Param('bedId') bedId: string) {
    return await this.sensorsService.findByBed(+bedId);
  }

  // หา sensor ที่ว่าง (ไม่ได้ผูกกับเตียงใด)
  @Get('available/list')
  async findAvailableSensors() {
    return await this.sensorsService.findAvailableSensors();
  }

  @Get('check/:mac')
  async checkMac(@Param('mac') mac: string) {
    return await this.sensorsService.checkMac(mac);
  }
}
