import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorType } from './entities/sensor-type.entity';
import { SensorTypeController } from './sensor-type.controller';
import { SensorTypeService } from './sensor-type.service';

@Module({
  imports: [TypeOrmModule.forFeature([SensorType])],
  controllers: [SensorTypeController],
  providers: [SensorTypeService],
  exports: [SensorTypeService],
})
export class SensorsTypeModule {}
