import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PatientGateway } from './patient.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { MqttModule } from '../mqtt/mqtt.module';
import { NotificationSettingModule } from '../notification-setting/notification-setting.module';
import { NotificationModule } from '../notification/notification.module';
import { SensorsService } from 'src/sensor/sensor.service';
import { SensorsModule } from 'src/sensor/sensor.module';
import { Building } from 'src/buildings/entities/building.entity';
import { PatientHistoryModule } from 'src/patient-history/patient-history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient, Building]),
    MqttModule,
    NotificationSettingModule,
    NotificationModule,
    SensorsModule,
    PatientHistoryModule,
  ],
  controllers: [PatientController],
  providers: [PatientService, PatientGateway, SensorsService],
  exports: [PatientService, TypeOrmModule],
})
export class PatientModule {}
