import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '../sensor/entities/sensor.entity';
import { Patient } from '../patient/entities/patient.entity';
import { MqttService } from './mqtt.service';
import { MqttController } from './mqtt.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor, Patient])],
  controllers: [MqttController],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
