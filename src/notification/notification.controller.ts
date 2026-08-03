import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { NotificationService, NotificationItem } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateSensorAlertDto } from './dto/create-sensor-alert.dto';
import { NotificationStatus } from './entities/notification.entity';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): NotificationItem {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll(@Query('status') status?: NotificationStatus): NotificationItem[] {
    if (status) {
      return this.notificationService.findByStatus(status);
    }
    return this.notificationService.findAll();
  }

  @Get('department/:department_id')
  findByDepartment(
    @Param('department_id', ParseIntPipe) department_id: number,
    @Query('status') status?: NotificationStatus,
  ): NotificationItem[] {
    return this.notificationService.findByDepartment(department_id, status);
  }

  @Post('test/:department_id')
  createTestNotification(
    @Param('department_id', ParseIntPipe) department_id: number,
  ): NotificationItem[] {
    return this.notificationService.createTestNotification(department_id);
  }

  @Post('sensor-alert')
  async createSensorAlert(
    @Body() sensorAlertDto: CreateSensorAlertDto,
  ): Promise<NotificationItem | null> {
    return this.notificationService.createSensorAlert(
      sensorAlertDto.patient_id,
      sensorAlertDto.patient_name,
      sensorAlertDto.sensor_type_id,
      sensorAlertDto.sensor_type_name,
      sensorAlertDto.alertType,
      sensorAlertDto.sensorValue,
      sensorAlertDto.threshold,
      sensorAlertDto.user_id,
    );
  }

  @Get('count/unread')
  getUnreadCount(@Query('user_id') user_id?: number) {
    return this.notificationService.getUnreadCount(user_id);
  }

  @Get('patient/:patient_id')
  findByPatientId(@Param('patient_id', ParseIntPipe) patient_id: number) {
    return this.notificationService.findByPatientId(patient_id);
  }

  @Get('user/:user_id')
  findByUserId(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.notificationService.findByUserId(user_id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const result = this.notificationService.findOne(id);
    if (!result) {
      throw new NotFoundException(`Notification with id ${id} not found`);
    }
    return result;
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('read/bulk')
  markAsReadBulk(@Body('ids') ids: number[]) {
    return this.notificationService.markAsReadByIds(ids);
  }

  @Patch('read/all')
  markAllAsRead(@Query('user_id') user_id?: number) {
    return this.notificationService.markAllAsRead(user_id);
  }

  @Patch(':id/dismiss')
  dismiss(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.dismiss(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationService.remove(id);
  }

  @Get('memory/info')
  getMemoryInfo() {
    return this.notificationService.getMemoryInfo();
  }

  @Delete('memory/cleanup')
  clearOldNotifications(@Query('hours') hours?: number) {
    this.notificationService.clearOldNotifications(hours ? Number(hours) : 24);
    return { message: 'Old notifications cleared successfully' };
  }

  @Post(':id/confirm')
  async confirmNotification(
    @Param('id', ParseIntPipe) id: number,
    @Body('user_id') user_id?: number,
  ) {
    return this.notificationService.confirmNotification(id, user_id);
  }

  @Post('confirm/bulk')
  async confirmNotificationsBulk(
    @Body('ids') ids: number[],
    @Body('user_id') user_id?: number,
  ) {
    return this.notificationService.confirmNotificationsBulk(ids, user_id);
  }
}
