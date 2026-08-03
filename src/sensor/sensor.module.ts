import { Module } from '@nestjs/common';
import { SensorsController } from './sensor.controller';
import { SensorsService } from './sensor.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './entities/sensor.entity';
import { SensorProfile } from 'src/sensor-profile/entities/sensor-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor, SensorProfile])],
  providers: [SensorsService],
  controllers: [SensorsController],
  exports: [SensorsService, TypeOrmModule],
})
export class SensorsModule {}
