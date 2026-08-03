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
import { DepartmentBuildingService } from './department-building.service';
import { CreateDepartmentBuildingDto } from './dto/create-department-building.dto';
import { UpdateDepartmentBuildingDto } from './dto/update-department-building.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('department-buildings')
@Controller('department-buildings')
export class DepartmentBuildingController {
  constructor(private readonly service: DepartmentBuildingService) {}

  @Post()
  create(@Body() dto: CreateDepartmentBuildingDto) {
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
    @Body() dto: UpdateDepartmentBuildingDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
