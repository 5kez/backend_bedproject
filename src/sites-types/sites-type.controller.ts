import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SitesTypeService } from './sites-type.service';
import { CreateSitesTypeDto } from './dto/create-sites-type.dto';
import { UpdateSitesTypeDto } from './dto/update-sites-type.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('sites-type')
@Controller('sites-type')
export class SitesTypeController {
  constructor(private readonly service: SitesTypeService) {}

  @Post()
  create(@Body() dto: CreateSitesTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSitesTypeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
