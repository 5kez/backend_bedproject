import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bed } from './entities/bed.entity';
import { BedAssignment } from './entities/bed-assignment.entity';
import { BedSensor } from './entities/bed-sensor.entity';
import { NotificationHistory } from './entities/notification-history.entity';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { BedAssignmentService } from './services/bed-assignment.service';
import { BedAssignmentController } from './controllers/bed-assignment.controller';
import { Patient } from '../patient/entities/patient.entity';
import { Sensor } from '../sensor/entities/sensor.entity';
import { SensorType } from '../sensor-type/entities/sensor-type.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bed,
      BedAssignment,
      BedSensor,
      NotificationHistory,
      Patient,
      Sensor,
      SensorType,
      User,
    ]),
  ],
  controllers: [BedController, BedAssignmentController],
  providers: [BedService, BedAssignmentService],
  exports: [BedService, BedAssignmentService],
})
export class BedModule {}
