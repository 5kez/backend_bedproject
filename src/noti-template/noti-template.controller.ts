import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotiTemplateService } from './noti-template.service';
import { CreateNotiTemplateDto } from './dto/create-noti-template.dto';
import { UpdateNotiTemplateDto } from './dto/update-noti-template.dto';

@Controller('noti-template')
export class NotiTemplateController {
  constructor(private readonly notiTemplateService: NotiTemplateService) {}

  @Post()
  create(@Body() createDto: CreateNotiTemplateDto) {
    return this.notiTemplateService.create(createDto);
  }

  @Get()
  findAll() {
    return this.notiTemplateService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.notiTemplateService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateDto: UpdateNotiTemplateDto) {
    return this.notiTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.notiTemplateService.remove(id);
  }
}
