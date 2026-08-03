import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitesTypeService } from './sites-type.service';
import { SitesTypeController } from './sites-type.controller';
import { SitesType } from './entities/sites-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SitesType])],
  controllers: [SitesTypeController],
  providers: [SitesTypeService],
})
export class SitesTypeModule {}
