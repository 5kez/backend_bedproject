import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department, DepartmentBuilding])],
  controllers: [DepartmentController],
  providers: [DepartmentService],
  exports: [DepartmentService],
})
export class DepartmentModule {}
