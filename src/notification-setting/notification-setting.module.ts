import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettingService } from './notification-setting.service';
import { NotificationSettingController } from './notification-setting.controller';
import { NotificationSetting } from './entities/notification-setting.entity';
import { SensorType } from '../sensor-type/entities/sensor-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationSetting, SensorType])],
  controllers: [NotificationSettingController],
  providers: [NotificationSettingService],
  exports: [NotificationSettingService],
})
export class NotificationSettingModule {}
