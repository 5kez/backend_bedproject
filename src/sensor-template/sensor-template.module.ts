import { Module } from '@nestjs/common';
import { SensorTemplateController } from './sensor-template.controller';
import { SensorTemplateService } from './sensor-templateservice';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorTemplate } from './entities/sensor-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SensorTemplate])],
  providers: [SensorTemplateService],
  controllers: [SensorTemplateController],
  exports: [SensorTemplateService, TypeOrmModule],
})
export class SensorTemplatesModule {}
