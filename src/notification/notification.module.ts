import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationSettingModule } from '../notification-setting/notification-setting.module';
import { HistoryNotificationModule } from '../history_notification/history_notification.module';

@Module({
  imports: [NotificationSettingModule, HistoryNotificationModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
