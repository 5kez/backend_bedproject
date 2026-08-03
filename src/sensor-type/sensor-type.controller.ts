import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { SensorTypeService } from './sensor-type.service';
import { CreateSensorTypeDto } from './dto/create-sensor-type.dto';
import { UpdateSensorTypeDto } from './dto/update-sensor-type.dto';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('sensor-type')
export class SensorTypeController {
  constructor(private readonly sensorTypeService: SensorTypeService) {}

  @Post()
  create(@Body() dto: CreateSensorTypeDto) {
    return this.sensorTypeService.create(dto);
  }

  @Get()
  findAll() {
    return this.sensorTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorTypeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSensorTypeDto) {
    return this.sensorTypeService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sensorTypeService.remove(+id);
  }
}
