import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { NotificationSettingService } from './notification-setting.service';
import { CreateNotificationSettingDto } from './dto/create-notification-setting.dto';
import { UpdateNotificationSettingDto } from './dto/update-notification-setting.dto';

@Controller('notification-setting')
export class NotificationSettingController {
  constructor(
    private readonly notificationSettingService: NotificationSettingService,
  ) {}

  @Post()
  create(@Body() createNotificationSettingDto: CreateNotificationSettingDto) {
    return this.notificationSettingService.create(createNotificationSettingDto);
  }

  @Get()
  findAll() {
    return this.notificationSettingService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.notificationSettingService.findOne(id);
    if (!result) {
      throw new NotFoundException(
        `Notification setting with id ${id} not found`,
      );
    }
    return result;
  }

  @Get('department/:department_id')
  findByDepartment(
    @Param('department_id', ParseIntPipe) department_id: number,
  ) {
    return this.notificationSettingService.findByDepartment(department_id);
  }

  @Get('patient/:patient_id')
  findByPatientId(@Param('patient_id', ParseIntPipe) patient_id: number) {
    return this.notificationSettingService.findByPatientId(patient_id);
  }

  @Get('patient/:patient_id/sensor-type/:sensor_type_id')
  async findByPatientAndSensorType(
    @Param('patient_id', ParseIntPipe) patient_id: number,
    @Param('sensor_type_id', ParseIntPipe) sensor_type_id: number,
  ) {
    const result =
      await this.notificationSettingService.findByPatientAndSensorType(
        patient_id,
        sensor_type_id,
      );
    if (!result) {
      throw new NotFoundException(
        `Notification setting for patient ${patient_id} and sensor type ${sensor_type_id} not found`,
      );
    }
    return result;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationSettingDto: UpdateNotificationSettingDto,
  ) {
    return this.notificationSettingService.update(
      id,
      updateNotificationSettingDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationSettingService.remove(id);
  }
}
