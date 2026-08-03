import { Module } from '@nestjs/common';
import { SensorProfileController } from './sensor-profile.controller';
import { SensorProfileService } from './sensor-profile.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  PoseSensorConfigDto,
  PoseSettingDto,
  SensorProfile,
} from './entities/sensor-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SensorProfile,
      PoseSettingDto,
      PoseSensorConfigDto,
    ]),
  ],
  providers: [SensorProfileService],
  controllers: [SensorProfileController],
  exports: [SensorProfileService, TypeOrmModule],
})
export class SensorProfileModule {}
