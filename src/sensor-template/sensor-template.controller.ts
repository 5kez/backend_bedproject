import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SensorTemplateService } from './sensor-templateservice';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { CreateSensorTemplateDto } from './dto/create-sensor-template.dto';
import { SensorTemplate } from './entities/sensor-template.entity';
import { UpdateSensorTemplateDto } from './dto/update-sensor-template.dto';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('sensor-templates')
export class SensorTemplateController {
  constructor(private readonly sensorTemplateService: SensorTemplateService) {}

  @Get()
  findAll() {
    return this.sensorTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorTemplateService.findOneByID(+id);
  }

  @Post()
  async create(
    @Body() createSensorTemplateDto: CreateSensorTemplateDto,
  ): Promise<SensorTemplate> {
    return await this.sensorTemplateService.create(createSensorTemplateDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSensorTemplateDto,
  ): Promise<SensorTemplate> {
    return await this.sensorTemplateService.update(+id, updateDto);
  }

  @Delete('bySensor/:id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.sensorTemplateService.remove(+id);
  }
}
