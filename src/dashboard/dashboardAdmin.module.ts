import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminDashboardController } from './dashboardAdmin.controller';
import { AdminDashboardService } from './dashboardAdmin.service';

import { Sensor } from 'src/sensor/entities/sensor.entity';
import { User } from 'src/user/entities/user.entity';
import { HistoryNotification } from 'src/history_notification/entities/history_notification.entity';
import { Patient } from 'src/patient/entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, User, HistoryNotification, Patient]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminDashboardService],
  exports: [AdminDashboardService],
})
export class AdminDashboardModule {}
