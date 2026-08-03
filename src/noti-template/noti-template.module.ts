import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotiTemplateService } from './noti-template.service';
import { NotiTemplateController } from './noti-template.controller';
import { NotificationTemplate } from './entities/noti-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate])],
  controllers: [NotiTemplateController],
  providers: [NotiTemplateService],
})
export class NotiTemplateModule {}
