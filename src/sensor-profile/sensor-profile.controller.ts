import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SensorProfileService } from './sensor-profile.service';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';
import { CreateSensorProfileDto } from './dto/create-sensor-profile.dto';
import { SensorProfile } from './entities/sensor-profile.entity';
import { UpdateSensorProfileDto } from './dto/update-sensor-profile.dto';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('sensor-profile')
export class SensorProfileController {
  constructor(private readonly sensorProfileService: SensorProfileService) {}

  @Get()
  findAll() {
    return this.sensorProfileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sensorProfileService.findOneByID(+id);
  }

  @Get('bySensor/:sensorId')
  getBySensorId(@Param('sensorId') sensorId: number) {
    return this.sensorProfileService.findBySensorId(sensorId);
  }

  @Post()
  async create(
    @Body() createSensorProfileDto: CreateSensorProfileDto,
  ): Promise<SensorProfile> {
    return await this.sensorProfileService.create(createSensorProfileDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSensorProfileDto,
  ): Promise<SensorProfile> {
    return await this.sensorProfileService.update(+id, updateDto);
  }

  @Delete('bySensor/:id')
  async remove(@Param('id') id: string): Promise<void> {
    return await this.sensorProfileService.remove(+id);
  }
}
