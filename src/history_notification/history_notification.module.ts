import { Module } from '@nestjs/common';
import { HistoryNotificationService } from './history_notification.service';
import { HistoryNotificationController } from './history_notification.controller';
import { HistoryNotification } from './entities/history_notification.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Patient } from 'src/patient/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryNotification, Patient])],
  controllers: [HistoryNotificationController],
  providers: [HistoryNotificationService],
  exports: [HistoryNotificationService, TypeOrmModule],
})
export class HistoryNotificationModule {}
