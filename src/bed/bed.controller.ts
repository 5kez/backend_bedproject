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
import { BedService } from './bed.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('beds')
@Controller('beds')
export class BedController {
  constructor(private readonly service: BedService) {}

  @Post()
  create(@Body() dto: CreateBedDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('department/:departmentId')
  findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    return this.service.findByDepartment(departmentId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBedDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
