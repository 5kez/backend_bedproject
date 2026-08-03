import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientHistory } from './entities/patient-history.entity';
import { PatientHistoryController } from './patient-history.controller';
import { PatientHistoryService } from './patient-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([PatientHistory])],
  controllers: [PatientHistoryController],
  providers: [PatientHistoryService],
  exports: [PatientHistoryService],
})
export class PatientHistoryModule {}
