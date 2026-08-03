import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from 'src/user/entities/user.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Bed } from 'src/bed/entities/bed.entity';
import { NotificationHistory } from 'src/bed/entities/notification-history.entity';
import { HistoryNotification } from 'src/history_notification/entities/history_notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Patient,
      Bed,
      NotificationHistory,
      HistoryNotification, // ✅ เพิ่มตรงนี้
    ]),
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
