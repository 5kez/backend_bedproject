import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentBuilding } from './entities/department-building.entity';
import { DepartmentBuildingService } from './department-building.service';
import { DepartmentBuildingController } from './department-building.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DepartmentBuilding])],
  controllers: [DepartmentBuildingController],
  providers: [DepartmentBuildingService],
  exports: [DepartmentBuildingService],
})
export class DepartmentBuildingModule {}
