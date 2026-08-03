import { Module } from '@nestjs/common';
import { SensorStatusController } from './sensor-status.controller';
import { SensorStatusService } from './sensor-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterStatus } from './entities/sensor-status.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterStatus])],
  providers: [SensorStatusService],
  controllers: [SensorStatusController],
  exports: [SensorStatusService, TypeOrmModule],
})
export class SensorStatusModule {}
